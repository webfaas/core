import { Log } from "../Log/Log";
import { PackageStoreManager } from "../PackageStoreManager/PackageStoreManager";
import { ModuleCompileManifestData } from "../ModuleCompile/ModuleCompileManifestData";
import { ModuleManagerRequireContextData } from "./ModuleManagerRequireContextData";
import { IRequirePackageInfoTarget } from "./IRequirePackageInfoTarget";
import { ModuleManagerCache } from "./ModuleManagerCache";
import { ModuleManagerCompile } from "./ModuleManagerCompile";
import { ModuleManagerImport } from "./ModuleManagerImport";
import { ModuleManagerConvert } from "./ModuleManagerConvert";
import { ICodeBufferResponseFromPackageStoreCacheSync } from "./ICodeBufferResponseFromPackageStoreCacheSync";
import { EventEmitter } from "events";

const moduleManagerConvert = new ModuleManagerConvert();

/**
 * manager Module
 */
export class ModuleManager {
    private log: Log;
    private moduleManagerCompile: ModuleManagerCompile;
    private moduleManagerCache: ModuleManagerCache;
    private moduleManagerImport: ModuleManagerImport;
    private event: EventEmitter = new EventEmitter();
    
    constructor(packageStoreManager?: PackageStoreManager, log?: Log){
        this.log = log || new Log();
        this.moduleManagerCache = new ModuleManagerCache(this.log);
        this.moduleManagerCompile = new ModuleManagerCompile(this, this.log);
        this.moduleManagerImport = new ModuleManagerImport(this, this.log, packageStoreManager);

        this.onProcessModuleCompiledToCache = this.onProcessModuleCompiledToCache.bind(this);
        this.event.addListener("processModuleCompiledToCache", this.onProcessModuleCompiledToCache);
    }

    /**
     * return module manager cache
     */
    getModuleManagerCache(): ModuleManagerCache{
        return this.moduleManagerCache;
    }

    /**
     * return module manager compile
     */
    getModuleManagerCompile(): ModuleManagerCompile{
        return this.moduleManagerCompile;
    }

    /**
     * return module manager import
     */
    getModuleManagerImport(): ModuleManagerImport{
        return this.moduleManagerImport;
    }

    /**
     * require sync
     * @param name module name
     * @param version module version
     * @param moduleManagerRequireContextData context
     * @param parentModuleCompileManifestData compile manifest
     */
    requireSync(name: string, version: string, moduleManagerRequireContextData: ModuleManagerRequireContextData, parentModuleCompileManifestData?: ModuleCompileManifestData): Object | null{
        let packageInfoTarget: IRequirePackageInfoTarget = moduleManagerConvert.convertToPackageInfoTarget(name, version, moduleManagerRequireContextData, parentModuleCompileManifestData);

        if (packageInfoTarget.packageName === ""){
            return null;
        }
        
        //find module in cache
        let moduleCompiledObj: Object | null = this.getModuleManagerCache().getModuleFromAllCache(name, packageInfoTarget, moduleManagerRequireContextData, parentModuleCompileManifestData);
        if (moduleCompiledObj){
            return moduleCompiledObj;
        }

        //find packageStore in cache
        let cacheRootPackageStore = this.getModuleManagerCache().getPackageStoreCacheSyncFromCache(moduleManagerRequireContextData.rootPackageStoreKey);
        if (cacheRootPackageStore){
            let codeBufferFromPackageStoreCacheSync = moduleManagerConvert.convertToCodeBufferResponse(cacheRootPackageStore, packageInfoTarget, moduleManagerRequireContextData);

            //compile
            if (codeBufferFromPackageStoreCacheSync){
                moduleCompiledObj = this.moduleManagerCompile.compilePackageStoreItemBufferSync(codeBufferFromPackageStoreCacheSync.packageStoreItemBufferResponse, moduleManagerRequireContextData, codeBufferFromPackageStoreCacheSync.moduleCompileManifestData);

                this.event.emit("processModuleCompiledToCache", packageInfoTarget, codeBufferFromPackageStoreCacheSync, moduleCompiledObj);

                return moduleCompiledObj;
            }
            else{
                return null;
            }
        }
        else{
            return null;
        }
    }

    /**
     * reqire async
     * @param name module name
     * @param version module version
     * @param moduleManagerRequireContextData context
     * @param parentModuleCompileManifestData manifest
     */
    requireAsync(name: string, version: string, moduleManagerRequireContextData: ModuleManagerRequireContextData, parentModuleCompileManifestData?: ModuleCompileManifestData): Promise<Object | null>{
        return new Promise((resolve, reject)=>{
            let packageInfoTarget: IRequirePackageInfoTarget = moduleManagerConvert.convertToPackageInfoTarget(name, version, moduleManagerRequireContextData, parentModuleCompileManifestData);
            
            if (packageInfoTarget.packageName === ""){
                resolve(null);
            }
            
            //find module in cache
            let moduleCacheObj: Object | null = this.getModuleManagerCache().getModuleFromAllCache(name, packageInfoTarget, moduleManagerRequireContextData, parentModuleCompileManifestData);
            if (moduleCacheObj){
                resolve(moduleCacheObj);
            }
    
            //find packageStore in cache
            let cacheRootPackageStore = this.getModuleManagerCache().getPackageStoreCacheSyncFromCache(moduleManagerRequireContextData.rootPackageStoreKey);
            if (cacheRootPackageStore){
                let codeBufferFromPackageStoreCacheSync = moduleManagerConvert.convertToCodeBufferResponse(cacheRootPackageStore, packageInfoTarget, moduleManagerRequireContextData);
    
                //compile
                if (codeBufferFromPackageStoreCacheSync){
                    this.moduleManagerCompile.compilePackageStoreItemBufferAsync(codeBufferFromPackageStoreCacheSync.packageStoreItemBufferResponse, moduleManagerRequireContextData, codeBufferFromPackageStoreCacheSync.moduleCompileManifestData).then((moduleCompiledObj)=>{
                        this.event.emit("processModuleCompiledToCache", packageInfoTarget, codeBufferFromPackageStoreCacheSync, moduleCompiledObj);

                        resolve(moduleCompiledObj);
                    }).catch((errCompile) => {
                        reject(errCompile);
                    });
                }
                else{
                    resolve(null);
                }
            }
            else{
                resolve(null);
            }
        });
    }

    /**
     * Process Event processModuleCompiledToCache
     * @param packageInfoTarget 
     * @param codeBufferFromPackageStoreCacheSync 
     * @param moduleCompiledObj 
     */
    onProcessModuleCompiledToCache(packageInfoTarget: IRequirePackageInfoTarget, codeBufferFromPackageStoreCacheSync: ICodeBufferResponseFromPackageStoreCacheSync | null, moduleCompiledObj: Object | null){
        //add manifest to temporary cache
        if (codeBufferFromPackageStoreCacheSync){
            this.getModuleManagerCache().addManifestToCache(packageInfoTarget.packageName, packageInfoTarget.packageVersion, codeBufferFromPackageStoreCacheSync.manifest);
        }
        
        //add compiled module to temporary cache
        if (moduleCompiledObj){
            this.getModuleManagerCache().addCompiledObjectToCache(packageInfoTarget.packageName, packageInfoTarget.packageVersion, packageInfoTarget.itemKey, moduleCompiledObj);
        }
    }
}