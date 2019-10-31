import * as path from "path";
import * as semver from "semver";
import { Log } from "../Log/Log";
import { PackageStore } from "../PackageStore/PackageStore";
import { PackageStoreManager } from "../PackageStoreManager/PackageStoreManager";
import { PackageRegistryManager } from "../PackageRegistryManager/PackageRegistryManager";
import { PackageStoreCacheMemory } from "../PackageStoreCache/Memory/PackageStoreCacheMemory";
import { PackageStoreCacheDisk } from "../PackageStoreCache/Disk/PackageStoreCacheDisk";
import { IPackageStoreCache } from "../PackageStoreCache/IPackageStoreCache";
import { IManifest } from "../Manifest/IManifest";
import { ModuleCompile } from "../ModuleCompile/ModuleCompile";
import { SandBox } from "../ModuleCompile/SandBox";
import { Context } from "vm";
import { LogLevelEnum, LogCodeEnum } from "../Log/ILog";
import { IInvokeContext } from "../InvokeContext/IInvokeContext";
import { ModuleCompileManifestData } from "../ModuleCompile/ModuleCompileManifestData";
import { ModuleManagerRequireContextData } from "./ModuleManagerRequireContextData";
import { ModuleManagerCacheObjectItem } from "./ModuleManagerCacheObjectItem";
import { SmallManifest } from "../Manifest/SmallManifest";

const nativeModule = require("module");

/**
 * manager Module
 */
export class ModuleManager {
    private log: Log;
    private moduleCompile: ModuleCompile;
    private packageStoreManager: PackageStoreManager;
    private sandBoxContext: Context = SandBox.SandBoxBuilderContext();
    private cacheByRootPackageStore: Map<string, IPackageStoreCache> = new Map<string, IPackageStoreCache>();
    private cacheObject: Map<string, ModuleManagerCacheObjectItem> = new Map<string, ModuleManagerCacheObjectItem>();
    
    constructor(packageStoreManager?: PackageStoreManager, log?: Log){
        this.log = log || Log.getInstance();

        if (packageStoreManager){
            this.packageStoreManager = packageStoreManager;
        }
        else{
            //TODO: CHECK CONFIG FILE

            let packageRegistryManager = new PackageRegistryManager(this.log);
            packageRegistryManager.loadDefaultRegistries();

            let diskPackageStore = new PackageStoreCacheDisk();
            
            this.packageStoreManager = new PackageStoreManager(packageRegistryManager, diskPackageStore, this.log);
        }

        this.moduleCompile = new ModuleCompile(this.log);

        this.sandBoxContext = SandBox.SandBoxBuilderContext();
    }

    /**
     * return packageStoreManager
     */
    getPackageStoreManager(): PackageStoreManager{
        return this.packageStoreManager;
    }

    private parsePackageName(name: string){
        //example: uuid/v1
        var listName: string[] = name.split("/");
        return {
            name: listName[0],
            subModuleName: listName[1] || null,
            fullName: name
        }
    }

    private addObjectToCache(packageName: string, packageVersion: string, itemKey: string, obj: Object){
        var packageKey: string = packageName + ":" + packageVersion;
        var cacheModuleManagerItem = this.cacheObject.get(packageKey);
        if (!cacheModuleManagerItem){
            cacheModuleManagerItem = new ModuleManagerCacheObjectItem(packageName, packageVersion);
            this.cacheObject.set(packageKey, cacheModuleManagerItem);
        }
        cacheModuleManagerItem.setObjectToCache(itemKey, obj);
    }

    private getObjectFromCache(packageName: string, packageVersion: string, itemKey: string): Object | null{
        var packageKey: string = packageName + ":" + packageVersion;
        var cacheModuleManagerItem = this.cacheObject.get(packageKey);
        if (cacheModuleManagerItem){
            return cacheModuleManagerItem.getObjectFromCache(itemKey);
        }
        else{
            return null;
        }
    }

    private getSmallManifest(packageName: string): Promise<SmallManifest | null>{
        return new Promise(async (resolve, reject) => {
            try {
                var smallManifestResponse: SmallManifest | null = <SmallManifest | null> this.getObjectFromCache(packageName, "", "smallmanifest");
                
                if (smallManifestResponse){
                    resolve(smallManifestResponse);
                }
                else{
                    let packageStoreManifest: PackageStore | null = await this.packageStoreManager.getPackageStore(packageName);
                    if (packageStoreManifest){
                        let manifestResponse = packageStoreManifest.getManifest();
                        if (manifestResponse){
                            smallManifestResponse = new SmallManifest(manifestResponse.name, Object.keys(manifestResponse.versions || {}));
                            this.addObjectToCache(packageName, "", "smallmanifest", smallManifestResponse);
                            resolve(smallManifestResponse);
                        }
                        else{
                            resolve(null);
                        }
                    }
                    else{
                        resolve(null);
                    }
                }                
            }
            catch (errTry) {
                reject(errTry);
            }
        })
    }

