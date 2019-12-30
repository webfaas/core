import { IPackageRegistry } from "../PackageRegistry/IPackageRegistry";
import { IPackageRegistryResponse } from "../PackageRegistry/IPackageRegistryResponse";
import { PackageRegistryManagerItem, PackageRegistryManagerItemStatusEnum, PackageRegistryManagerItemError } from "./PackageRegistryManagerItem";
import { PackageRegistryNPM } from "../PackageRegistry/Registries/NPM/PackageRegistryNPM";
import { PackageRegistryGitHubTarballV3 } from "../PackageRegistry/Registries/GitHubTarballV3/PackageRegistryGitHubTarballV3";
import { PackageRegistryDiskTarball } from "../PackageRegistry/Registries/DiskTarball/PackageRegistryDiskTarball";
import { PackageStore } from "../PackageStore/PackageStore";
import { Log } from "../Log/Log";

export enum PackageRegistryManagerRegistryTypeEnum {
    NPM = "NPM",
    DISK = "DISK",
    GITHUB = "GITHUB"
}

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
    getDefaultRegistryName(){
        return this.defaultRegistryName;
    }
    /**
     * set default registry name
     * @param name registry name
     */
    setDefaultRegistryName(name: string){
        if (this.listRegistry.has(name)){
            this.defaultRegistryName = name;
        }
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
     * load default registries
     */
    loadDefaultRegistries(){
        this.loadRegistry(PackageRegistryManagerRegistryTypeEnum.NPM);
        this.loadRegistry(PackageRegistryManagerRegistryTypeEnum.DISK);
        this.loadRegistry(PackageRegistryManagerRegistryTypeEnum.GITHUB);
    }

    /**
     * load registry
     */
    loadRegistry(type: PackageRegistryManagerRegistryTypeEnum){
        switch (type){
            case PackageRegistryManagerRegistryTypeEnum.NPM:
                this.addRegistry(PackageRegistryManagerRegistryTypeEnum.NPM.toString(), new PackageRegistryNPM(undefined, this.log));
                break;
            case PackageRegistryManagerRegistryTypeEnum.DISK:
                this.addRegistry(PackageRegistryManagerRegistryTypeEnum.DISK.toString(), new PackageRegistryDiskTarball(undefined, this.log));
                break;
            case PackageRegistryManagerRegistryTypeEnum.GITHUB:
                this.addRegistry(PackageRegistryManagerRegistryTypeEnum.GITHUB.toString(), new PackageRegistryGitHubTarballV3(undefined, this.log));
                break;
        }
    }

    /**
     * add registrie
     * @param name registry
     * @param registry registry object
     * @param status [ENABLED | DISABLED]
     */
    addRegistry(name: string, registry: IPackageRegistry, status: PackageRegistryManagerItemStatusEnum = PackageRegistryManagerItemStatusEnum.ENABLED){
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
    addRouteByScope(scopeName: string, registryName: string){
        this.listRouteByScope.set(scopeName, registryName);
    }
    /**
     * remove route by scope name
     * @param scopeName scope name
     */
    removeRouteByScope(scopeName: string){
        this.listRouteByScope.delete(scopeName);
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

            if (this.listRegistry.size){
                let registryName: string;
                let scopeName = this.getScopeByModuleName(name);

                registryName = this.getRouteByScope(scopeName);
                if (!registryName){
                    registryName = this.defaultRegistryName;
                }

                let item: PackageRegistryManagerItem | undefined = this.listRegistry.get(registryName);
                if (item && item.status === PackageRegistryManagerItemStatusEnum.ENABLED){
                    try {
                        item.error = null;
                        
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
                        lastError = errTryGetManifest;
                        item.error = new PackageRegistryManagerItemError(errTryGetManifest);
                        reject(errTryGetManifest);
                    }
                }
                else{
                    reject(lastError || new Error("PackageRegistryManagerItem not available"));
                }
            }
            else{
                reject(new Error("PackageRegistryManager not configured"));
            }
        })
    }
}