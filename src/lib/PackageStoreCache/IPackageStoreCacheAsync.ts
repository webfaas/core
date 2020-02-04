import { PackageStore } from "../PackageStore/PackageStore";

/**
 * PackageStoreCache interface
 */
export interface IPackageStoreCacheAsync {
    getPackageStore(name: string, version?: string): Promise<PackageStore | null>
    putPackageStore(packageStore: PackageStore): Promise<void>
}