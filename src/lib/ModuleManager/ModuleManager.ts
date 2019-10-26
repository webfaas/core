import { Log } from "../Log/Log";
import { PackageStore } from "../PackageStore/PackageStore";
import { PackageStoreManager } from "../PackageStoreManager/PackageStoreManager";
import { PackageRegistryManager } from "../PackageRegistryManager/PackageRegistryManager";
import { PackageStoreCacheMemory } from "../PackageStoreCache/Memory/PackageStoreCacheMemory";
import { PackageStoreCacheDisk } from "../PackageStoreCache/Disk/PackageStoreCacheDisk";
import { IPackageStoreCache } from "../PackageStoreCache/IPackageStoreCache";
import { IManifest } from "../Manifest/IManifest";

/**
 * manager Module
 */
export class ModuleManager {
    private log: Log;
    
    private packageStoreManager: PackageStoreManager;
    
    constructor(packageStoreManager?: PackageStoreManager, log?: Log){
        this.log = log || Log.getInstance();

        if (packageStoreManager){
            this.packageStoreManager = packageStoreManager;
        }
        else{
            //TODO: CHECK CONFIG FILE

            let packageRegistryManager = new PackageRegistryManager(this.log);
            packageRegistryManager.loadDefaultRegistries();

            let diskPackageStore = new PackageStoreCacheDisk();
            
            this.packageStoreManager = new PackageStoreManager(packageRegistryManager, diskPackageStore, this.log);
        }
    }

    getPackageStoreManager(): PackageStoreManager{
        return this.packageStoreManager;
    }

    /**
     * 
     * @param name module name
     * @param version module version
     * @param etag module etag 
     */
    import(name: string, version?: string, etag?: string): Promise<Object | null>{
        return new Promise(async (resolve, reject) => {
            var packageStore: PackageStore | null;

            packageStore = await this.packageStoreManager.getPackageStore(name, version, etag);

            if (packageStore){
                var contextCache = new PackageStoreCacheMemory();
                await this.importDependencies(packageStore, contextCache);
    
                //compile
                console.log("compilar", contextCache.getTotalEntry());
    
                resolve(null);
            }
            else{
                resolve(null);
            }
        })
    }

    private importDependencies(packageStore: PackageStore, contextCache?: IPackageStoreCache): Promise<null>{
        return new Promise(async (resolve, reject) => {
            var packageManifestObj: IManifest | null = packageStore.getManifest();

            if (packageManifestObj && packageManifestObj.dependencies){
                var dependencyKeys = Object.keys(packageManifestObj.dependencies);

                for (var i = 0; i < dependencyKeys.length; i++){
                    var nameDependency: string = dependencyKeys[i];
                    var versionDependency: string = packageManifestObj.dependencies[nameDependency];

                    console.log("*** dependency", packageStore.getName(), " => ", nameDependency + ":" + versionDependency);

                    var packageStoreDependency: PackageStore | null = await this.packageStoreManager.getPackageStore(nameDependency, versionDependency);
                    if (packageStoreDependency){
                        //cache
                        if (contextCache){
                            contextCache.putPackageStore(packageStoreDependency);
                        }
    
                        await this.importDependencies(packageStoreDependency, contextCache);
                    }
                    else{
                        reject("Package " + packageStore.getName() + ". Dependency " + nameDependency + ":" + versionDependency + " not found.");
                        return;
                    }
                }
            }

            resolve(null);
        })
    }
}