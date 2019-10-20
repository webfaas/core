import { PackageStore } from "../PackageStore/PackageStore";

/**
 * PackageStoreCache interface
 */
export interface IPackageStoreCache {
    getPackageStore(name: string, version?: string): Promise<PackageStore | null>
    putPackageStore(packageStore: PackageStore): Promise<PackageStore | null>
}