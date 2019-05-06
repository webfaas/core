import { IPackageRegistry } from "./IPackageRegistry";

export enum PackageRegistryItemStatusEnum {
    ENABLED = 0,
    DISABLED = 1
}

export class PackageRegistryItemError {
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

export class PackageRegistryItem {
    error: PackageRegistryItemError | null = null;
    status: PackageRegistryItemStatusEnum = PackageRegistryItemStatusEnum.ENABLED;
    registry: IPackageRegistry;

    constructor(registry: IPackageRegistry){
        this.registry = registry;
    }
}