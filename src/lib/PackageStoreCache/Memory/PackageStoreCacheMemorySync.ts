import { IPackageStoreCacheSync } from "../IPackageStoreCacheSync";
import { PackageStore } from "../../PackageStore/PackageStore";
import { PackageStoreCacheMemoryConfig } from "./PackageStoreCacheMemoryConfig";
import { Log } from "../../Log/Log";

/**
 * Cache PackageStore in memory
 */
export class PackageStoreCacheMemorySync implements IPackageStoreCacheSync {
    private config: PackageStoreCacheMemoryConfig;
    private log: Log;
    private listCacheItem: Map<string, PackageStore> = new Map<string, PackageStore>();
    private totalSize: number = 0;
    
    constructor(config?: PackageStoreCacheMemoryConfig, log?: Log){
        if (config){
            this.config = config;
        }
        else{
            this.config = new PackageStoreCacheMemoryConfig();
        }

        this.log = log || new Log();
    }

    private getKey(name: string, version?: string): string{
        if (version){
            return name + "-" + version;
        }
        else{
            return name;
        }
    }

    getConfig(): PackageStoreCacheMemoryConfig {
        return this.config
    }

    getTotalSize(): number {
        return this.totalSize;
    }

    getTotalEntry(): number {
        return this.listCacheItem.size;
    }

    getPackageStore(name: string, version?: string): PackageStore | null {
        var key: string = this.getKey(name, version);

        return this.listCacheItem.get(key) || null;
    }

    putPackageStore(packageStore: PackageStore): void {
        var key: string = this.getKey(packageStore.getName(), packageStore.getVersion());
        if (this.listCacheItem.has(key) === false){
            this.totalSize += packageStore.getSize();
        }
        this.listCacheItem.set(key, packageStore);
    }

    deletePackageStore(name: string, version?: string): void {
        var key: string = this.getKey(name, version);
        var packageStore = this.listCacheItem.get(key);
        if (packageStore){
            this.totalSize -= packageStore.getSize();
            this.listCacheItem.delete(key);
        }
    }
}