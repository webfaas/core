import { PackageStore } from "../../../../PackageStore/PackageStore";
import { IPackageRegistryParse } from "../../../IPackageRegistryParse";
import { PackageRegistryUtil } from "../../../PackageRegistryUtil";
import { IPackageStoreItemData } from "../../../../PackageStore/IPackageStoreItemData";

export class PackageRegistryParseTARCompressed implements IPackageRegistryParse {
    parse(name: string, version: string, etag: string, data: Buffer): PackageStore {
        var bufferDecompressed: Buffer = PackageRegistryUtil.unzipSync(data);

        var dataPackageItemDataMap: Map<string, IPackageStoreItemData> = PackageRegistryUtil.converBufferTarFormatToMapPackageItemDataMap(bufferDecompressed);
        var packageStoreData: PackageStore = new PackageStore(name, version, etag, bufferDecompressed, dataPackageItemDataMap);
        return packageStoreData;
    }
}