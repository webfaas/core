import { PackageStore } from "../PackageStore/PackageStore";

/**
 * PackageRegistryManagerCache interface
 */
export interface IPackageRegistryManagerCache {
    getPackageStore(name: string, version?: string): Promise<PackageStore | null>
    putPackageStore(packageStore: PackageStore): Promise<PackageStore | null>
}