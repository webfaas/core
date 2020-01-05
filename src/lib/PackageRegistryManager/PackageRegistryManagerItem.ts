import { IPackageRegistry } from "../PackageRegistry/IPackageRegistry";

/**
 * item of a PackageRegistryManager
 */
export class PackageRegistryManagerItem {
    name: string;
    slaveName: string;
    registry: IPackageRegistry;

    constructor(name: string, slaveName: string, registry: IPackageRegistry){
        this.name = name;
        this.slaveName = slaveName;
        this.registry = registry;
    }
}