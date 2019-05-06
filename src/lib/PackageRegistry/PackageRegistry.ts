import { IPackageRegistry } from "./IPackageRegistry";
import { IPackageRegistryResponse, PackageRegistryResponseFormatEnum } from "./IPackageRegistryResponse";
import { PackageRegistryItem, PackageRegistryItemStatusEnum, PackageRegistryItemError } from "./PackageRegistryItem";
import { PackageRegistryHTTPNPM } from "./Registries/HTTPNPM/PackageRegistryHTTPNPM";
import { PackageRegistryHTTPNPMConfig } from "./Registries/HTTPNPM/PackageRegistryHTTPNPMConfig";
import { IPackageRegistryParse } from "./IPackageRegistryParse";
import { PackageStore } from "../PackageStore/PackageStore";
import { PackageRegistryParseManifestUncompressed } from "./Parses/Manifest/PackageRegistryParseManifestUncompressed";
import { PackageRegistryParseTARCompressed } from "./Parses/Bundle/TAR/PackageRegistryParseTARCompressed";
import { PackageRegistryParseTARUncompressed } from "./Parses/Bundle/TAR/PackageRegistryParseTARUncompressed";

const listRegistry: Array<PackageRegistryItem> = [];
const listParse: Map<string, IPackageRegistryParse> = new Map<string, IPackageRegistryParse>();

export class PackageRegistry {
    constructor(){
        this.loadDefaultParses();
    }

    private loadDefaultParses(){
        this.addPackageParse(PackageRegistryResponseFormatEnum.MANIFEST_UNCOMPRESSED.toString(), new PackageRegistryParseManifestUncompressed());
        this.addPackageParse(PackageRegistryResponseFormatEnum.BUNDLE_TAR_COMPRESSED.toString(), new PackageRegistryParseTARCompressed());
        this.addPackageParse(PackageRegistryResponseFormatEnum.BUNDLE_TAR_UNCOMPRESSED.toString(), new PackageRegistryParseTARUncompressed());
    }

    loadDefaultRegistries(){
        var configNPM = new PackageRegistryHTTPNPMConfig("https://registry.npmjs.org");
        this.addRegistry(new PackageRegistryHTTPNPM(configNPM));
    }

    addRegistry(registry: IPackageRegistry){
        var item: PackageRegistryItem = new PackageRegistryItem(registry);
        listRegistry.push(item);
    }

    addPackageParse(name: string, parse: IPackageRegistryParse){
        listParse.set(name, parse);
    }

    packageParse(format: string, name: string, version: string, etag: string, data: Buffer): PackageStore{
        var parsePackage: IPackageRegistryParse | undefined = listParse.get(format);
        if (parsePackage){
            return parsePackage.parse(name, version, etag, data);
        }
        else{
            throw new Error("Parse package '" + format + "' not found");
        }
    }

    getPackageStoreData(name: string, version: string, etag: string): Promise<PackageStore | null>{
        return new Promise(async (resolve, reject) => {
            var manifestResponseObj: IPackageRegistryResponse;
            try {
                if (listRegistry.length){
                    for (var i = 0; i < listRegistry.length; i++){
                        var item: PackageRegistryItem = listRegistry[i];
                        if (item.status !== PackageRegistryItemStatusEnum.DISABLED){
                            try {
                                manifestResponseObj = await item.registry.getManifest(name, version, etag);
                                if (manifestResponseObj.data){
                                    resolve(this.packageParse(manifestResponseObj.format, name, version, manifestResponseObj.etag, manifestResponseObj.data));
                                }
                                else{
                                    resolve(null);
                                }                                
                            }
                            catch (errTryGetManifest) {
                                item.status = PackageRegistryItemStatusEnum.DISABLED;
                                item.error = new PackageRegistryItemError(errTryGetManifest);
                            }
                        }
                    }

                    reject("Registry not available");
                }
                else{
                    reject("Registry not configured");
                }
            }
            catch (errTry) {
                reject(errTry);
            }
        })
    }
}