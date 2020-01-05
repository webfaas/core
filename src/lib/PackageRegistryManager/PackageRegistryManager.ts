import { IPackageRegistry } from "../PackageRegistry/IPackageRegistry";
import { IPackageRegistryResponse } from "../PackageRegistry/IPackageRegistryResponse";
import { PackageRegistryManagerItem } from "./PackageRegistryManagerItem";
import { PackageStore } from "../PackageStore/PackageStore";
import { Log } from "../Log/Log";

/**
 * manager PackageRegistry pool
 */
export class PackageRegistryManager {
    private log: Log;
    private defaultRegistryName: string = "";
    private listRegistry: Map<string, PackageRegistryManagerItem> = new Map<string, PackageRegistryManagerItem>();

    /**
     * return default registry name
     */
    getDefaultRegistryName(): string{
        return this.defaultRegistryName;
    }
    /**
     * set default registry name
     * @param name registry name
     */
    setDefaultRegistryName(name: string): void{
        this.defaultRegistryName = name;
    }

    /**
     * return item registry by registry name
     * @param name registry name
     */
    getRegistryItem(name: string): PackageRegistryManagerItem | null{
        return this.listRegistry.get(name) || null;
    }

    /**
     * return registry by name
     * @param name registry name
     */
    getRegistry(name: string): IPackageRegistry | null{
        let item = this.getRegistryItem(name);
        if (item){
            return item.registry;
        }
        else{
            return null;
        }
    }

    /**
     * 
     * @param moduleName return registry name by extenal routing
     */
    getRegistryNameByExternalRouting(moduleName: string){
        return "";
    }

    /**
     * return RegistryManagerItem by module name
     * @param name module name
     */
    getRegistryManagerItemByModuleName(moduleName: string): PackageRegistryManagerItem | null{
        let targetName: string;
        let item: PackageRegistryManagerItem | null = null;
        
        targetName = this.getRegistryNameByExternalRouting(moduleName);
        
        if (targetName){
            item = this.getRegistryItem(targetName);
        }
        else{
            item = this.getRegistryItem(this.defaultRegistryName);
        }

        return item;
    }

    constructor(log?: Log){
        this.log = log || Log.getInstance();
    }

    /**
     * add registry
     * @param name  name of registry
     * @param slaveName slave name of registry
     * @param registry registry
     */
    addRegistry(name: string, slaveName: string, registry: IPackageRegistry): void{
        var item: PackageRegistryManagerItem = new PackageRegistryManagerItem(name, slaveName, registry);
        this.listRegistry.set(name, item);
        if (!this.defaultRegistryName){
            this.setDefaultRegistryName(name);
        }
    }

    /**
     * 
     * @param name return PackageStore
     * @param version package version
     * @param etag package etag 
     */
    getPackageStore(name: string, version?: string, etag?: string, registryName?: string): Promise<PackageStore | null>{
        return new Promise(async (resolve, reject) => {
            var packageRegistryResponseObj: IPackageRegistryResponse;

            if (this.listRegistry.size){
                let item: PackageRegistryManagerItem | null;
                if (registryName){
                    item = this.getRegistryItem(registryName);
                }
                else{
                    item = this.getRegistryManagerItemByModuleName(name);
                }
                
                if (item){
                    try {
                        if (version){
                            packageRegistryResponseObj = await item.registry.getPackage(name, version, etag);
                            //TO-DO: RETRY WITH SLAVE
                        }
                        else{
                            packageRegistryResponseObj = await item.registry.getManifest(name, etag);
                            //TO-DO: RETRY WITH SLAVE
                        }

                        if (packageRegistryResponseObj.packageStore) {
                            resolve(packageRegistryResponseObj.packageStore);
                        }
                        else{
                            resolve(null);
                        }
                    }
                    catch (errTryGetPackageOrManifest) {
                        reject(errTryGetPackageOrManifest);
                    }
                }
                else{
                    reject(new Error("PackageRegistryManagerItem not available"));
                }
            }
            else{
                reject(new Error("PackageRegistryManager not configured"));
            }
        })
    }
}