    private resolveVersion(packageName: string, packageVersion: string): Promise<string>{
        return new Promise(async (resolve, reject) => {
            try {
                if (semver.valid(packageVersion)){
                    resolve(packageVersion);
                }
                else{
                    var smallManifestResponse: SmallManifest | null = await this.getSmallManifest(packageName);
                    if (smallManifestResponse){
                        var versionTO: string = semver.maxSatisfying(smallManifestResponse.versionsArray, packageVersion) || "";
                        if (versionTO){
                            resolve(versionTO);
                        }
                        else{
                            reject("Version not resolved: " + packageVersion);
                        }
                    }
                    else{
                        reject("Manifest " + packageName + " not found");
                    }
                }
            }
            catch (errTry) {
                reject(errTry);
            }
        })
    }

    private requireSync(name: string, version: string, moduleManagerRequireContextData: ModuleManagerRequireContextData, parentModuleCompileManifestData?: ModuleCompileManifestData): Object | null{
        if (nativeModule.builtinModules.indexOf(name) > -1){
            //native module
            return require(name);
        }

        //find packageStore in cache
        var cacheRootPackageStore: IPackageStoreCache | undefined = this.cacheByRootPackageStore.get(moduleManagerRequireContextData.rootPackageStoreKey);
        if (cacheRootPackageStore){
            var codeBuffer: Buffer | null = null;
            var responseObj: Object | null = null;
            var moduleCompileManifestData: ModuleCompileManifestData | null = null;

            if (name.substring(0,1) === "."){
                //require internal package
                if (parentModuleCompileManifestData){
                    let internalFileFullPath: string = path.resolve("/" + parentModuleCompileManifestData.mainFileDirName, name).substring(1);

                    //find in module cache
                    responseObj = this.getObjectFromCache(moduleManagerRequireContextData.parentPackageStoreName, moduleManagerRequireContextData.parentPackageStoreVersion, internalFileFullPath);
                    if (responseObj){
                        return responseObj;
                    }

                    let parentPackageStore: PackageStore | null = cacheRootPackageStore.getPackageStoreSync(moduleManagerRequireContextData.parentPackageStoreName, moduleManagerRequireContextData.parentPackageStoreVersion);
                    if (parentPackageStore){
                        codeBuffer = parentPackageStore.getItemBuffer(internalFileFullPath);
                        moduleCompileManifestData = new ModuleCompileManifestData(
                            parentPackageStore.getName(),
                            parentPackageStore.getVersion(),
                            internalFileFullPath
                        );
                    }

                    if (moduleCompileManifestData && codeBuffer){
                        responseObj = this.compilePackage(moduleManagerRequireContextData, moduleCompileManifestData, codeBuffer);
                        if (responseObj){
                            this.addObjectToCache(moduleManagerRequireContextData.parentPackageStoreName, moduleManagerRequireContextData.parentPackageStoreVersion, internalFileFullPath, responseObj);
                            return responseObj;
                        }
                    }
                }
            }
            else{
                //require external package

                var nameParsedObj = this.parsePackageName(name);

                //if not version exist, seek version in parent package.json
                if (version === "" && moduleManagerRequireContextData.parentPackageStoreName){
                    let parentPackageStore: PackageStore | null = cacheRootPackageStore.getPackageStoreSync(moduleManagerRequireContextData.parentPackageStoreName, moduleManagerRequireContextData.parentPackageStoreVersion);
                    if (parentPackageStore){
                        let parentPackageManifest: IManifest | null = parentPackageStore.getManifest();
                        if (parentPackageManifest && parentPackageManifest.dependencies){
                            version = parentPackageManifest.dependencies[nameParsedObj.name] || "";
                        }
                    }
                }

                //find in module cache
                responseObj = this.getObjectFromCache(nameParsedObj.fullName, version, "");
                if (responseObj){
                    return responseObj;
                }

                let packageStore: PackageStore | null = cacheRootPackageStore.getPackageStoreSync(nameParsedObj.name, version);
                if (packageStore){
                    if (nameParsedObj.subModuleName){
                        codeBuffer = packageStore.getItemBuffer(nameParsedObj.subModuleName);
                    }
                    else{
                        codeBuffer = packageStore.getMainBuffer();
                    }
                    moduleCompileManifestData = new ModuleCompileManifestData(
                        packageStore.getName(),
                        packageStore.getVersion(),
                        packageStore.getMainFileFullPath()
                    );
                }

                if (packageStore && moduleCompileManifestData && codeBuffer){
                    responseObj = this.compilePackage(moduleManagerRequireContextData, moduleCompileManifestData, codeBuffer);
                    if (responseObj){
                        this.addObjectToCache(nameParsedObj.fullName, version, "", responseObj);
                        return responseObj;
                    }
                }
            }
            
            return null;
        }
        else{
            return null;
        }
    }

