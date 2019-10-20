import { IPackageRegistryManagerCache } from "../../IPackageRegistryManagerCache";
import { PackageStore } from "../../../PackageStore/PackageStore";
import { PackageRegistryManagerCacheMemoryConfig } from "./PackageRegistryManagerCacheMemoryConfig";
import { Log } from "../../../Log/Log";
import { LogLevelEnum, LogCodeEnum } from "../../../Log/ILog";

const log = Log.getInstance();

/**
 * Cache PackageRegistry in memory
 */
export class PackageRegistryManagerCacheMemory implements IPackageRegistryManagerCache {
    config: PackageRegistryManagerCacheMemoryConfig;
    private listCacheItem: Map<string, PackageStore> = new Map<string, PackageStore>();
    private totalSize: number = 0;

    constructor(config?: PackageRegistryManagerCacheMemoryConfig){
        if (config){
            this.config = config;
        }
        else{
            this.config = new PackageRegistryManagerCacheMemoryConfig();
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