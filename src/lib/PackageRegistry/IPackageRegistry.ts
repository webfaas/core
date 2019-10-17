import { IPackageRegistryResponse } from "./IPackageRegistryResponse";

/**
 * PackageRegistry interface
 */
export interface IPackageRegistry {
    getManifest(name: string, etag?: string): Promise<IPackageRegistryResponse>
    getPackage(name: string, version: string, etag?: string): Promise<IPackageRegistryResponse>
}