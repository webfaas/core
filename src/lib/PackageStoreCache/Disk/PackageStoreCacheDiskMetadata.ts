import { IPackageStoreItemData } from "../../PackageStore/IPackageStoreItemData";

export class PackageStoreCacheDiskMetadata  {
    formatVersion: string = "";
    packageName: string = "";
    packageVersion: string = "";
    packageEtag: string = "";
    listItem: Array<IPackageStoreItemData> = [];
}