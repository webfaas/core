import { IPackageStoreCacheAsync } from "../../lib/PackageStoreCache/IPackageStoreCacheAsync";
import { PackageStore } from "../../lib/PackageStore/PackageStore";

/**
 * Cache PackageStore in memory
 */
export class PackageStoreCacheMemoryAsyncMock implements IPackageStoreCacheAsync {
    private listCacheItem: Map<string, PackageStore> = new Map<string, PackageStore>();
    
    private getKey(name: string, version?: string): string{
        if (version){
            return name + "-" + version;
        }
        else{
            return name;
        }
    }

    getPackageStore(name: string, version?: string | undefined): Promise<PackageStore | null> {
        return new Promise((resolve, reject)=>{
            var key: string = this.getKey(name, version);
            resolve(this.listCacheItem.get(key) || null);
        });
    }

    putPackageStore(packageStore: PackageStore): Promise<void> {
        return new Promise((resolve, reject)=>{
            var key: string = this.getKey(packageStore.getName(), packageStore.getVersion());
            this.listCacheItem.set(key, packageStore);
            
            resolve();
        });
    }
}