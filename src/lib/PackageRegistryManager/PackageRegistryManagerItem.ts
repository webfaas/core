import { IPackageRegistry } from "../PackageRegistry/IPackageRegistry";

/**
 * state item of a PackageRegistryManager
 */
export enum PackageRegistryManagerItemStatusEnum {
    ENABLED = 0,
    DISABLED = 1
}

/**
 * item of a PackageRegistryManager
 */
export class PackageRegistryManagerItem {
    name: string;
    status: PackageRegistryManagerItemStatusEnum = PackageRegistryManagerItemStatusEnum.ENABLED;
    registry: IPackageRegistry;

    constructor(name: string, registry: IPackageRegistry){
        this.name = name;
        this.registry = registry;
    }
}