import { IPackageRegistryResponse } from "./IPackageRegistryResponse";

/**
 * PackageRegistry interface
 */
export interface IPackageRegistry {
    getTypeName(): string
    getManifest(name: string, etag?: string): Promise<IPackageRegistryResponse>
    getPackage(name: string, version: string, etag?: string): Promise<IPackageRegistryResponse>
    start(): Promise<any>
    stop(): Promise<any>
}