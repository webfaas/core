import { PackageStore } from "../PackageStore/PackageStore";

/**
 * PackageRegistryResponse interface
 */
export interface IPackageRegistryResponse {
    etag: string
    packageStore: PackageStore | null
}