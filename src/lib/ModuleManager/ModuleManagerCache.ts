import { Log } from "../Log/Log";
import { PackageStore } from "../PackageStore/PackageStore";
import { IPackageStoreCacheSync } from "../PackageStoreCache/IPackageStoreCacheSync";
import { ModuleCompileManifestData } from "../ModuleCompile/ModuleCompileManifestData";
import { ModuleManagerRequireContextData } from "./ModuleManagerRequireContextData";
import { ModuleManagerCacheObjectItem } from "./ModuleManagerCacheObjectItem";
import { IRequirePackageInfoTarget } from "./IRequirePackageInfoTarget";
import { PackageStoreCacheMemorySync } from "../PackageStoreCache/Memory/PackageStoreCacheMemorySync";
import { IManifest } from "../Manifest/IManifest";
import * as path from "path";

const nativeModule = require("module");

/**
 * manager Module
 */
export class ModuleManagerCache {
    private log: Log;
    private cacheModule: Map<string, ModuleManagerCacheObjectItem> = new Map<string, ModuleManagerCacheObjectItem>();
    private localDiskModule: Map<string, string> = new Map<string, string>();
    
    constructor(log?: Log){
        this.log = log || new Log();
    }

    getCacheModule(): Map<string, ModuleManagerCacheObjectItem>{
        return this.cacheModule;
    }

    getLocalDiskModule(): Map<string, string>{
        return this.localDiskModule;
    }

    getOrCreateCacheModuleItem(key: string): ModuleManagerCacheObjectItem{
        var cacheModuleManagerItem = this.cacheModule.get(key);
        if (!cacheModuleManagerItem){
            let keyArray = key.split(":");
            cacheModuleManagerItem = new ModuleManagerCacheObjectItem(keyArray[0], keyArray[1]);
            this.cacheModule.set(key, cacheModuleManagerItem);
        }
        return cacheModuleManagerItem;
    }

    getManifestFromCache(packageName: string, packageVersion: string): IManifest | null {
        var key: string = PackageStore.parseKey(packageName, packageVersion);
        var cacheModuleManagerItem = this.cacheModule.get(key);
        if (cacheModuleManagerItem){
            return cacheModuleManagerItem.getManifest();
        }
        else{
            return null;
        }
    }

    getPackageStoreCacheSyncFromCache(key: string): IPackageStoreCacheSync | null {
        var cacheModuleManagerItem = this.cacheModule.get(key);
        if (cacheModuleManagerItem){
            return cacheModuleManagerItem.getPackageStoreCache();
        }
        else{
            return null;
        }
    }

    getCompiledObjectFromCache(packageName: string, packageVersion: string, itemKey: string): Object | null{
        var key: string = PackageStore.parseKey(packageName, packageVersion);
        var cacheModuleManagerItem = this.cacheModule.get(key);
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

    requireNativeModule(name: string, moduleManagerRequireContextData: ModuleManagerRequireContextData, parentModuleCompileManifestData?: ModuleCompileManifestData): any{
        //native module
        return require(name);
    }

    cachePackageStoreBuild(): IPackageStoreCacheSync{
        return new PackageStoreCacheMemorySync();
    }

    addPackageStoreCacheSyncToCache(key: string, item:IPackageStoreCacheSync): void {
        var cacheModuleManagerItem = this.getOrCreateCacheModuleItem(key);
        cacheModuleManagerItem.setPackageStoreCache(item);
    }

    addManifestToCache(packageName: string, packageVersion: string, manifest:IManifest | null): void {
        var key: string = PackageStore.parseKey(packageName, packageVersion);
        var cacheModuleManagerItem = this.getOrCreateCacheModuleItem(key);
        cacheModuleManagerItem.setManifest(manifest);
    }

    addCompiledObjectToCache(packageName: string, packageVersion: string, itemKey: string, obj: Object): void{
        var key: string = PackageStore.parseKey(packageName, packageVersion);
        var cacheModuleManagerItem = this.getOrCreateCacheModuleItem(key);
        cacheModuleManagerItem.setObjectToCache(itemKey, obj);
    }

    addLocalDiskModuleToCache(folderPath: string): void{
        let manifest: IManifest = require(path.join(folderPath, "package.json"));
        let packageName = manifest.name;
        let packageVersion = manifest.version || "1.0.0";

        let moduleObj = require(folderPath);
        
        manifest.versions = {};
        manifest.versions[packageVersion] = {name: packageName, version: packageVersion};

        let key: string = PackageStore.parseKey(packageName, packageVersion);
        this.localDiskModule.set(key, folderPath);
        this.addManifestToCache(packageName, packageVersion, manifest);
        this.addCompiledObjectToCache(packageName, packageVersion, "", moduleObj);
    }

    cleanCachePackageStoreByNameAndVersion(packageName: string, packageVersion: string) {
        var key: string = PackageStore.parseKey(packageName, packageVersion);
        var cacheModuleManagerItem = this.cacheModule.get(key);
        if (cacheModuleManagerItem){
            return cacheModuleManagerItem.setPackageStoreCache(null);
        }
    }

    cleanCacheModule(): void{
        this.cacheModule.clear();
    }
}