import { IPackageStoreCache } from "../IPackageStoreCache";
import { PackageStore } from "../../PackageStore/PackageStore";
import { PackageStoreCacheDiskConfig } from "./PackageStoreCacheDiskConfig";
import * as fs from "fs";
import * as path from "path";
import { Log } from "../../Log/Log";
import { LogLevelEnum, LogCodeEnum } from "../../Log/ILog";
import { IPackageStoreItemData } from "../../PackageStore/IPackageStoreItemData";
import { PackageStoreCacheDiskMetadata } from "./PackageStoreCacheDiskMetadata";
import { WebFaasError } from "../../WebFaasError/WebFaasError";

const FORMAT_VERSION = "V1";

/**
 * Cache PackageStore in disk
 */
export class PackageStoreCacheDisk implements IPackageStoreCache {
    config: PackageStoreCacheDiskConfig;
    private log: Log;

    constructor(config?: PackageStoreCacheDiskConfig, log?: Log){
        this.log = log || Log.getInstance();

        if (config){
            this.config = config;
        }
        else{
            this.config = new PackageStoreCacheDiskConfig();
        }
    }

    private checkExistsAndCreateDirectory(path: string): Promise<boolean>{
        return new Promise((resolve, reject) => {
            fs.stat(path, (err, stats) => {
                if (err){
                    if (err.code === "ENOENT"){
                        fs.mkdir(path, (err) => {
                            if (err){
                                this.log.writeError("checkExistsAndCreateDirectory", err, {path:path}, __filename);
                                reject(new WebFaasError.FileError(err));
                            }
                            else{
                                this.log.write(LogLevelEnum.INFO, "checkExistsAndCreateDirectory", LogCodeEnum.WRITEFILE.toString(), "directory created", {path:path}, __filename);
                                resolve(true);
                            }
                        })
                    }
                    else{
                        this.log.writeError("checkExistsAndCreateDirectory", err, {path:path}, __filename);
                        reject(new WebFaasError.FileError(err));
                    }
                }
                else{
                    resolve(false);
                }
            });
        });
    }

    private bufferToPackageStore(fileBuffer: Buffer): PackageStore {
        // FORMAT =>
        // |0000|METADATA|PACKAGE

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

            return packageStore;
        }
        else{
            throw new Error("Format version not supported")
        }
    }

    private PackageStoreTobuffer(packageStore: PackageStore): Buffer {
        // FORMAT =>
        // |0000|METADATA|PACKAGE

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

        return fileBuffer;
    }

    private getFilePath(name: string, version?: string){
        var basePathPackage = path.join(this.config.base, name);
        var filePath: string;
        
        if (version){
            filePath = path.join(basePathPackage, name + "-" + version + ".dat");
        }
        else{
            filePath = path.join(basePathPackage, "package.json");
        }

        return filePath;
    }

    getPackageStore(name: string, version?: string): Promise<PackageStore | null> {
        return new Promise(async (resolve, reject) => {
            try {
                var filePath: string = this.getFilePath(name, version);
                
                fs.readFile(filePath, (err, fileBuffer) => {
                    if (err){
                        if (err.code === "ENOENT"){
                            resolve(null);
                        }
                        else{
                            reject(new WebFaasError.FileError(err));
                        }
                    }
                    else{
                        var packageStore = this.bufferToPackageStore(fileBuffer);
                        resolve(packageStore);
                    }
                })
            }
            catch (errTry) {
                reject(errTry);
            }
        });
    }

    getPackageStoreSync(name: string, version?: string): PackageStore | null {
        try {
            var filePath: string = this.getFilePath(name, version);
            
            var fileBuffer: Buffer = fs.readFileSync(filePath);
            var packageStore = this.bufferToPackageStore(fileBuffer);
            return packageStore;
        }
        catch (errTry) {
            if (errTry.code === "ENOENT"){
                return null;
            }
            else{
                throw errTry;
            }
        }
    }

    putPackageStore(packageStore: PackageStore): Promise<PackageStore> {
        return new Promise(async (resolve, reject) => {
            try {
                // FORMAT =>
                // |0000|METADATA|PACKAGE

                var basePathPackage = path.join(this.config.base, packageStore.getName());
                var filePath: string = this.getFilePath(packageStore.getName(), packageStore.getVersion());
                
                await this.checkExistsAndCreateDirectory(this.config.base);

                await this.checkExistsAndCreateDirectory(basePathPackage);

                var fileBuffer: Buffer = this.PackageStoreTobuffer(packageStore);
                
                fs.writeFile(filePath, fileBuffer, (err) => {
                    if (err){
                        reject(new WebFaasError.FileError(err));
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