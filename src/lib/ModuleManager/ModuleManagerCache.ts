import { Log } from "../Log/Log";
import { PackageStore } from "../PackageStore/PackageStore";
import { IPackageStoreCacheSync } from "../PackageStoreCache/IPackageStoreCacheSync";
import { ModuleCompileManifestData } from "../ModuleCompile/ModuleCompileManifestData";
import { ModuleManagerRequireContextData } from "./ModuleManagerRequireContextData";
import { ModuleManagerCacheObjectItem } from "./ModuleManagerCacheObjectItem";
import { IRequirePackageInfoTarget } from "./IRequirePackageInfoTarget";
import { PackageStoreCacheMemorySync } from "../PackageStoreCache/Memory/PackageStoreCacheMemorySync";
import { PackageStoreItemBufferResponse } from "../PackageStore/PackageStoreItemBufferResponse";
import { ICodeBufferResponseFromPackageStoreCacheSync } from "./ICodeBufferResponseFromPackageStoreCacheSync";
import { IManifest } from "../Core";

const nativeModule = require("module");

/**
 * manager Module
 */
export class ModuleManagerCache {
    private log: Log;
    private cachePackageStoreDependencies: Map<string, IPackageStoreCacheSync> = new Map<string, IPackageStoreCacheSync>();
    private cacheCompiledObject: Map<string, ModuleManagerCacheObjectItem> = new Map<string, ModuleManagerCacheObjectItem>();
    
    constructor(log?: Log){
        this.log = log || new Log();
    }

    getCacheCompiledObject(): Map<string, ModuleManagerCacheObjectItem>{
        return this.cacheCompiledObject;
    }

    getCachePackageStoreDependencies(): Map<string, IPackageStoreCacheSync> {
        return this.cachePackageStoreDependencies;
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

    getModuleFromAllCache(name: string, packageInfoTarget: IRequirePackageInfoTarget, moduleManagerRequireContextData: ModuleManagerRequireContextData, parentModuleCompileManifestData?: ModuleCompileManifestData): Object | null{
        //find module in bultin
        if (nativeModule.builtinModules.indexOf(name) > -1){
            return this.requireNativeModule(name, moduleManagerRequireContextData, parentModuleCompileManifestData);
        }

        //find module in cache
        let responseObj: Object | null = this.getCompiledObjectFromCache(packageInfoTarget.packageName, packageInfoTarget.packageVersion, packageInfoTarget.itemKey);
        if (responseObj){
            return responseObj;
        }
        else{
            return null;
        }
    }

    getCodeBufferResponseFromPackageStoreCacheSync(cacheRootPackageStore: IPackageStoreCacheSync, packageInfoTarget: IRequirePackageInfoTarget, moduleManagerRequireContextData: ModuleManagerRequireContextData): ICodeBufferResponseFromPackageStoreCacheSync | null{
        if (packageInfoTarget.itemKey){
            //
            //require internal package
            //
            let parentPackageStore: PackageStore | null = cacheRootPackageStore.getPackageStore(packageInfoTarget.packageName, packageInfoTarget.packageVersion);
            if (parentPackageStore){
                let packageStoreItemBufferResponse: PackageStoreItemBufferResponse | null = parentPackageStore.getItemBuffer(packageInfoTarget.itemKey);
                if (packageStoreItemBufferResponse){
                    let codeBufferFromPackageStoreCacheSync = {} as ICodeBufferResponseFromPackageStoreCacheSync;

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

    requireNativeModule(name: string, moduleManagerRequireContextData: ModuleManagerRequireContextData, parentModuleCompileManifestData?: ModuleCompileManifestData): any{
        //native module
        return require(name);
    }

    cachePackageStoreDependenciesItemBuild(): IPackageStoreCacheSync{
        return new PackageStoreCacheMemorySync();
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

    cleanCachePackageStoreDependencies(name: string, version: string) {
        var rootPackageStoreKey: string = PackageStore.parseKey(name, version);
        this.cachePackageStoreDependencies.delete(rootPackageStoreKey);
    }

    cleanCacheObjectCompiled(): void{
        this.cacheCompiledObject.clear();
    }
}