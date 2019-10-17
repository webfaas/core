import { IPackageRegistry } from "../../IPackageRegistry";
import { PackageRegistryDiskTarballConfig } from "./PackageRegistryDiskTarballConfig";
import { IPackageRegistryResponse } from "../../IPackageRegistryResponse";
import { PackageStore } from "../../../PackageStore/PackageStore";
import { PackageStoreUtil } from "../../../PackageStore/PackageStoreUtil";
import { IPackageStoreItemData } from "../../../PackageStore/IPackageStoreItemData";
import * as fs from "fs";
import * as path from "path";

/**
 * PackageRegistry Tarball in local disk
 */
export class PackageRegistryDiskTarball implements IPackageRegistry {
    private config: PackageRegistryDiskTarballConfig;

    constructor(config?: PackageRegistryDiskTarballConfig){
        if (config){
            this.config = config;
        }
        else{
            this.config = new PackageRegistryDiskTarballConfig();
        }
    }

    /**
     * return config
     */
    getConfig(): PackageRegistryDiskTarballConfig{
        return this.config;
    }

    /**
     * return manifest in IPackageRegistryResponse
     * @param name manifest name
     * @param etag manifest etag
     */
    getManifest(name: string, etag?: string): Promise<IPackageRegistryResponse>{
        return new Promise(async (resolve, reject) => {
            try {
                var fileEtag = "";
                var filePath = path.join(this.config.base, name, name + ".json");
                var packageResponseObj = {} as IPackageRegistryResponse;

                fs.stat(filePath, function(err, stats){
                    if (err){
                        if (err.code === "ENOENT") {
                            packageResponseObj.packageStore = null;
                            packageResponseObj.etag = "";
                            resolve(packageResponseObj);
                        }
                        else{
                            reject(err);
                        }
                    }
                    else{
                        fileEtag = stats.mtime.toISOString();

                        if (fileEtag === etag){
                            packageResponseObj.packageStore = null;
                            packageResponseObj.etag = etag;
                            resolve(packageResponseObj);
                        }
                        else{
                            fs.readFile(filePath, function(err, buffer){
                                if (err){
                                    reject(err);
                                }
                                else{
                                    packageResponseObj.packageStore = PackageStoreUtil.buildPackageStoreSingleItemFromBuffer(name, "", fileEtag, buffer, "package.json");

                                    resolve(packageResponseObj);
                                }
                            });
                        }
                    }
                })
            }
            catch (errTry) {
                reject(errTry);
            }
        });
    }

    /**
     * return package in IPackageRegistryResponse
     * @param name package name
     * @param version package version
     * @param etag package etag
     */
    getPackage(name: string, version: string, etag?: string): Promise<IPackageRegistryResponse> {
        return new Promise(async (resolve, reject) => {
            try {
                var fileEtag = "";
                var filePath = path.join(this.config.base, name, name + "-" + version + ".tgz");
                var packageResponseObj = {} as IPackageRegistryResponse;

                fs.stat(filePath, function(err, stats){
                    if (err){
                        if (err.code === "ENOENT") {
                            packageResponseObj.packageStore = null;
                            packageResponseObj.etag = "";
                            resolve(packageResponseObj);
                        }
                        else{
                            reject(err);
                        }
                    }
                    else{
                        fileEtag = stats.mtime.toISOString();

                        if (fileEtag === etag){
                            packageResponseObj.packageStore = null;
                            packageResponseObj.etag = etag;
                            resolve(packageResponseObj);
                        }
                        else{
                            fs.readFile(filePath, function(err, bufferCompressed){
                                if (err){
                                    reject(err);
                                }
                                else{
                                    var bufferDecompressed: Buffer = PackageStoreUtil.unzipSync(bufferCompressed);
                                    var dataPackageItemDataMap: Map<string, IPackageStoreItemData> = PackageStoreUtil.converBufferTarFormatToMapPackageItemDataMap(bufferDecompressed);
                                    packageResponseObj.packageStore = new PackageStore(name, version, fileEtag, bufferDecompressed, dataPackageItemDataMap);
                
                                    resolve(packageResponseObj);
                                }
                            });
                        }
                    }
                })
            }
            catch (errTry) {
                reject(errTry);
            }
        });
    }
}