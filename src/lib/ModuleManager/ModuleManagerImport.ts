import { Log } from "../Log/Log";
import { PackageStore } from "../PackageStore/PackageStore";
import { PackageStoreManager } from "../PackageStoreManager/PackageStoreManager";
import { PackageRegistryManager } from "../PackageRegistryManager/PackageRegistryManager";
import { IPackageStoreCacheSync } from "../PackageStoreCache/IPackageStoreCacheSync";
import { IManifest } from "../Manifest/IManifest";
import { LogLevelEnum, LogCodeEnum } from "../Log/ILog";
import { ModuleManagerRequireContextData } from "./ModuleManagerRequireContextData";
import { SmallManifest } from "../Manifest/SmallManifest";
import { WebFaasError } from "../WebFaasError/WebFaasError";
import { ISemver } from "../Semver/ISemver";
import { SmallSemver } from "../Semver/SmallSemver";
import { ModuleNameUtil, IModuleNameData } from "../Util/ModuleNameUtil";
import { ModuleManager } from "../Core";

/**
 * manager Module
 */
export class ModuleManagerImport {
    private log: Log;
    private moduleManager: ModuleManager;
    private packageStoreManager: PackageStoreManager;
    private semver: ISemver;
    
    constructor(moduleManager: ModuleManager, log: Log, packageStoreManager?: PackageStoreManager){
        this.moduleManager = moduleManager;
        this.log = log;
        this.semver = new SmallSemver();

        if (packageStoreManager){
            this.packageStoreManager = packageStoreManager;
        }
        else{
            this.packageStoreManager = new PackageStoreManager(new PackageRegistryManager(this.log), this.log);
        }
    }

    /**
     * return semver
     */
    getSemver(): ISemver{
        return this.semver;
    }
    /**
     * set semver
     * @param semver 
     */
    setSemver(semver: ISemver){
        this.semver = semver;
    }

    /**
     * return packageStoreManager
     */
    getPackageStoreManager(): PackageStoreManager{
        return this.packageStoreManager;
    }

    /**
     * return small manifest
     * @param packageName package name
     */
    getSmallManifest(packageName: string): Promise<SmallManifest | null>{
        return new Promise(async (resolve, reject) => {
            try {
                var smallManifestResponse: SmallManifest | null = <SmallManifest | null> this.moduleManager.getModuleManagerCache().getCompiledObjectFromCache(packageName, "", "smallmanifest");
                
                if (smallManifestResponse){
                    resolve(smallManifestResponse);
                }
                else{
                    let packageStoreManifest: PackageStore | null = await this.packageStoreManager.getPackageStore(packageName);
                    if (packageStoreManifest){
                        let manifestResponse = packageStoreManifest.getManifest();
                        if (manifestResponse){
                            smallManifestResponse = new SmallManifest(manifestResponse.name, Object.keys(manifestResponse.versions || {}));
                            this.moduleManager.getModuleManagerCache().addCompiledObjectToCache(packageName, "", "smallmanifest", smallManifestResponse);
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
     * resolve version semver format
     * @param packageName name
     * @param packageVersion version
     */
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

    /**
     * import dependencies in package
     * @param packageStore 
     * @param cachePackageStoreDependenciesItem 
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
     * @param etag etag
     * @param registryName registry
     * @param imediateCleanMemoryCacheModuleFiles clean cache
     */
    import(name: string, version: string, etag?: string, registryName?: string, imediateCleanMemoryCacheModuleFiles = true): Promise<Object | null>{
        return new Promise(async (resolve, reject) => {
            try {
                var nameParsedObj: IModuleNameData = ModuleNameUtil.parse(name, "");
                var responseModuleObj : Object | null;
                var versionResolved: string = await this.resolveVersion(nameParsedObj.moduleName, version);

                //verify cache
                responseModuleObj = this.moduleManager.getModuleManagerCache().getCompiledObjectFromCache(nameParsedObj.fullName, versionResolved, "");
                if (responseModuleObj){
                    resolve(responseModuleObj);
                    return;
                }

                let packageStore: PackageStore | null = await this.packageStoreManager.getPackageStore(nameParsedObj.moduleName, versionResolved, etag, registryName);
                if (packageStore){
                    let rootPackageStoreKey: string = packageStore.getKey();

                    let cachePackageStoreDependenciesItem = this.moduleManager.getModuleManagerCache().cachePackageStoreBuild();

                    await this.importDependencies(packageStore, cachePackageStoreDependenciesItem);

                    //set rootPackageStore in cache
                    cachePackageStoreDependenciesItem.putPackageStore(packageStore);

                    let moduleManagerRequireContextData: ModuleManagerRequireContextData = new ModuleManagerRequireContextData(rootPackageStoreKey);
                    
                    //add all files to temporary memory cache
                    this.moduleManager.getModuleManagerCache().addPackageStoreCacheSyncToCache(rootPackageStoreKey, cachePackageStoreDependenciesItem);

                    //responseModuleObj = this.requireSync(nameParsedObj.fullName, versionResolved, moduleManagerRequireContextData);
                    responseModuleObj = await this.moduleManager.requireAsync(nameParsedObj.fullName, versionResolved, moduleManagerRequireContextData);

                    if (imediateCleanMemoryCacheModuleFiles){
                        //remove temporary cache
                        this.moduleManager.getModuleManagerCache().cleanCachePackageStoreByNameAndVersion(name, version);
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
}