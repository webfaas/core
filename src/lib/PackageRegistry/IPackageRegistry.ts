import { IPackageRegistryResponse } from "./IPackageRegistryResponse";

export interface IPackageRegistry {
    getManifest(name: string, version: string, etag?: string): Promise<IPackageRegistryResponse>
}