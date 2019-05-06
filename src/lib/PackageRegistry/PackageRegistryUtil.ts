import * as zlib from "zlib";
import { IPackageStoreItemData } from "../PackageStore/IPackageStoreItemData";

export class PackageRegistryUtil  {
    
    static unzipAsync(bufferGZ: Buffer): Promise< Buffer > {
        return new Promise(function(resolve, reject) {
            try {
                zlib.unzip(bufferGZ, { finishFlush: zlib.constants.Z_SYNC_FLUSH }, function(err: any, bufferDecompressed: Buffer) {
                    if (err){
                        reject(err);
                    }
                    else{
                        resolve(bufferDecompressed);
                    }
                });                
            }
            catch (errTry) {
                reject(errTry);
            }
        });
    };

    static unzipSync(bufferGZ: Buffer): Buffer {
        var bufferDecompressed: Buffer = zlib.unzipSync(bufferGZ, { finishFlush: zlib.constants.Z_SYNC_FLUSH });
        return bufferDecompressed;
    };

    static converBufferTarFormatToMapPackageItemDataMap = function(buffer: Buffer): Map<string, IPackageStoreItemData>{
        var dataPackageItemDataMap: Map<string, IPackageStoreItemData> = new Map<string, IPackageStoreItemData>();
        var offset: number = 0;
        var size: number = buffer.length;
        
        do{
            var item = {} as IPackageStoreItemData;
            var nameBuffer = buffer.subarray(offset, offset + 100);
            item.name = nameBuffer.subarray(0, nameBuffer.indexOf(0)).toString();
            if (item.name){
                if (item.name.substring(0,8) === "package/"){
                    item.name = item.name.substring(8); //remove prefix package/
                }
                item.size = parseInt(buffer.subarray(offset + 124, offset + 136).toString(), 8);
                item.begin = offset + 512;
                //item.payload = buffer.subarray(offset + 512, offset + 512 + item.size);
                
                dataPackageItemDataMap.set(item.name, item);
            }

            if ((item.size % 512) === 0){
                offset = offset + (Math.trunc(item.size / 512) + 1) * 512;
            }
            else{
                offset = offset + (Math.trunc(item.size / 512) + 2) * 512;
            }
        } while (offset < size);
        
        return dataPackageItemDataMap;
    }
}