import * as path from "path";
import { Log } from "../Log/Log";
import { types } from "util"
import { PackageStoreManager } from "../PackageStoreManager/PackageStoreManager";
import { IPackageStoreCacheSync } from "../PackageStoreCache/IPackageStoreCacheSync";
import { ModuleCompileManifestData } from "../ModuleCompile/ModuleCompileManifestData";
import { ModuleManagerRequireContextData } from "./ModuleManagerRequireContextData";
import { WebFaasError } from "../WebFaasError/WebFaasError";
import { ModuleNameUtil } from "../Util/ModuleNameUtil";
import { IRequirePackageInfoTarget } from "./IRequirePackageInfoTarget";
import { ModuleManagerCache } from "./ModuleManagerCache";
import { ModuleManagerCompile } from "./ModuleManagerCompile";
import { ModuleManagerImport } from "./ModuleManagerImport";
import { PackageStore, IManifest } from "../Core";
import { PackageStoreItemBufferResponse } from "../PackageStore/PackageStoreItemBufferResponse";
import { ICodeBufferResponseFromPackageStoreCacheSync } from "./ICodeBufferResponseFromPackageStoreCacheSync";
import { InvokeContextData } from "./InvokeContextData";

/**
 * manager Module
 */
export class ModuleManager {
    private log: Log;
    private moduleManagerCompile: ModuleManagerCompile;
    private moduleManagerCache: ModuleManagerCache;
    private moduleManagerImport: ModuleManagerImport;
    
    constructor(packageStoreManager?: PackageStoreManager, log?: Log){
        this.log = log || new Log();
        this.moduleManagerCache = new ModuleManagerCache(this.log);
        this.moduleManagerCompile = new ModuleManagerCompile(this, this.log);
        this.moduleManagerImport = new ModuleManagerImport(this, this.log, packageStoreManager);
    }

    getModuleManagerCache(): ModuleManagerCache{
        return this.moduleManagerCache;
    }

    getModuleManagerCompile(): ModuleManagerCompile{
        return this.moduleManagerCompile;
    }

    getModuleManagerImport(): ModuleManagerImport{
        return this.moduleManagerImport;
    }

    getRequirePackageInfoTarget(name: string, version: string, moduleManagerRequireContextData: ModuleManagerRequireContextData, parentModuleCompileManifestData?: ModuleCompileManifestData): IRequirePackageInfoTarget{
        let packageInfoTarget = {} as IRequirePackageInfoTarget;

        packageInfoTarget.nameParsedObj = ModuleNameUtil.parse(name, "");
        if (name.substring(0,1) === "."){
            if (parentModuleCompileManifestData){
                //internal package
                packageInfoTarget.packageName = moduleManagerRequireContextData.parentPackageStoreName;
                packageInfoTarget.packageVersion = moduleManagerRequireContextData.parentPackageStoreVersion;
                packageInfoTarget.itemKey = path.resolve("/" + parentModuleCompileManifestData.mainFileDirName, name).substring(1);
            }
            else{
                packageInfoTarget.packageName = "";
                packageInfoTarget.packageVersion = "";
                packageInfoTarget.itemKey = "";
            }
        }
        else{
            //external package
            packageInfoTarget.packageName = packageInfoTarget.nameParsedObj.fullName;
            packageInfoTarget.packageVersion = version;
            packageInfoTarget.itemKey = "";
        }

        return packageInfoTarget;
    }

