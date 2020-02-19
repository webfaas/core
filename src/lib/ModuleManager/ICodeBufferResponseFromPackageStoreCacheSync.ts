import { PackageStoreItemBufferResponse } from "../PackageStore/PackageStoreItemBufferResponse";
import { ModuleCompileManifestData } from "../ModuleCompile/ModuleCompileManifestData";

export interface ICodeBufferResponseFromPackageStoreCacheSync {
    packageStoreItemBufferResponse: PackageStoreItemBufferResponse;
    moduleCompileManifestData: ModuleCompileManifestData;
}