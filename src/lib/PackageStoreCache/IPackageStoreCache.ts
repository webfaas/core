import { PackageStore } from "../PackageStore/PackageStore";

/**
 * PackageStoreCache interface
 */
export interface IPackageStoreCache {
    getPackageStore(name: string, version?: string): Promise<PackageStore | null>
    getPackageStoreSync(name: string, version?: string): PackageStore | null
    putPackageStore(packageStore: PackageStore): Promise<PackageStore | null>
}