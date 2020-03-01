import { Log } from "../Log/Log";
import { types } from "util"
import { PackageStoreManager } from "../PackageStoreManager/PackageStoreManager";
import { ModuleCompileManifestData } from "../ModuleCompile/ModuleCompileManifestData";
import { ModuleManagerRequireContextData } from "./ModuleManagerRequireContextData";
import { WebFaasError } from "../WebFaasError/WebFaasError";
import { IRequirePackageInfoTarget } from "./IRequirePackageInfoTarget";
import { ModuleManagerCache } from "./ModuleManagerCache";
import { ModuleManagerCompile } from "./ModuleManagerCompile";
import { ModuleManagerImport } from "./ModuleManagerImport";
import { IMessageContext } from "./IMessageContext";
import { ModuleManagerConvert } from "./ModuleManagerConvert";
import { IRequestContext, IRequestContextStack } from "./IRequestContext";
import { IModuleManagerFilter } from "./IModuleManagerFilter";

const moduleManagerConvert = new ModuleManagerConvert();

/**
 * manager Module
 */
export class ModuleManager {
    private log: Log;
    private moduleManagerCompile: ModuleManagerCompile;
    private moduleManagerCache: ModuleManagerCache;
    private moduleManagerImport: ModuleManagerImport;
    private preFilterInvokeAsyncList: Array<IModuleManagerFilter> = new Array<IModuleManagerFilter>();

    constructor(packageStoreManager?: PackageStoreManager, log?: Log){
        this.log = log || new Log();
        this.moduleManagerCache = new ModuleManagerCache(this.log);
        this.moduleManagerCompile = new ModuleManagerCompile(this, this.log);
        this.moduleManagerImport = new ModuleManagerImport(this, this.log, packageStoreManager);
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
     * add pre filter
     * @param filter 
     */
    addPreFilterInvokeAsync(filter: IModuleManagerFilter): void{
        if (filter.priority){
            for (let i = 0; i < this.preFilterInvokeAsyncList.length; i++){
                let item = this.preFilterInvokeAsyncList[i];
                if (filter.priority > item.priority){
                    this.preFilterInvokeAsyncList.splice(i, 0, filter);
                    return;
                }
            }
        }
        this.preFilterInvokeAsyncList.push(filter);
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
        let responseObj: Object | null = this.getModuleManagerCache().getModuleFromAllCache(name, packageInfoTarget, moduleManagerRequireContextData, parentModuleCompileManifestData);
        if (responseObj){
            return responseObj;
        }

        //find packageStore in cache
        let cacheRootPackageStore = this.getModuleManagerCache().getPackageStoreCacheSyncFromCache(moduleManagerRequireContextData.rootPackageStoreKey);
        if (cacheRootPackageStore){
            let codeBufferFromPackageStoreCacheSync = moduleManagerConvert.convertToCodeBufferResponse(cacheRootPackageStore, packageInfoTarget, moduleManagerRequireContextData);

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

    /**
     * invoke async
     * @param name module name
     * @param version module version
     * @param method method name
     * @param parameter parameter
     * @param registryName registry
     * @param imediateCleanMemoryCacheModuleFiles clean cache
     */
    invokeAsync(name: string, version: string, method?: string, parameter?: any[], registryName?: string, imediateCleanMemoryCacheModuleFiles = true): Promise<any>{
        return new Promise((resolve, reject) => {
            this.moduleManagerImport.import(name, version, undefined, registryName, false).then((moduleObj)=>{ //disable imediateCleanMemoryCacheModuleFiles in import
                if (moduleObj){
                    //pre filter
                    Promise.all(this.preFilterInvokeAsyncList.map((item)=>{return item.filter(name, version, method, parameter, registryName)})).then(()=>{
                        //pre filter - ok

                        this.invokeAsyncByModuleObject(moduleObj, method, parameter).then((responseInvokeAsync)=>{
                            resolve(responseInvokeAsync);
    
                            //remove temporary cache
                            if (imediateCleanMemoryCacheModuleFiles) this.getModuleManagerCache().cleanCachePackageStoreByNameAndVersion(name, version);
                        }).catch((errInvokeAsync) => {
                            //remove temporary cache
                            if (imediateCleanMemoryCacheModuleFiles) this.getModuleManagerCache().cleanCachePackageStoreByNameAndVersion(name, version);
    
                            reject(errInvokeAsync);
                        });
                    }).catch((errPreFilter)=>{
                        //pre filter - error

                        reject(errPreFilter);
                    })
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

    /**
     * send message
     * @param name module name
     * @param version module version
     * @param method method
     * @param requestContext request context
     * @param data data
     * @param registryName registry
     */
    sendMessage(name: string, version: string, method: string, requestContext:IRequestContext, data: any, registryName?: string): Promise<any>{
        let self = this;

        let send_requestContext = {} as IRequestContext;

        let messageContext = {} as IMessageContext
        messageContext.requestContext = requestContext;
        messageContext.sendMessage = function(send_name: string, send_version: string, send_method: string, send_data: any, send_registryName?: string): Promise<any>{
            if (!send_requestContext.level){ //first invoke - configure request context
                send_requestContext.clientContext = requestContext.clientContext;
                send_requestContext.level = requestContext.level + 1;
                send_requestContext.requestID = requestContext.requestID;
                send_requestContext.stack = {} as IRequestContextStack;
                send_requestContext.stack.name = name;
                send_requestContext.stack.version = version;
                send_requestContext.stack.method = method;
                send_requestContext.stack.stack = requestContext.stack;
            }

            return self.sendMessage(send_name, send_version, send_method, send_requestContext, send_data, send_registryName);
        }
        return this.invokeAsync(name, version, method, [data, messageContext], registryName, true);
    }

    /**
     * invoke async in object
     * @param moduleObj module object
     * @param method method name
     * @param parameter parameter
     * @param invokeContextData context
     */
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
}