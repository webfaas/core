import { IPackageStoreItemData } from "../../../PackageStore/IPackageStoreItemData";

export class PackageRegistryManagerCacheDiskMetadata  {
    formatVersion: string = "";
    packageName: string = "";
    packageVersion: string = "";
    packageEtag: string = "";
    listItem: Array<IPackageStoreItemData> = [];
}