    private compilePackage(moduleManagerRequireContextData: ModuleManagerRequireContextData, moduleCompileManifestData: ModuleCompileManifestData, codeBuffer: Buffer | null): Object | null{
        try {
            if (moduleCompileManifestData.mainFileFullPath.substring(moduleCompileManifestData.mainFileFullPath.lastIndexOf(".")).toUpperCase() === ".JSON"){
                //JSON
                if (codeBuffer){
                    return JSON.parse(codeBuffer.toString());
                }
                else{
                    return null;
                }
            }
    
            var moduleManagerRequireContextDataDependency: ModuleManagerRequireContextData = new ModuleManagerRequireContextData(moduleManagerRequireContextData.rootPackageStoreKey);
            moduleManagerRequireContextDataDependency.parentPackageStoreName = moduleCompileManifestData.name;
            moduleManagerRequireContextDataDependency.parentPackageStoreVersion = moduleCompileManifestData.version;
    
            var globalRequire = (path: string): any => {
                this.log.write(LogLevelEnum.DEBUG, "processRequire", LogCodeEnum.PROCESS.toString(), path, moduleCompileManifestData, __filename);
    
                return this.requireSync(path, "", moduleManagerRequireContextDataDependency, moduleCompileManifestData);
            }
    
            if (codeBuffer){
                var newModule = this.moduleCompile.compile(codeBuffer.toString(), moduleCompileManifestData, this.sandBoxContext, globalRequire);
                codeBuffer = null; //clean memory!!!!!!!!! not remove!
                return newModule.exports || null;
            }
            else{
                return null;
            }            
        }
        catch (errTry) {
            var errDetail: any = {};
            errDetail.moduleManagerRequireContextData = moduleManagerRequireContextData;
            errDetail.moduleCompileManifestData = moduleCompileManifestData;
            this.log.writeError("compilePackage", errTry, errDetail, __filename);
            throw errTry;
        }
    }

    /**
     * 
     * @param name module name
     * @param version module version
     * @param etag module etag 
     */
    import(name: string, version: string, etag?: string): Promise<Object | null>{
        return new Promise(async (resolve, reject) => {
            try {
                var nameParsedObj = this.parsePackageName(name);
                var responseModuleObj : Object | null;
                var versionResolved: string = await this.resolveVersion(nameParsedObj.name, version);

                //verify cache
                responseModuleObj = this.getObjectFromCache(nameParsedObj.fullName, versionResolved, "");
                if (responseModuleObj){
                    resolve(responseModuleObj);
                    return;
                }

                let packageStore: PackageStore | null = await this.packageStoreManager.getPackageStore(nameParsedObj.name, versionResolved, etag);
                if (packageStore){
                    var rootPackageStoreKey: string = packageStore.getKey();
                    var contextCache: PackageStoreCacheMemory = new PackageStoreCacheMemory();

                    await this.importDependencies(packageStore, contextCache);

                    contextCache.putPackageStore(packageStore); //set rootPackageStore in cache

                    var moduleManagerRequireContextData: ModuleManagerRequireContextData = new ModuleManagerRequireContextData(rootPackageStoreKey);
                    
                    //add temporary cache
                    this.cacheByRootPackageStore.set(rootPackageStoreKey, contextCache);

                    responseModuleObj = this.requireSync(nameParsedObj.fullName, versionResolved, moduleManagerRequireContextData);

                    //remove temporary cache
                    this.cacheByRootPackageStore.delete(rootPackageStoreKey);

                    resolve(responseModuleObj);
                }
                else{
                    resolve(null);
                }
            }
            catch (errTry) {
                reject(errTry);
            }
        })
    }

    /**
     * import dependencies in package
     * @param packageStore 
     * @param contextCache 
     */
    private importDependencies(packageStore: PackageStore, contextCache?: IPackageStoreCache): Promise<null>{
        return new Promise(async (resolve, reject) => {
            try {
                var packageManifestObj: IManifest | null = packageStore.getManifest();

                if (packageManifestObj && packageManifestObj.dependencies){
                    var dependencyKeys = Object.keys(packageManifestObj.dependencies);
    
                    for (var i = 0; i < dependencyKeys.length; i++){
                        var nameDependency: string = dependencyKeys[i];
                        var versionDependency: string = packageManifestObj.dependencies[nameDependency] || "";
                        var versionDependencyResolved: string = await this.resolveVersion(nameDependency, versionDependency);
    
                        packageManifestObj.dependencies[nameDependency] = versionDependencyResolved //resolve version
    
                        var packageStoreDependency: PackageStore | null = await this.packageStoreManager.getPackageStore(nameDependency, versionDependencyResolved);
                        if (packageStoreDependency){
                            //cache
                            if (contextCache){
                                contextCache.putPackageStore(packageStoreDependency);
                            }

                            this.log.write(LogLevelEnum.INFO, "importDependencies", LogCodeEnum.PROCESS.toString(), packageStore.getName(), {nameDependency:nameDependency, versionDependency:versionDependencyResolved}, __filename);
        
                            await this.importDependencies(packageStoreDependency, contextCache);
                        }
                        else{
                            reject("Package " + packageStore.getName() + ". Dependency " + nameDependency + ":" + versionDependencyResolved + " not found.");
                            return;
                        }
                    }
                }
    
                resolve(null);                
            }
            catch (errTry) {
                reject(errTry);
            }
        })
    }
}