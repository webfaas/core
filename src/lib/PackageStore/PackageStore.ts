import { IPackageStoreItemData } from "./IPackageStoreItemData";
import { IManifest } from "../Manifest/IManifest";
import { PackageStoreItemBufferResponse } from "./PackageStoreItemBufferResponse";

/**
 * PackageStore
 */
export class PackageStore {
    private packageBuffer: Buffer;
    private dataPackageItemDataMap: Map<string, IPackageStoreItemData>;
    private manifest: IManifest | null = null;

    private name: string;
    private version: string;
    private key: string;
    private etag: string;
    private size: number = 0;
    private length: number = 0;
    private lastAccess: number = new Date().getTime();

    private mainFileFullPath: string = "";

    constructor(name: string, version: string, etag: string, packageBuffer?: Buffer, dataPackageItemDataMap?: Map<string, IPackageStoreItemData>) {
        this.name = name;
        this.version = version;
        this.key = PackageStore.parseKey(this.name, this.version);
        this.etag = etag;
        this.packageBuffer = packageBuffer || Buffer.alloc(0);
        this.size = this.packageBuffer.length;
        
        if (dataPackageItemDataMap){
            this.length = dataPackageItemDataMap.size;
        }
        else{
            this.length = 0;
            dataPackageItemDataMap = new Map<string, IPackageStoreItemData>();
        }

        this.dataPackageItemDataMap = dataPackageItemDataMap;

        this.seekMainFile();
    }

    public static parseKey(name: string, version: string): string{
        return name + ":" + version;
    }

    private updateMetricsAccess(){
        this.lastAccess = new Date().getTime();
    }

    private seekMainFile() {
        var manifest: IManifest | null
        var tmpMainFileFullPath: string = "";

        manifest = this.getManifest();

        if (manifest && manifest.main){
            if (manifest.main.substring(0,2) === "./"){
                manifest.main = manifest.main.substring(2);
            }

            if (this.dataPackageItemDataMap.has(manifest.main)){
                tmpMainFileFullPath = manifest.main;
            }
            else{
                if (manifest.main.indexOf(".") === -1){
                    if (this.dataPackageItemDataMap.has(manifest.main + "/index.js")){
                        tmpMainFileFullPath = manifest.main + "/index.js";
                    }
                }
            }
        }
        else{
            if (this.dataPackageItemDataMap.has("index.js")){
                tmpMainFileFullPath = "index.js";
            }
        }

        if (tmpMainFileFullPath){
            this.mainFileFullPath = tmpMainFileFullPath;
        }
        else{
            this.mainFileFullPath = "";
        }
    }

    getName(): string{
        return this.name;
    }

    getVersion(): string{
        return this.version;
    }

    getKey(): string{
        return this.key;
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

    getMainFileFullPath(): string {
        return this.mainFileFullPath;
    }

    getItemBuffer(key: string): PackageStoreItemBufferResponse | null{
        this.updateMetricsAccess();
        var item: IPackageStoreItemData | undefined = this.dataPackageItemDataMap.get(key);
        var extension = key.substring(key.lastIndexOf("."));

        if (item === undefined){
            if (key.indexOf(".") === -1){
                extension = ".js";
                item = this.dataPackageItemDataMap.get(key + ".js");

                if (item === undefined){
                    extension = ".js";
                    item = this.dataPackageItemDataMap.get(key + "/index.js");
                }

                if (item === undefined){
                    extension = ".json";
                    item = this.dataPackageItemDataMap.get(key + ".json");
                }
            }
        }

        if (item){
            var end = item.begin + item.size;
            return new PackageStoreItemBufferResponse(key, extension, this.packageBuffer.subarray(item.begin, end));
        }
        else{
            return null;
        }
    }

    getMainBuffer(): PackageStoreItemBufferResponse | null{
        if (this.mainFileFullPath){
            return this.getItemBuffer(this.mainFileFullPath);
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
                this.manifest = JSON.parse(manifestBuffer.buffer.toString());
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
        this.size += itemData.size;
        this.length ++;
        
        this.seekMainFile();
    }

    addItemBuffer(nameItem: string, itemBuffer: Buffer): IPackageStoreItemData{
        var itemData = {} as IPackageStoreItemData;
        itemData.begin = this.packageBuffer.length;
        itemData.name = nameItem;
        itemData.size = itemBuffer.length;

        this.packageBuffer = Buffer.concat([this.packageBuffer, itemBuffer]);

        this.addItemData(nameItem, itemData);

        return itemData;
    }

    removeItemData(nameItem: string){
        var itemData = this.dataPackageItemDataMap.get(nameItem);
        if (itemData){
            this.dataPackageItemDataMap.delete(nameItem);
            this.size -= itemData.size;
            this.length --;
        }
    }
}