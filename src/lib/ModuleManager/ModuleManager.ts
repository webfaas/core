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
        let cacheRootPackageStore: IPackageStoreCacheSync | undefined = this.getModuleManagerCache().getCachePackageStoreDependencies().get(moduleManagerRequireContextData.rootPackageStoreKey);
        if (cacheRootPackageStore){
            let codeBufferFromPackageStoreCacheSync = this.moduleManagerCache.getCodeBufferResponseFromPackageStoreCacheSync(cacheRootPackageStore, packageInfoTarget, moduleManagerRequireContextData);

            //compile
            if (codeBufferFromPackageStoreCacheSync){
                responseObj = this.moduleManagerCompile.compilePackageStoreItemBufferSync(codeBufferFromPackageStoreCacheSync.packageStoreItemBufferResponse, moduleManagerRequireContextData, codeBufferFromPackageStoreCacheSync.moduleCompileManifestData);
                if (responseObj){
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
            let cacheRootPackageStore: IPackageStoreCacheSync | undefined = this.getModuleManagerCache().getCachePackageStoreDependencies().get(moduleManagerRequireContextData.rootPackageStoreKey);
            if (cacheRootPackageStore){
                let codeBufferFromPackageStoreCacheSync = this.moduleManagerCache.getCodeBufferResponseFromPackageStoreCacheSync(cacheRootPackageStore, packageInfoTarget, moduleManagerRequireContextData);
    
                //compile
                if (codeBufferFromPackageStoreCacheSync){
                    this.moduleManagerCompile.compilePackageStoreItemBufferAsync(codeBufferFromPackageStoreCacheSync.packageStoreItemBufferResponse, moduleManagerRequireContextData, codeBufferFromPackageStoreCacheSync.moduleCompileManifestData).then((moduleCompiledObj)=>{
                        if (moduleCompiledObj){
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

    invokeAsync(name: string, version: string, method?: string, parameter?: any[], registryName?: string, imediateCleanMemoryCacheModuleFiles = true): Promise<any>{
        return new Promise(async (resolve, reject) => {
            this.moduleManagerImport.import(name, version, undefined, registryName, false).then((moduleObj)=>{ //disable imediateCleanMemoryCacheModuleFiles in import
                if (moduleObj){
                    this.invokeAsyncByModuleObject(moduleObj, method, parameter).then((responseInvokeAsync)=>{
                        resolve(responseInvokeAsync);

                        //remove temporary cache
                        if (imediateCleanMemoryCacheModuleFiles) this.getModuleManagerCache().cleanCachePackageStoreDependencies(name, version);
                    }).catch((errInvokeAsync) => {
                        //remove temporary cache
                        if (imediateCleanMemoryCacheModuleFiles) this.getModuleManagerCache().cleanCachePackageStoreDependencies(name, version);

                        reject(errInvokeAsync);
                    });
                }
                else{
                    //remove temporary cache
                    if (imediateCleanMemoryCacheModuleFiles) this.getModuleManagerCache().cleanCachePackageStoreDependencies(name, version);

                    resolve(null);
                }
            }).catch((errImport) => {
                //remove temporary cache
                if (imediateCleanMemoryCacheModuleFiles) this.getModuleManagerCache().cleanCachePackageStoreDependencies(name, version);

                reject(errImport);
            });
        })
    }
}