    requireSync(name: string, version: string, moduleManagerRequireContextData: ModuleManagerRequireContextData, parentModuleCompileManifestData?: ModuleCompileManifestData): Object | null{
        let packageInfoTarget: IRequirePackageInfoTarget = this.getRequirePackageInfoTarget(name, version, moduleManagerRequireContextData, parentModuleCompileManifestData);

        if (packageInfoTarget.packageName === ""){
            return null;
        }
        
        //find module in cache
        let responseObj: Object | null = this.getModuleManagerCache().getModuleFromAllCache(name, packageInfoTarget, moduleManagerRequireContextData, parentModuleCompileManifestData);
        if (responseObj){
            return responseObj;
        }

        //find packageStore in cache
        let cacheRootPackageStore = this.getModuleManagerCache().getPackageStoreCacheSyncFromCache(moduleManagerRequireContextData.rootPackageStoreKey);
        if (cacheRootPackageStore){
            let codeBufferFromPackageStoreCacheSync = this.convertToCodeBufferResponse(cacheRootPackageStore, packageInfoTarget, moduleManagerRequireContextData);

            //compile
            if (codeBufferFromPackageStoreCacheSync){
                //add manifest to temporary cache
                this.getModuleManagerCache().addManifestToCache(packageInfoTarget.packageName, packageInfoTarget.packageVersion, codeBufferFromPackageStoreCacheSync.manifest);
                
                responseObj = this.moduleManagerCompile.compilePackageStoreItemBufferSync(codeBufferFromPackageStoreCacheSync.packageStoreItemBufferResponse, moduleManagerRequireContextData, codeBufferFromPackageStoreCacheSync.moduleCompileManifestData);
                if (responseObj){
                    //add compiled module to temporary cache
                    this.getModuleManagerCache().addCompiledObjectToCache(packageInfoTarget.packageName, packageInfoTarget.packageVersion, packageInfoTarget.itemKey, responseObj);

                    return responseObj;
                }
                else{
                    return null;
                }
            }
            else{
                return null;
            }
        }
        else{
            return null;
        }
    }

