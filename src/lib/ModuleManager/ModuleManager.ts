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

    private addObjectToCache(packageName: string, packageVersion: string, key: string, obj: Object){
        var cacheModuleManagerItem = this.cacheObject.get(packageName + ":" + packageVersion);
        if (!cacheModuleManagerItem){
            cacheModuleManagerItem = new ModuleManagerCacheObjectItem(packageName, packageVersion);
        }
        cacheModuleManagerItem.setObjectToCache(key, obj);
    }

    private getObjectFromCache(packageName: string, packageVersion: string, key: string): Object | null{
        var cacheModuleManagerItem = this.cacheObject.get(packageName + ":" + packageVersion);
        if (cacheModuleManagerItem){
            return cacheModuleManagerItem.getObjectFromCache(key);
        }
        else{
            return null;
        }
    }

    private getManifestFromCache(packageName: string): IManifest | null{
        var obj: Object | null = this.getObjectFromCache(packageName, "", "manifest");
        if (obj){
            return <IManifest> obj;
        }
        else{
            return null;
        }
    }

    private updateManifestToCache(newManifest: IManifest) {
        var currentManifest: IManifest | null = this.getManifestFromCache(newManifest.name);
        if (currentManifest){
            if (semver.gt(newManifest.version || "", currentManifest.version || "")){
                this.addObjectToCache(name, "", "manifest", newManifest);
            }
        }
        else{
            this.addObjectToCache(name, "", "manifest", newManifest);
        }
    }

    private requireSync(name: string, version: string, moduleManagerRequireContextData: ModuleManagerRequireContextData, parentModuleCompileManifestData?: ModuleCompileManifestData): Object | null{
        
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

                //if not version exist, seek version in parent package.json
                if (version === "" && moduleManagerRequireContextData.parentPackageStoreName){
                    let parentPackageStore: PackageStore | null = cacheRootPackageStore.getPackageStoreSync(moduleManagerRequireContextData.parentPackageStoreName, moduleManagerRequireContextData.parentPackageStoreVersion);
                    if (parentPackageStore){
                        let parentPackageManifest: IManifest | null = parentPackageStore.getManifest();
                        if (parentPackageManifest && parentPackageManifest.dependencies){
                            version = parentPackageManifest.dependencies[name] || "";
                        }
                    }
                }

                if (semver.valid(version) === null){
                    let manifest: IManifest | null;
                    manifest = this.getManifestFromCache(name);
                    if (manifest){
                        //discovery real version
                        version = semver.maxSatisfying(manifest.versionsArray, version) || "**notfound**";
                    }
                    else{
                        return null;
                    }
                }

                //find in module cache
                responseObj = this.getObjectFromCache(name, version, "");
                if (responseObj){
                    return responseObj;
                }

                let packageStore: PackageStore | null = cacheRootPackageStore.getPackageStoreSync(name, version);
                if (packageStore){
                    codeBuffer = packageStore.getMainBuffer();
                    moduleCompileManifestData = new ModuleCompileManifestData(
                        packageStore.getName(),
                        packageStore.getVersion(),
                        packageStore.getMainFileFullPath()
                    );
                }

                if (packageStore && moduleCompileManifestData && codeBuffer){
                    responseObj = this.compilePackage(moduleManagerRequireContextData, moduleCompileManifestData, codeBuffer);
                    if (responseObj){
                        this.addObjectToCache(name, version, "", responseObj);
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
            return newModule;
        }
        else{
            return null;
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
            var responseModuleObj : Object | null;
            let manifest: IManifest | null;

            manifest = this.getManifestFromCache(name);
            if (!manifest){
                let packageStoreManifest: PackageStore | null = await this.packageStoreManager.getPackageStore(name);
                if (packageStoreManifest){
                    //update manifest
                    manifest = packageStoreManifest.getManifest();
                    if (manifest){
                        //build versions array
                        manifest.versionsArray = Object.keys(manifest.versions || {});
                        this.updateManifestToCache(manifest);
                    }
                }
            }


            if (manifest){
                if (semver.valid(version) === null){
                    //discovery real version
                    version = semver.maxSatisfying(manifest.versionsArray, version) || "**notfound**";;
                }
    
                //verify cache
                responseModuleObj = this.getObjectFromCache(name, version, "");
                if (responseModuleObj){
                    resolve(responseModuleObj);
                    return;
                }

                let packageStore: PackageStore | null = await this.packageStoreManager.getPackageStore(name, version, etag);
                if (packageStore){
                    var rootPackageStoreKey: string = packageStore.getKey();
                    var contextCache: PackageStoreCacheMemory = new PackageStoreCacheMemory();
    
                    await this.importDependencies(packageStore, contextCache);
    
                    contextCache.putPackageStore(packageStore); //set rootPackageStore in cache
    
                    var moduleManagerRequireContextData: ModuleManagerRequireContextData = new ModuleManagerRequireContextData(rootPackageStoreKey);
                    
                    //add temporary cache
                    this.cacheByRootPackageStore.set(rootPackageStoreKey, contextCache);
    
                    responseModuleObj = this.requireSync(name, version, moduleManagerRequireContextData);
    
                    //remove temporary cache
                    this.cacheByRootPackageStore.delete(rootPackageStoreKey);
        
                    resolve(responseModuleObj);
                }
                else{
                    resolve(null);
                }
            }
            else{
                resolve(null);
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
            var packageManifestObj: IManifest | null = packageStore.getManifest();

            if (packageManifestObj && packageManifestObj.dependencies){
                var dependencyKeys = Object.keys(packageManifestObj.dependencies);

                for (var i = 0; i < dependencyKeys.length; i++){
                    var nameDependency: string = dependencyKeys[i];
                    var versionDependency: string = packageManifestObj.dependencies[nameDependency];

                    console.log("*** dependency", packageStore.getName(), " => ", nameDependency + ":" + versionDependency);

                    var packageStoreDependency: PackageStore | null = await this.packageStoreManager.getPackageStore(nameDependency, versionDependency);
                    if (packageStoreDependency){
                        //cache
                        if (contextCache){
                            contextCache.putPackageStore(packageStoreDependency);
                        }
    
                        await this.importDependencies(packageStoreDependency, contextCache);
                    }
                    else{
                        reject("Package " + packageStore.getName() + ". Dependency " + nameDependency + ":" + versionDependency + " not found.");
                        return;
                    }
                }
            }

            resolve(null);
        })
    }
}