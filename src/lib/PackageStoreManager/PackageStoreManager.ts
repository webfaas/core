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
    
    packageRegistryManager: PackageRegistryManager | null;
    cache: IPackageStoreCache | null;
    
    constructor(packageRegistryManager?: PackageRegistryManager, cache?: IPackageStoreCache, log?: Log){
        this.log = log || Log.getInstance();

        if (packageRegistryManager){
            this.packageRegistryManager = packageRegistryManager;
        }
        else{
            this.packageRegistryManager = new PackageRegistryManager(this.log);
            this.packageRegistryManager.loadDefaultRegistries();
        }

        if (cache){
            this.cache = cache;
        }
        else{
            this.cache = new PackageStoreCacheMemory();
        }
    }

    /**
     * 
     * @param name return PackageStore
     * @param version package version
     * @param etag package etag 
     */
    getPackageStore(name: string, version?: string, etag?: string): Promise<PackageStore | null>{
        return new Promise(async (resolve, reject) => {
            var packageStore: PackageStore | null;

            //cache get
            if (this.cache && etag === undefined){
                packageStore = await this.cache.getPackageStore(name, version);
                if (packageStore){
                    resolve(packageStore);
                    return;
                }
            }

            if (this.packageRegistryManager){
                packageStore = await this.packageRegistryManager.getPackageStore(name, version, etag);

                //cache put
                if (this.cache && packageStore){
                    await this.cache.putPackageStore(packageStore);
                }
    
                resolve(packageStore);
            }
            else{
                resolve(null);
            }
        })
    }
}