import { IPackageStoreCache } from "../IPackageStoreCache";
import { PackageStore } from "../../PackageStore/PackageStore";
import { PackageStoreCacheDiskConfig } from "./PackageStoreCacheDiskConfig";
import * as fs from "fs";
import * as path from "path";
import { Log } from "../../Log/Log";
import { LogLevelEnum, LogCodeEnum } from "../../Log/ILog";
import { IPackageStoreItemData } from "../../PackageStore/IPackageStoreItemData";
import { PackageStoreCacheDiskMetadata } from "./PackageStoreCacheDiskMetadata";

const log = Log.getInstance();
const FORMAT_VERSION = "V1";

/**
 * Cache PackageStore in disk
 */
export class PackageStoreCacheDisk implements IPackageStoreCache {
    config: PackageStoreCacheDiskConfig;

    constructor(config?: PackageStoreCacheDiskConfig){
        if (config){
            this.config = config;
        }
        else{
            this.config = new PackageStoreCacheDiskConfig();
        }
    }

    private checkExistsAndCreateDirectory(path: string): Promise<boolean>{
        return new Promise((resolve, reject) => {
            fs.stat(path, function(err, stats){
                if (err){
                    if (err.code === "ENOENT"){
                        fs.mkdir(path, function(err){
                            if (err){
                                log.writeError("checkExistsAndCreateDirectory", err, {path:path}, __filename);
                                reject(err);
                            }
                            else{
                                log.write(LogLevelEnum.INFO, "checkExistsAndCreateDirectory", LogCodeEnum.WRITEFILE.toString(), "directory created", {path:path}, __filename);
                                resolve(true);
                            }
                        })
                    }
                    else{
                        log.writeError("checkExistsAndCreateDirectory", err, {path:path}, __filename);
                        reject(err);
                    }
                }
                else{
                    resolve(false);
                }
            });
        });
    }

    getPackageStore(name: string, version?: string): Promise<PackageStore | null> {
        return new Promise(async (resolve, reject) => {
            try {
                // FORMAT =>
                // |0000|METADATA|PACKAGE

                var basePathPackage = path.join(this.config.base, name);
                var filePath: string;
                
                if (version){
                    filePath = path.join(basePathPackage, name + "-" + version + ".dat");
                }
                else{
                    filePath = path.join(basePathPackage, "package.json");
                }

                fs.readFile(filePath, function(err, fileBuffer){
                    if (err){
                        if (err.code === "ENOENT"){
                            resolve(null);
                        }
                        else{
                            reject(err);
                        }
                    }
                    else{
                        var metadataBuffer = Buffer.alloc(fileBuffer.readInt32LE(0));
                        var packageBuffer = Buffer.alloc(fileBuffer.length - metadataBuffer.length - 4);
                        fileBuffer.copy(metadataBuffer, 0, 4);
                        fileBuffer.copy(packageBuffer, 0, 4 + metadataBuffer.length);

                        var dataPackageItemDataMap: Map<string, IPackageStoreItemData> = new Map<string, IPackageStoreItemData>();
                        
                        var metaData: PackageStoreCacheDiskMetadata = JSON.parse(metadataBuffer.toString("utf8"));
                        if (metaData.formatVersion === FORMAT_VERSION){
                            metaData.listItem.forEach(function(item: IPackageStoreItemData){
                                dataPackageItemDataMap.set(item.name, item);
                            });
    
                            var packageStore: PackageStore;
                            packageStore = new PackageStore(metaData.packageName, metaData.packageVersion, metaData.packageEtag, packageBuffer, dataPackageItemDataMap);
    
                            resolve(packageStore);
                        }
                        else{
                            reject("Format version not supported");
                        }
                    }
                })
            }
            catch (errTry) {
                reject(errTry);
            }
        });
    }

    putPackageStore(packageStore: PackageStore): Promise<PackageStore> {
        return new Promise(async (resolve, reject) => {
            try {
                // FORMAT =>
                // |0000|METADATA|PACKAGE

                var basePathPackage = path.join(this.config.base, packageStore.getName());
                var filePath: string;
                
                if (packageStore.getVersion()){
                    filePath = path.join(basePathPackage, packageStore.getName() + "-" + packageStore.getVersion() + ".dat");
                }
                else{
                    filePath = path.join(basePathPackage, "package.json");
                }

                await this.checkExistsAndCreateDirectory(this.config.base);

                await this.checkExistsAndCreateDirectory(basePathPackage);

                var metaData: PackageStoreCacheDiskMetadata = new PackageStoreCacheDiskMetadata();
                metaData.formatVersion = FORMAT_VERSION;
                metaData.packageName = packageStore.getName();
                metaData.packageVersion = packageStore.getVersion();
                metaData.packageEtag = packageStore.getEtag();

                packageStore.getDataPackageItemDataMap().forEach(function(item){
                    metaData.listItem.push(item);
                })
                var metadataBuffer = Buffer.from(JSON.stringify(metaData), "utf8");

                var fileBuffer = Buffer.alloc(4 + metadataBuffer.length + packageStore.getPackageBuffer().length);
                
                fileBuffer.writeInt32LE(metadataBuffer.length, 0);
                metadataBuffer.copy(fileBuffer, 4);
                packageStore.getPackageBuffer().copy(fileBuffer, 4 + metadataBuffer.length);

                fs.writeFile(filePath, fileBuffer, function(err){
                    if (err){
                        reject(err);
                    }
                    else{
                        resolve();
                    }
                });
            }
            catch (errTry) {
                reject(errTry);
            }
        });
    }
}