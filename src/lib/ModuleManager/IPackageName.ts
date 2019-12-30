import { PackageStore } from "../PackageStore/PackageStore";

export interface IPackageName {
    getPackageStore(name: string, version?: string): Promise<PackageStore | null>
    getPackageStoreSync(name: string, version?: string): PackageStore | null
    putPackageStore(packageStore: PackageStore): Promise<PackageStore | null>
}