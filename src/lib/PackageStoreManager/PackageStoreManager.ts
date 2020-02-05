import { PackageStore } from "../PackageStore/PackageStore";
import { Log } from "../Log/Log";
import { PackageRegistryManager } from "../PackageRegistryManager/PackageRegistryManager";
import { IPackageStoreCacheAsync } from "../PackageStoreCache/IPackageStoreCacheAsync";

/**
 * manager PackageStore
 */
export class PackageStoreManager {
    private log: Log;
    private packageRegistryManager: PackageRegistryManager;
    private cache: IPackageStoreCacheAsync | null = null;
    
    constructor(packageRegistryManager?: PackageRegistryManager, log?: Log){
        this.log = log || Log.getInstance();
        
        if (packageRegistryManager){
            this.packageRegistryManager = packageRegistryManager;
        }
        else{
            this.packageRegistryManager = new PackageRegistryManager(this.log);
        }
    }

    /**
     * return packageRegistryManager
     */
    getPackageRegistryManager(): PackageRegistryManager{
        return this.packageRegistryManager;
    }

    /**
     * return async package cache
     */
    getCache(): IPackageStoreCacheAsync | null{
        return this.cache;
    }

    /**
     * set async package cache
     */
    setCache(cache: IPackageStoreCacheAsync): void{
        this.cache = cache;
    }

    /**
     * 
     * @param name return PackageStore
     * @param version package version
     * @param etag package etag 
     */
    getPackageStore(name: string, version?: string, etag?: string, registryName?: string): Promise<PackageStore | null>{
        return new Promise(async (resolve, reject) => {
            try {
                var packageStore: PackageStore | null;
            
                //cache get
                if (this.cache && etag === undefined){
                    packageStore = await this.cache.getPackageStore(name, version);
                    if (packageStore){
                        resolve(packageStore);
                        return;
                    }
                }
    
                packageStore = await this.packageRegistryManager.getPackageStore(name, version, etag, registryName);
    
                //cache put
                if (this.cache && packageStore !== null){
                    await this.cache.putPackageStore(packageStore);
                }
    
                resolve(packageStore);
            }
            catch (errTry) {
                reject(errTry);
            }
        })
    }
}