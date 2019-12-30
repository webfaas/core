import { IPackageRegistry } from "../PackageRegistry/IPackageRegistry";

/**
 * state item of a PackageRegistryManager
 */
export enum PackageRegistryManagerItemStatusEnum {
    ENABLED = 0,
    DISABLED = 1
}

/**
 * item of a PackageRegistryManager when in error state
 */
export class PackageRegistryManagerItemError {
    lastDate: Date
    lastError: any

    constructor(error: any, date?: Date){
        this.lastError = error;
        
        if (date){
            this.lastDate = date;
        }
        else{
            this.lastDate = new Date();
        }
    }
}

/**
 * item of a PackageRegistryManager
 */
export class PackageRegistryManagerItem {
    name: string;
    error: PackageRegistryManagerItemError | null = null;
    status: PackageRegistryManagerItemStatusEnum = PackageRegistryManagerItemStatusEnum.ENABLED;
    registry: IPackageRegistry;

    constructor(name: string, registry: IPackageRegistry){
        this.name = name;
        this.registry = registry;
    }
}