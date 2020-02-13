import * as path from "path";
import { Log } from "../Log/Log";
import { types } from "util"
import { PackageStore } from "../PackageStore/PackageStore";
import { PackageStoreManager } from "../PackageStoreManager/PackageStoreManager";
import { PackageRegistryManager } from "../PackageRegistryManager/PackageRegistryManager";
import { IPackageStoreCacheSync } from "../PackageStoreCache/IPackageStoreCacheSync";
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
import { WebFaasError } from "../WebFaasError/WebFaasError";
import { PackageStoreItemBufferResponse } from "../PackageStore/PackageStoreItemBufferResponse";
import { PackageStoreCacheMemorySync } from "../PackageStoreCache/Memory/PackageStoreCacheMemorySync";
import { ISemver } from "../Semver/ISemver";
import { SmallSemver } from "../Semver/SmallSemver";
import { ModuleNameUtil, IModuleNameData } from "../Util/ModuleNameUtil";

const nativeModule = require("module");

/**
 * manager Module
 */
export class ModuleManager {
    private log: Log;
    private moduleCompile: ModuleCompile;
    private packageStoreManager: PackageStoreManager;
    private sandBoxContext: Context = SandBox.SandBoxBuilderContext();
    private cachePackageStoreDependencies: Map<string, IPackageStoreCacheSync> = new Map<string, IPackageStoreCacheSync>();
    private cacheCompiledObject: Map<string, ModuleManagerCacheObjectItem> = new Map<string, ModuleManagerCacheObjectItem>();
    private semver: ISemver = new SmallSemver();
    
    constructor(packageStoreManager?: PackageStoreManager, log?: Log){
        this.log = log || Log.getInstance();

        if (packageStoreManager){
            this.packageStoreManager = packageStoreManager;
        }
        else{
            let packageRegistryManager = new PackageRegistryManager(this.log);

            this.packageStoreManager = new PackageStoreManager(packageRegistryManager, this.log);
        }

        this.moduleCompile = new ModuleCompile(this.log);

        this.sandBoxContext = SandBox.SandBoxBuilderContext();
    }

    getSemver(): ISemver{
        return this.semver;
    }
    setSemver(semver: ISemver){
        this.semver = semver;
    }

    getCacheCompiledObject(): Map<string, ModuleManagerCacheObjectItem>{
        return this.cacheCompiledObject;
    }

    getCompiledObjectFromCache(packageName: string, packageVersion: string, itemKey: string): Object | null{
        var packageKey: string = packageName + ":" + packageVersion;
        var cacheModuleManagerItem = this.cacheCompiledObject.get(packageKey);
        if (cacheModuleManagerItem){
            return cacheModuleManagerItem.getObjectFromCache(itemKey);
        }
        else{
            return null;
        }
    }

    addCompiledObjectToCache(packageName: string, packageVersion: string, itemKey: string, obj: Object): void{
        var packageKey: string = packageName + ":" + packageVersion;
        var cacheModuleManagerItem = this.cacheCompiledObject.get(packageKey);
        if (!cacheModuleManagerItem){
            cacheModuleManagerItem = new ModuleManagerCacheObjectItem(packageName, packageVersion);
            this.cacheCompiledObject.set(packageKey, cacheModuleManagerItem);
        }
        cacheModuleManagerItem.setObjectToCache(itemKey, obj);
    }