    requireAsync(name: string, version: string, moduleManagerRequireContextData: ModuleManagerRequireContextData, parentModuleCompileManifestData?: ModuleCompileManifestData): Promise<Object | null>{
        return new Promise((resolve, reject)=>{
            let packageInfoTarget: IRequirePackageInfoTarget = this.getRequirePackageInfoTarget(name, version, moduleManagerRequireContextData, parentModuleCompileManifestData);
            
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
                let codeBufferFromPackageStoreCacheSync = this.convertToCodeBufferResponse(cacheRootPackageStore, packageInfoTarget, moduleManagerRequireContextData);
    
                //compile
                if (codeBufferFromPackageStoreCacheSync){
                    //add manifest to temporary cache
                    this.getModuleManagerCache().addManifestToCache(packageInfoTarget.packageName, packageInfoTarget.packageVersion, codeBufferFromPackageStoreCacheSync.manifest);

                    this.moduleManagerCompile.compilePackageStoreItemBufferAsync(codeBufferFromPackageStoreCacheSync.packageStoreItemBufferResponse, moduleManagerRequireContextData, codeBufferFromPackageStoreCacheSync.moduleCompileManifestData).then((moduleCompiledObj)=>{
                        if (moduleCompiledObj){
                            //add compiled module to temporary cache
                            this.getModuleManagerCache().addCompiledObjectToCache(packageInfoTarget.packageName, packageInfoTarget.packageVersion, packageInfoTarget.itemKey, moduleCompiledObj);

                            resolve(moduleCompiledObj);
                        }
                        else{
                            resolve(null);
                        }
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

    invokeAsync(name: string, version: string, method?: string, parameter?: any[], registryName?: string, invokeContextData?:InvokeContextData, imediateCleanMemoryCacheModuleFiles = true): Promise<any>{
        return new Promise((resolve, reject) => {
            this.moduleManagerImport.import(name, version, undefined, registryName, false).then((moduleObj)=>{ //disable imediateCleanMemoryCacheModuleFiles in import
                if (moduleObj){
                    this.invokeAsyncByModuleObject(moduleObj, method, parameter).then((responseInvokeAsync)=>{
                        resolve(responseInvokeAsync);

                        //remove temporary cache
                        if (imediateCleanMemoryCacheModuleFiles) this.getModuleManagerCache().cleanCachePackageStoreByNameAndVersion(name, version);
                    }).catch((errInvokeAsync) => {
                        //remove temporary cache
                        if (imediateCleanMemoryCacheModuleFiles) this.getModuleManagerCache().cleanCachePackageStoreByNameAndVersion(name, version);

                        reject(errInvokeAsync);
                    });
                }
                else{
                    //remove temporary cache
                    if (imediateCleanMemoryCacheModuleFiles) this.getModuleManagerCache().cleanCachePackageStoreByNameAndVersion(name, version);

                    resolve(null);
                }
            }).catch((errImport) => {
                //remove temporary cache
                if (imediateCleanMemoryCacheModuleFiles) this.getModuleManagerCache().cleanCachePackageStoreByNameAndVersion(name, version);

                reject(errImport);
            });
        })
    }

    convertToCodeBufferResponse(cacheRootPackageStore: IPackageStoreCacheSync, packageInfoTarget: IRequirePackageInfoTarget, moduleManagerRequireContextData: ModuleManagerRequireContextData): ICodeBufferResponseFromPackageStoreCacheSync | null{
        if (packageInfoTarget.itemKey){
            //
            //require internal package
            //
            let parentPackageStore: PackageStore | null = cacheRootPackageStore.getPackageStore(packageInfoTarget.packageName, packageInfoTarget.packageVersion);
            if (parentPackageStore){
                let packageStoreItemBufferResponse: PackageStoreItemBufferResponse | null = parentPackageStore.getItemBuffer(packageInfoTarget.itemKey);
                if (packageStoreItemBufferResponse){
                    let codeBufferFromPackageStoreCacheSync = {} as ICodeBufferResponseFromPackageStoreCacheSync;

                    codeBufferFromPackageStoreCacheSync.manifest = parentPackageStore.getManifest();

                    codeBufferFromPackageStoreCacheSync.packageStoreItemBufferResponse = packageStoreItemBufferResponse;

                    codeBufferFromPackageStoreCacheSync.moduleCompileManifestData = new ModuleCompileManifestData(
                        parentPackageStore.getName(),
                        parentPackageStore.getVersion(),
                        packageInfoTarget.itemKey
                    );

                    return codeBufferFromPackageStoreCacheSync;
                }
                else{
                    return null;
                }
            }
            else{
                return null;
            }
        }
        else{
            //
            //require external package
            //

            //if not version exist, seek version in parent package.json
            if (packageInfoTarget.packageVersion === "" && moduleManagerRequireContextData.parentPackageStoreName){
                let parentPackageStore: PackageStore | null = cacheRootPackageStore.getPackageStore(moduleManagerRequireContextData.parentPackageStoreName, moduleManagerRequireContextData.parentPackageStoreVersion);
                if (parentPackageStore){
                    let parentPackageManifest: IManifest | null = parentPackageStore.getManifest();
                    if (parentPackageManifest && parentPackageManifest.dependencies){
                        packageInfoTarget.packageVersion = parentPackageManifest.dependencies[packageInfoTarget.nameParsedObj.moduleName] || "";
                    }
                }
            }

            let packageStore: PackageStore | null = cacheRootPackageStore.getPackageStore(packageInfoTarget.nameParsedObj.moduleName, packageInfoTarget.packageVersion);
            if (packageStore){
                let packageStoreItemBufferResponse: PackageStoreItemBufferResponse | null
                if (packageInfoTarget.nameParsedObj.fileName){
                    packageStoreItemBufferResponse = packageStore.getItemBuffer(packageInfoTarget.nameParsedObj.fileName);
                }
                else{
                    packageStoreItemBufferResponse = packageStore.getMainBuffer();
                }

                if (packageStoreItemBufferResponse){
                    let codeBufferFromPackageStoreCacheSync = {} as ICodeBufferResponseFromPackageStoreCacheSync;

                    codeBufferFromPackageStoreCacheSync.manifest = packageStore.getManifest();
                    
                    codeBufferFromPackageStoreCacheSync.packageStoreItemBufferResponse = packageStoreItemBufferResponse;

                    codeBufferFromPackageStoreCacheSync.moduleCompileManifestData = new ModuleCompileManifestData(
                        packageStore.getName(),
                        packageStore.getVersion(),
                        packageInfoTarget.nameParsedObj.fileName || packageStore.getMainFileFullPath()
                    );

                    return codeBufferFromPackageStoreCacheSync;
                }
                else{
                    return null;
                }
            }
            else{
                return null;
            }
        }
    }
}