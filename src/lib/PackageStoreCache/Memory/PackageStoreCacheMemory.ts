import { IPackageStoreCache } from "../IPackageStoreCache";
import { PackageStore } from "../../PackageStore/PackageStore";
import { PackageStoreCacheMemoryConfig } from "./PackageStoreCacheMemoryConfig";
import { Log } from "../../Log/Log";
import { LogLevelEnum, LogCodeEnum } from "../../Log/ILog";

const log = Log.getInstance();

/**
 * Cache PackageStore in memory
 */
export class PackageStoreCacheMemory implements IPackageStoreCache {
    config: PackageStoreCacheMemoryConfig;
    private listCacheItem: Map<string, PackageStore> = new Map<string, PackageStore>();
    private totalSize: number = 0;
    
    constructor(config?: PackageStoreCacheMemoryConfig){
        if (config){
            this.config = config;
        }
        else{
            this.config = new PackageStoreCacheMemoryConfig();
        }
    }

    private getKey(name: string, version?: string): string{
        if (version){
            return name + "-" + version;
        }
        else{
            return name;
        }
    }

    getTotalSize(): number {
        return this.totalSize;
    }

    getTotalEntry(): number {
        return this.listCacheItem.size;
    }

    getPackageStore(name: string, version?: string): Promise<PackageStore | null> {
        return new Promise(async (resolve, reject) => {
            var key: string = this.getKey(name, version);

            resolve(this.listCacheItem.get(key) || null);
        });
    }

    putPackageStore(packageStore: PackageStore): Promise<PackageStore> {
        return new Promise(async (resolve, reject) => {
            var key: string = this.getKey(packageStore.getName(), packageStore.getVersion());
            if (this.listCacheItem.has(key) === false){
                this.totalSize += packageStore.getSize();
            }
            this.listCacheItem.set(key, packageStore);
            resolve();
        });
    }

    deletePackageStore(name: string, version?: string): Promise<PackageStore> {
        return new Promise(async (resolve, reject) => {
            var key: string = this.getKey(name, version);
            var packageStore = this.listCacheItem.get(key);
            if (packageStore){
                this.totalSize -= packageStore.getSize();
                this.listCacheItem.delete(key);
            }
            resolve();
        });
    }
}