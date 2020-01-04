import { IPackageRegistry } from "../PackageRegistry/IPackageRegistry";
import { IPackageRegistryResponse } from "../PackageRegistry/IPackageRegistryResponse";
import { PackageRegistryManagerItem, PackageRegistryManagerItemStatusEnum } from "./PackageRegistryManagerItem";
import { PackageStore } from "../PackageStore/PackageStore";
import { Log } from "../Log/Log";

/**
 * manager PackageRegistry pool
 */
export class PackageRegistryManager {
    private log: Log;
    private defaultRegistryName: string = "";
    private listRegistry: Map<string, PackageRegistryManagerItem> = new Map<string, PackageRegistryManagerItem>();
    private listRouteByScope: Map<string, string> = new Map<string, string>();

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
     * return scope name by module name
     * @param name module name
     */
    private getScopeByModuleName(name: string): string{
        if (name.substring(0,1) === "@"){
            return name.substring(1, name.indexOf("/"));
        }
        else{
            return "default";
        }
    }
    
    constructor(log?: Log){
        this.log = log || Log.getInstance();
    }

    /**
     * add registrie
     * @param name registry
     * @param registry registry object
     * @param status [ENABLED | DISABLED]
     */
    addRegistry(name: string, registry: IPackageRegistry, status: PackageRegistryManagerItemStatusEnum = PackageRegistryManagerItemStatusEnum.ENABLED): void{
        var item: PackageRegistryManagerItem = new PackageRegistryManagerItem(name, registry);
        item.status = status;
        this.listRegistry.set(name, item);
        if (!this.defaultRegistryName){
            if (item.status !== PackageRegistryManagerItemStatusEnum.DISABLED){
                this.setDefaultRegistryName(name);
            }
        }
    }

    /**
     * return registry name by scope name
     * @param scopeName scope name
     */
    getRouteByScope(scopeName: string): string{
        return this.listRouteByScope.get(scopeName) || "";
    }
    /**
     * add route by scope name
     * @param scopeName scope name
     * @param registryName registry name
     */
    addRouteByScope(scopeName: string, registryName: string): void{
        this.listRouteByScope.set(scopeName, registryName);
    }
    /**
     * remove route by scope name
     * @param scopeName scope name
     */
    removeRouteByScope(scopeName: string): void{
        this.listRouteByScope.delete(scopeName);
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
                let registryNameTarget: string;
                
                if (registryName){
                    registryNameTarget = registryName;
                }
                else{
                    let scopeName = this.getScopeByModuleName(name);
                    registryNameTarget = this.getRouteByScope(scopeName);
                    if (!registryNameTarget){
                        registryNameTarget = this.defaultRegistryName;
                    }
                }

                let item: PackageRegistryManagerItem | undefined = this.listRegistry.get(registryNameTarget);
                if (item && item.status === PackageRegistryManagerItemStatusEnum.ENABLED){
                    try {
                        if (version){
                            packageRegistryResponseObj = await item.registry.getPackage(name, version, etag);
                        }
                        else{
                            packageRegistryResponseObj = await item.registry.getManifest(name, etag);
                        }

                        if (packageRegistryResponseObj.packageStore) {
                            resolve(packageRegistryResponseObj.packageStore);
                        }
                        else{
                            resolve(null);
                        }
                    }
                    catch (errTryGetManifest) {
                        reject(errTryGetManifest);
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