    getSmallManifest(packageName: string): Promise<SmallManifest | null>{
        return new Promise(async (resolve, reject) => {
            try {
                var smallManifestResponse: SmallManifest | null = <SmallManifest | null> this.getCompiledObjectFromCache(packageName, "", "smallmanifest");
                
                if (smallManifestResponse){
                    resolve(smallManifestResponse);
                }
                else{
                    let packageStoreManifest: PackageStore | null = await this.packageStoreManager.getPackageStore(packageName);
                    if (packageStoreManifest){
                        let manifestResponse = packageStoreManifest.getManifest();
                        if (manifestResponse){
                            smallManifestResponse = new SmallManifest(manifestResponse.name, Object.keys(manifestResponse.versions || {}));
                            this.addCompiledObjectToCache(packageName, "", "smallmanifest", smallManifestResponse);
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

    /**
     * return packageStoreManager
     */
    getPackageStoreManager(): PackageStoreManager{
        return this.packageStoreManager;
    }

    cachePackageStoreDependenciesItemBuild(): IPackageStoreCacheSync{
        return new PackageStoreCacheMemorySync();
    }

    resolveVersion(packageName: string, packageVersion: string): Promise<string>{
        return new Promise(async (resolve, reject) => {
            try {
                if (this.getSemver().valid(packageVersion)){
                    resolve(packageVersion);
                }
                else{
                    var smallManifestResponse: SmallManifest | null = await this.getSmallManifest(packageName);
                    if (smallManifestResponse){
                        var versionTO: string = this.getSemver().maxSatisfying(smallManifestResponse.versionsArray, packageVersion) || "";
                        if (versionTO){
                            resolve(versionTO);
                        }
                        else{
                            reject(new WebFaasError.NotFoundError(WebFaasError.NotFoundErrorTypeEnum.VERSION, packageName + ":" + packageVersion));
                        }
                    }
                    else{
                        reject(new WebFaasError.NotFoundError(WebFaasError.NotFoundErrorTypeEnum.MANIFEST, packageName));
                    }
                }
            }
            catch (errTry) {
                reject(errTry);
            }
        })
    }

    requireNativeModule(name: string, moduleManagerRequireContextData: ModuleManagerRequireContextData, parentModuleCompileManifestData?: ModuleCompileManifestData): any{
        //native module
        return require(name);
    }

    requireSync(name: string, version: string, moduleManagerRequireContextData: ModuleManagerRequireContextData, parentModuleCompileManifestData?: ModuleCompileManifestData): Object | null{
        if (nativeModule.builtinModules.indexOf(name) > -1){
            return this.requireNativeModule(name, moduleManagerRequireContextData, parentModuleCompileManifestData);
        }

        //find packageStore in cache
        var cacheRootPackageStore: IPackageStoreCacheSync | undefined = this.cachePackageStoreDependencies.get(moduleManagerRequireContextData.rootPackageStoreKey);
        if (cacheRootPackageStore){
            let codeBufferResponse: PackageStoreItemBufferResponse | null = null;
            //var codeBuffer: Buffer | null = null;
            var responseObj: Object | null = null;
            var moduleCompileManifestData: ModuleCompileManifestData | null = null;

            if (name.substring(0,1) === "."){
                //
                //require internal package
                //
                if (parentModuleCompileManifestData){
                    let internalFileFullPath: string = path.resolve("/" + parentModuleCompileManifestData.mainFileDirName, name).substring(1);

                    //find in module cache
                    responseObj = this.getCompiledObjectFromCache(moduleManagerRequireContextData.parentPackageStoreName, moduleManagerRequireContextData.parentPackageStoreVersion, internalFileFullPath);
                    if (responseObj){
                        return responseObj;
                    }

                    let parentPackageStore: PackageStore | null = cacheRootPackageStore.getPackageStore(moduleManagerRequireContextData.parentPackageStoreName, moduleManagerRequireContextData.parentPackageStoreVersion);
                    if (parentPackageStore){
                        codeBufferResponse = parentPackageStore.getItemBuffer(internalFileFullPath);
                        moduleCompileManifestData = new ModuleCompileManifestData(
                            parentPackageStore.getName(),
                            parentPackageStore.getVersion(),
                            internalFileFullPath
                        );
                    }

                    if (moduleCompileManifestData && codeBufferResponse){
                        responseObj = this.compilePackageStoreItemBuffer(codeBufferResponse, moduleManagerRequireContextData, moduleCompileManifestData);
                        if (responseObj){
                            this.addCompiledObjectToCache(moduleManagerRequireContextData.parentPackageStoreName, moduleManagerRequireContextData.parentPackageStoreVersion, internalFileFullPath, responseObj);
                            return responseObj;
                        }
                    }
                }
            }
            else{
                //
                //require external package
                //

                var nameParsedObj: IModuleNameData = ModuleNameUtil.parse(name, "");
                
                //if not version exist, seek version in parent package.json
                if (version === "" && moduleManagerRequireContextData.parentPackageStoreName){
                    let parentPackageStore: PackageStore | null = cacheRootPackageStore.getPackageStore(moduleManagerRequireContextData.parentPackageStoreName, moduleManagerRequireContextData.parentPackageStoreVersion);
                    if (parentPackageStore){
                        let parentPackageManifest: IManifest | null = parentPackageStore.getManifest();
                        if (parentPackageManifest && parentPackageManifest.dependencies){
                            version = parentPackageManifest.dependencies[nameParsedObj.moduleName] || "";
                        }
                    }
                }

                //find in module cache
                responseObj = this.getCompiledObjectFromCache(nameParsedObj.fullName, version, "");
                if (responseObj){
                    return responseObj;
                }

                let packageStore: PackageStore | null = cacheRootPackageStore.getPackageStore(nameParsedObj.moduleName, version);
                if (packageStore){
                    if (nameParsedObj.fileName){
                        codeBufferResponse = packageStore.getItemBuffer(nameParsedObj.fileName);
                    }
                    else{
                        codeBufferResponse = packageStore.getMainBuffer();
                    }
                    moduleCompileManifestData = new ModuleCompileManifestData(
                        packageStore.getName(),
                        packageStore.getVersion(),
                        packageStore.getMainFileFullPath()
                    );
                }

                if (packageStore && moduleCompileManifestData && codeBufferResponse){
                    responseObj = this.compilePackageStoreItemBuffer(codeBufferResponse, moduleManagerRequireContextData, moduleCompileManifestData);
                    if (responseObj){
                        this.addCompiledObjectToCache(nameParsedObj.fullName, version, "", responseObj);
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

    compilePackageStoreItemBuffer(itemBufferResponse: PackageStoreItemBufferResponse, moduleManagerRequireContextData: ModuleManagerRequireContextData, moduleCompileManifestData: ModuleCompileManifestData): Object | null{
        var responseObj: Object | null = null;
        if (itemBufferResponse.extension === ".json"){
            responseObj = JSON.parse(itemBufferResponse.buffer.toString());
        }
        else{
            responseObj = this.compilePackage(moduleManagerRequireContextData, moduleCompileManifestData, itemBufferResponse.buffer);
        }
        return responseObj;
    }

    compilePackage(moduleManagerRequireContextData: ModuleManagerRequireContextData, moduleCompileManifestData: ModuleCompileManifestData, codeBuffer: Buffer): Object | null{
        try {
            var moduleManagerRequireContextDataDependency: ModuleManagerRequireContextData = new ModuleManagerRequireContextData(moduleManagerRequireContextData.rootPackageStoreKey);
            moduleManagerRequireContextDataDependency.parentPackageStoreName = moduleCompileManifestData.name;
            moduleManagerRequireContextDataDependency.parentPackageStoreVersion = moduleCompileManifestData.version;
    
            var globalRequire = (path: string): any => {
                this.log.write(LogLevelEnum.DEBUG, "processRequire", LogCodeEnum.PROCESS.toString(), path, moduleCompileManifestData, __filename);

                let responseModule = this.requireSync(path, "", moduleManagerRequireContextDataDependency, moduleCompileManifestData);
                if (responseModule){
                    return responseModule;
                }
                else{
                    this.log.write(LogLevelEnum.ERROR, "processRequire", LogCodeEnum.OPENFILE.toString(), path, moduleCompileManifestData, __filename);
                    throw new Error("Cannot find module '" + path + "'");
                }
            }
    
            var newModule = this.moduleCompile.compile(codeBuffer.toString(), moduleCompileManifestData, this.sandBoxContext, globalRequire);
            if (newModule.exports){
                return newModule.exports;
            }
            else{
                if (newModule.__esModule){
                    return newModule;
                }
                else{
                    return null;
                }
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
     * import dependencies in package
     * @param packageStore 
     * @param contextCache 
     */
    importDependencies(packageStore: PackageStore, cachePackageStoreDependenciesItem?: IPackageStoreCacheSync): Promise<null>{
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
                            if (cachePackageStoreDependenciesItem){
                                cachePackageStoreDependenciesItem.putPackageStore(packageStoreDependency);
                            }

                            this.log.write(LogLevelEnum.INFO, "importDependencies", LogCodeEnum.PROCESS.toString(), packageStore.getName(), {nameDependency:nameDependency, versionDependency:versionDependencyResolved}, __filename);
        
                            await this.importDependencies(packageStoreDependency, cachePackageStoreDependenciesItem);
                        }
                        else{
                            reject(new WebFaasError.NotFoundError(WebFaasError.NotFoundErrorTypeEnum.DEPENDENCY, packageStore.getName() + " => " + nameDependency + ":" + versionDependencyResolved));
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

    /**
     * import module
     * @param name module name
     * @param version module version
     * @param etag module etag 
     */
    import(name: string, version: string, etag?: string, registryName?: string, imediateCleanMemoryCacheModuleFiles = true): Promise<Object | null>{
        return new Promise(async (resolve, reject) => {
            try {
                var nameParsedObj: IModuleNameData = ModuleNameUtil.parse(name, "");
                var responseModuleObj : Object | null;
                var versionResolved: string = await this.resolveVersion(nameParsedObj.moduleName, version);

                //verify cache
                responseModuleObj = this.getCompiledObjectFromCache(nameParsedObj.fullName, versionResolved, "");
                if (responseModuleObj){
                    resolve(responseModuleObj);
                    return;
                }

                let packageStore: PackageStore | null = await this.packageStoreManager.getPackageStore(nameParsedObj.moduleName, versionResolved, etag, registryName);
                if (packageStore){
                    let rootPackageStoreKey: string = packageStore.getKey();

                    let cachePackageStoreDependenciesItem = this.cachePackageStoreDependenciesItemBuild();

                    await this.importDependencies(packageStore, cachePackageStoreDependenciesItem);

                    //set rootPackageStore in cache
                    cachePackageStoreDependenciesItem.putPackageStore(packageStore);

                    let moduleManagerRequireContextData: ModuleManagerRequireContextData = new ModuleManagerRequireContextData(rootPackageStoreKey);
                    
                    //add all files in temporary memory cache
                    this.cachePackageStoreDependencies.set(rootPackageStoreKey, cachePackageStoreDependenciesItem);

                    responseModuleObj = this.requireSync(nameParsedObj.fullName, versionResolved, moduleManagerRequireContextData);

                    if (imediateCleanMemoryCacheModuleFiles){
                        //remove temporary cache
                        this.cleanCachePackageStoreDependencies(name, version);
                    }

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

    invokeAsyncByModuleObject(moduleObj: any, method?: string, parameter?: any[]): Promise<any>{
        return new Promise((resolve, reject) => {
            if (moduleObj){
                let targetInvoke: any;
                if (method){
                    targetInvoke = moduleObj[method];
                    if (targetInvoke === undefined){
                        //method not found
                        throw new WebFaasError.NotFoundError(WebFaasError.NotFoundErrorTypeEnum.FUNCMETHOD, method);
                    }
                }
                else{
                    targetInvoke = moduleObj;
                }

                if (typeof(targetInvoke) === "function"){
                    let targetFuncInvoke: Function = targetInvoke;
                    let responseCallInvoke: any;

                    try {
                        if (parameter){
                            switch (parameter.length){ //performance
                                case 1:
                                    responseCallInvoke = targetFuncInvoke(parameter[0]);
                                    break;
                                case 2:
                                    responseCallInvoke = targetFuncInvoke(parameter[0], parameter[1]);
                                    break;
                                default:
                                    responseCallInvoke = targetFuncInvoke.call(moduleObj, ...parameter);
                            }
                        }
                        else{
                            responseCallInvoke = targetFuncInvoke();
                        }
    
                        if (types.isPromise(responseCallInvoke)){
                            Promise.resolve(responseCallInvoke).then((responseAsyncCallInvoke: any) => {
                                resolve(responseAsyncCallInvoke);
                            }).catch((errTryPromise) => {
                                reject(new WebFaasError.InvokeError(errTryPromise));
                            });
                        }
                        else{
                            resolve(responseCallInvoke);
                        }
                    }
                    catch (errTryInvoke) {
                        reject(new WebFaasError.InvokeError(errTryInvoke));
                    }
                }
                else{
                    resolve(targetInvoke);
                }
            }
            else{
                resolve(null);
            }
        })
    }

    invokeAsync(name: string, version: string, method?: string, parameter?: any[], registryName?: string, imediateCleanMemoryCacheModuleFiles = true): Promise<any>{
        return new Promise(async (resolve, reject) => {
            this.import(name, version, undefined, registryName, false).then((moduleObj)=>{ //disable imediateCleanMemoryCacheModuleFiles in import
                if (moduleObj){
                    this.invokeAsyncByModuleObject(moduleObj, method, parameter).then((responseInvokeAsync)=>{
                        resolve(responseInvokeAsync);

                        //remove temporary cache
                        if (imediateCleanMemoryCacheModuleFiles) this.cleanCachePackageStoreDependencies(name, version);
                    }).catch((errInvokeAsync) => {
                        //remove temporary cache
                        if (imediateCleanMemoryCacheModuleFiles) this.cleanCachePackageStoreDependencies(name, version);

                        reject(errInvokeAsync);
                    });
                }
                else{
                    //remove temporary cache
                    if (imediateCleanMemoryCacheModuleFiles) this.cleanCachePackageStoreDependencies(name, version);

                    resolve(null);
                }
            }).catch((errImport) => {
                //remove temporary cache
                if (imediateCleanMemoryCacheModuleFiles) this.cleanCachePackageStoreDependencies(name, version);

                reject(errImport);
            });
        })
    }

    cleanCachePackageStoreDependencies(name: string, version: string) {
        var rootPackageStoreKey: string = PackageStore.parseKey(name, version);
        this.cachePackageStoreDependencies.delete(rootPackageStoreKey);
    }

    cleanCacheObjectCompiled(): void{
        this.cacheCompiledObject.clear();
    }
}