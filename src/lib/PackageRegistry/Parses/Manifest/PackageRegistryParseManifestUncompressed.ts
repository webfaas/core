import { IPackageRegistryParse } from "../../IPackageRegistryParse";
import { PackageStore } from "../../../PackageStore/PackageStore";
import { IPackageStoreItemData } from "../../../PackageStore/IPackageStoreItemData";

export class PackageRegistryParseManifestUncompressed implements IPackageRegistryParse {
    parse(name: string, version: string, etag: string, data: Buffer): PackageStore {
        return PackageStore.buildPackageStoreSingleItemFromBuffer(name, version, etag, data, "package.json");
    }
}