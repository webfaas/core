import { IPackageStoreItemData } from "./IPackageStoreItemData";
import { IManifest } from "../Manifest/IManifest";

/**
 * PackageStore
 */
export class PackageStore {
    private packageBuffer: Buffer;
    private dataPackageItemDataMap: Map<string, IPackageStoreItemData>;
    private manifest: IManifest | null = null;

    private name: string;
    private version: string;
    private etag: string;
    private size: number = 0;
    private length: number = 0;
    private lastAccess: number = new Date().getTime();

    constructor(name: string, version: string, etag: string, packageBuffer: Buffer, dataPackageItemDataMap?: Map<string, IPackageStoreItemData>) {
        this.name = name;
        this.version = version;
        this.etag = etag;
        this.packageBuffer = packageBuffer;
        this.size = packageBuffer.length;
        
        if (dataPackageItemDataMap){
            this.length = dataPackageItemDataMap.size;
        }
        else{
            this.length = 0;
            dataPackageItemDataMap = new Map<string, IPackageStoreItemData>();
        }

        this.dataPackageItemDataMap = dataPackageItemDataMap;
    }

    private updateMetricsAccess(){
        this.lastAccess = new Date().getTime();
    }

    getName(): string{
        return this.name;
    }

    getVersion(): string{
        return this.version;
    }

    getEtag(): string{
        return this.etag;
    }

    getSize(){
        return this.size;
    }

    getLength(){
        return this.length;
    }

    getLastAccess(){
        return this.lastAccess;
    }

    getItemBuffer(key: string): Buffer | null{
        this.updateMetricsAccess();
        var item = this.dataPackageItemDataMap.get(key);
        if (item){
            var end = item.begin + item.size;
            return this.packageBuffer.subarray(item.begin, end);
        }
        else{
            return null;
        }
    }

    getManifest(): IManifest | null{
        this.updateMetricsAccess();
        
        if (this.manifest){
            return this.manifest;
        }
        else{
            var manifestBuffer = this.getItemBuffer("package.json");
            if (manifestBuffer){
                this.manifest = JSON.parse(manifestBuffer.toString());
                return this.manifest;
            }
            else{
                return null;
            }
        }
    }

    getPackageBuffer(): Buffer{
        return this.packageBuffer;
    }

    getDataPackageItemDataMap(): Map<string, IPackageStoreItemData>{
        return this.dataPackageItemDataMap;
    }

    addItemData(nameItem: string, itemData: IPackageStoreItemData){
        this.removeItemData(nameItem);
        this.dataPackageItemDataMap.set(nameItem, itemData);
        if (itemData.size){
            this.size += itemData.size;
        }
        this.length ++;
    }

    removeItemData(nameItem: string){
        var itemData = this.dataPackageItemDataMap.get(nameItem);
        if (itemData){
            this.dataPackageItemDataMap.delete(nameItem);
            if (itemData.size){
                this.size -= itemData.size;
            }
            this.length --;
        }
    }
}