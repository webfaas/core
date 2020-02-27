import { PackageStoreItemBufferResponse } from "../PackageStore/PackageStoreItemBufferResponse";
import { ModuleCompileManifestData } from "../ModuleCompile/ModuleCompileManifestData";
import { IManifest } from "../Manifest/IManifest";

export interface ICodeBufferResponseFromPackageStoreCacheSync {
    packageStoreItemBufferResponse: PackageStoreItemBufferResponse
    moduleCompileManifestData: ModuleCompileManifestData
    manifest: IManifest | null
}