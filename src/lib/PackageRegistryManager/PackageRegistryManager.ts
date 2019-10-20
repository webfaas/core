import { IPackageRegistry } from "../PackageRegistry/IPackageRegistry";
import { IPackageRegistryResponse } from "../PackageRegistry/IPackageRegistryResponse";
import { PackageRegistryManagerItem, PackageRegistryManagerItemStatusEnum, PackageRegistryManagerItemError } from "./PackageRegistryManagerItem";
import { PackageRegistryNPM } from "../PackageRegistry/Registries/NPM/PackageRegistryNPM";
import { PackageRegistryNPMConfig } from "../PackageRegistry/Registries/NPM/PackageRegistryNPMConfig";
import { PackageStore } from "../PackageStore/PackageStore";
import { Log } from "../Log/Log";

/**
 * manage PackageRegistry pool
 */
export class PackageRegistryManager {
    private log: Log;
    
    listRegistry: Array<PackageRegistryManagerItem> = [];
    
    constructor(log?: Log){
        this.log = log || Log.getInstance();
    }

    /**
     * load default registries
     */
    loadDefaultRegistries(){
        this.addRegistry("npm", new PackageRegistryNPM(undefined, this.log), false);
    }

    /**
     * add registrie
     * @param name registry
     * @param registry registry object
     * @param enableSeekNextRegistryWhenPackageStoreNotFound enable seek next registry item when PackageStore not found in getPackageStore
     */
    addRegistry(name: string, registry: IPackageRegistry, enableSeekNextRegistryWhenPackageStoreNotFound?: boolean){
        var item: PackageRegistryManagerItem = new PackageRegistryManagerItem(name, registry, enableSeekNextRegistryWhenPackageStoreNotFound);
        this.listRegistry.push(item);
    }

    /**
     * 
     * @param name return PackageStore
     * @param version package version
     * @param etag package etag 
     */
    getPackageStore(name: string, version?: string, etag?: string): Promise<PackageStore | null>{
        return new Promise(async (resolve, reject) => {
            var packageRegistryResponseObj: IPackageRegistryResponse;
            var lastError = null;

            //cache
            /*
            if (etag === undefined && this.cache){
                let packageStore: PackageStore | null = await this.cache.getPackageStore(name, version);
                if (packageStore){
                    resolve(packageStore);
                    return;
                }
            }
            */

            if (this.listRegistry.length){
                for (var i = 0; i < this.listRegistry.length; i++){
                    var item: PackageRegistryManagerItem = this.listRegistry[i];
                    if (item.status !== PackageRegistryManagerItemStatusEnum.DISABLED){
                        try {
                            if (version){
                                packageRegistryResponseObj = await item.registry.getPackage(name, version, etag);
                            }
                            else{
                                packageRegistryResponseObj = await item.registry.getManifest(name, etag);
                            }

                            if (!packageRegistryResponseObj.packageStore && !packageRegistryResponseObj.etag && item.enableSeekNextRegistryWhenPackageStoreNotFound) {
                                //not found packageStore. Seek Next Item!
                            }
                            else{
                                resolve(packageRegistryResponseObj.packageStore);
                                return;
                            }
                        }
                        catch (errTryGetManifest) {
                            lastError = errTryGetManifest;
                            item.status = PackageRegistryManagerItemStatusEnum.DISABLED;
                            item.error = new PackageRegistryManagerItemError(errTryGetManifest);
                            //Seek Next Item!
                        }
                    }
                }

                reject(lastError || "PackageRegistryManagerItem not available");
            }
            else{
                reject(lastError || "PackageRegistryManager not configured");
            }
        })
    }
}