import { PackageStore } from "../PackageStore/PackageStore";

/**
 * PackageStoreCache Sync interface
 */
export interface IPackageStoreCacheSync {
    getPackageStore(name: string, version?: string): PackageStore | null
    putPackageStore(packageStore: PackageStore): void
}