import { PackageStore } from "../PackageStore/PackageStore";
import { Log } from "../Log/Log";
import { PackageRegistryManager } from "../PackageRegistryManager/PackageRegistryManager";
import { IPackageStoreCache } from "../PackageStoreCache/IPackageStoreCache";
import { PackageStoreCacheMemory } from "../PackageStoreCache/Memory/PackageStoreCacheMemory";

/**
 * manager PackageStore
 */
export class PackageStoreManager {
    private log: Log;
    private cache: IPackageStoreCache | null;
    private packageRegistryManager: PackageRegistryManager;
    
    constructor(packageRegistryManager?: PackageRegistryManager, cache?: IPackageStoreCache, log?: Log){
        this.log = log || Log.getInstance();
        this.cache = cache || null;

        if (packageRegistryManager){
            this.packageRegistryManager = packageRegistryManager;
        }
        else{
            this.packageRegistryManager = new PackageRegistryManager(this.log);
            this.packageRegistryManager.loadDefaultRegistries();
        }
    }

    /**
     * return packageRegistryManager
     */
    getPackageRegistryManager(): PackageRegistryManager{
        return this.packageRegistryManager;
    }

    /**
     * return default cache
     */
    getCache(): IPackageStoreCache | null{
        return this.cache;
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