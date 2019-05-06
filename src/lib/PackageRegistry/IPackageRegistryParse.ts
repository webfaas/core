import { PackageStore } from "../PackageStore/PackageStore";

export interface IPackageRegistryParse {
    parse(name: string, version: string, etag: string, data: Buffer): PackageStore
}