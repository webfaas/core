import { IPlugin } from "./IPlugin";
import { IPackageRegistry } from "../PackageRegistry/IPackageRegistry";
import { PackageRegistryManagerItemStatusEnum } from "../PackageRegistryManager/PackageRegistryManagerItem";

export interface IPluginPackageRegistry extends IPlugin {
    name: string
    status: PackageRegistryManagerItemStatusEnum
    registry: IPackageRegistry;
}