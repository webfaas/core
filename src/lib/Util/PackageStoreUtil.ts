import * as zlib from "zlib";
import { IPackageStoreItemData } from "../PackageStore/IPackageStoreItemData";
import { PackageStore } from "../PackageStore/PackageStore";

export class PackageStoreUtil  {
    public static unzipSync(bufferGZ: Buffer): Buffer {
        var bufferDecompressed: Buffer = zlib.unzipSync(bufferGZ, { finishFlush: zlib.constants.Z_SYNC_FLUSH });
        return bufferDecompressed;
    };

    public static zipSync(buffer: Buffer): Buffer {
        var bufferCompressed: Buffer = zlib.gzipSync(buffer, { finishFlush: zlib.constants.Z_SYNC_FLUSH });
        return bufferCompressed;
    };

    public static buildItemData(name: string, begin: number, size: number): IPackageStoreItemData{
        var itemData = {} as IPackageStoreItemData;
        itemData.begin = begin;
        itemData.name = name;
        itemData.size = size;
        return itemData;
    }

    public static buildPackageStoreFromListBuffer = function(name: string, version: string, etag: string, listBufferFile: Array<Buffer>, listName: Array<string>): PackageStore{
        var dataPackageItemDataMap: Map<string, IPackageStoreItemData> = new Map<string, IPackageStoreItemData>();
        var offset: number = 0;
        var packageBuffer: Buffer;

        for (var i = 0; i < listBufferFile.length; i++){
            let itemBuffer = listBufferFile[i];
            let itemName = listName[i] || "";
            let item = {} as IPackageStoreItemData;
            item.begin = offset;
            item.size = itemBuffer.length;
            item.name = itemName;
            dataPackageItemDataMap.set(item.name, item);
            offset += item.size;
        }

        packageBuffer = Buffer.concat(listBufferFile);

        var packageStore = new PackageStore(name, version, etag, packageBuffer, dataPackageItemDataMap);
        
        return packageStore;
    }

    public static buildPackageStoreFromTarGzBuffer = function(name: string, version: string, etag: string, tarGzBuffer: Buffer): PackageStore{
        var tarBuffer: Buffer = PackageStoreUtil.unzipSync(tarGzBuffer);

        return PackageStoreUtil.buildPackageStoreFromTarBuffer(name, version, etag, tarBuffer);
    }

    public static buildPackageStoreFromTarBuffer = function(name: string, version: string, etag: string, tarBuffer: Buffer): PackageStore{
        var dataPackageItemDataMap: Map<string, IPackageStoreItemData> = PackageStoreUtil.extractItemDataMapFromTarBuffer(tarBuffer);

        var packageStore = new PackageStore(name, version, etag, tarBuffer, dataPackageItemDataMap);
        
        return packageStore;
    }
    
    public static extractItemDataMapFromTarBuffer = function(bufferTar: Buffer): Map<string, IPackageStoreItemData>{
        var dataPackageItemDataMap: Map<string, IPackageStoreItemData> = new Map<string, IPackageStoreItemData>();
        var offset: number = 0;
        var size: number = bufferTar.length;
        
        //https://www.gnu.org/software/tar/manual/html_node/Standard.html
        //0	100	File name
        //100	8	File mode
        //108	8	Owner's numeric user ID
        //116	8	Group's numeric user ID
        //124	12	File size in bytes (octal base)

        /*
        if (bufferTar.subarray(0, 17).toString() === "pax_global_header"){
            offset = 512 * 3; //ignore pax header - https://marc.info/?l=linux-kernel&m=111909182607985&w=2
        }
        */

        do{
            var item = {} as IPackageStoreItemData;
            var nameBuffer = bufferTar.subarray(offset, offset + 100);
            item.name = nameBuffer.subarray(0, nameBuffer.indexOf(0)).toString();
            item.name = item.name.substring(item.name.indexOf("/") + 1); //remove prefix. ex: package/
            item.size = parseInt(bufferTar.subarray(offset + 124, offset + 136).toString(), 8);
            
            if (item.size){
                item.begin = offset + 512; //header -> block 512 Bytes
                dataPackageItemDataMap.set(item.name, item);
                offset = offset + 512 + item.size + (512 - (item.size % 512)); //512Bytes(header block) + XBytes(data item block - multiple of 512 Bytes)
            }
            else{
                offset = offset + 512; //size(0) => header only
            }

        } while (offset < size);
        
        return dataPackageItemDataMap;
    }

    public static convertPackageStoreToTarBuffer = function(packageStore: PackageStore): Buffer{
        var bufferTar: Buffer
        var offset: number = 0;
        var packageBuffer: Buffer = packageStore.getPackageBuffer();
        var dataPackageItemDataMap = packageStore.getDataPackageItemDataMap();
        var listDataBuffer: Array<Buffer> = new Array<Buffer>();

        dataPackageItemDataMap.forEach(function(itemData: IPackageStoreItemData){
            let dataBuffer: Buffer;
            let dataBufferPad: Buffer;
            let dataBufferSize: number;
            
            dataBufferPad = Buffer.alloc(512 - (itemData.size % 512));

            dataBuffer = Buffer.concat([packageBuffer.subarray(itemData.begin, itemData.begin + itemData.size), dataBufferPad]);

            let dataHeader: Buffer = Buffer.alloc(512, 0);
            dataHeader.write("package/" + itemData.name, 0, 100);
            dataHeader.write((itemData.size).toString(8).padStart(12,"0"), 124, 12);

            listDataBuffer.push(dataHeader);
            listDataBuffer.push(dataBuffer);

            offset += dataBuffer.length + dataHeader.length;
        })
        
        bufferTar = Buffer.concat(listDataBuffer);

        return bufferTar;
    }

    public static convertPackageStoreToTarGzBuffer = function(packageStore: PackageStore): Buffer{
        let bufferTar: Buffer = PackageStoreUtil.convertPackageStoreToTarBuffer(packageStore);
        return PackageStoreUtil.zipSync(bufferTar);
    }
}