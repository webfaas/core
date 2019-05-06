import { IPackageRegistryParse } from "../../../IPackageRegistryParse";
import { PackageStore } from "../../../../PackageStore/PackageStore";
import { PackageRegistryUtil } from "../../../PackageRegistryUtil";
import { IPackageStoreItemData } from "../../../../PackageStore/IPackageStoreItemData";

export class PackageRegistryParseTARUncompressed implements IPackageRegistryParse {
    parse(name: string, version: string, etag: string, data: Buffer): PackageStore {
        var dataPackageItemDataMap: Map<string, IPackageStoreItemData> = PackageRegistryUtil.converBufferTarFormatToMapPackageItemDataMap(data);
        var packageStoreData: PackageStore = new PackageStore(name, version, etag, data, dataPackageItemDataMap);
        return packageStoreData;
    }
}