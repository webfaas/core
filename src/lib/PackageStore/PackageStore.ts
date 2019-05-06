import { IPackageStoreItemData } from "./IPackageStoreItemData";
import { IManifest } from "../Manifest/IManifest";

/**
 * PackageStore
 */
export class PackageStore {
    private dataPackageItemDataMap: Map<string, IPackageStoreItemData>;
    private name: string;
    private version: string;
    private etag: string;
    private size: number = 0;
    private length: number = 0;
    private lastAccess: number = new Date().getTime();
    private packageBuffer: Buffer;
    private manifest: IManifest | null = null;

    constructor(name: string, version: string, etag: string, packageBuffer: Buffer, dataPackageItemDataMap?: Map<string, IPackageStoreItemData>) {
        this.name = name;
        this.version = version;
        this.etag = etag;
        this.packageBuffer = packageBuffer;
        
        if (dataPackageItemDataMap){
            dataPackageItemDataMap.forEach((value, key) => {
                this.size += value.size;
                this.length ++;
            })
        }
        else{
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

    static buildItemData(name: string, begin: number, size: number): IPackageStoreItemData{
        var itemData = {} as IPackageStoreItemData;
        itemData.begin = begin;
        itemData.name = name;
        itemData.size = size;
        return itemData;
    }

    static buildPackageStoreSingleItemFromBuffer(name: string, version: string, etag: string, data: Buffer, nameItem: string): PackageStore{
        var storeData: PackageStore;
        var itemData = PackageStore.buildItemData(nameItem, 0, data.length);
        storeData = new PackageStore(name, version, etag, data)
        storeData.addItemData(nameItem, itemData);
        return storeData;
    }
}