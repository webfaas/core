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
    private key: string;
    private etag: string;
    private size: number = 0;
    private length: number = 0;
    private lastAccess: number = new Date().getTime();

    private mainFileFullPath: string = "";

    constructor(name: string, version: string, etag: string, packageBuffer: Buffer, dataPackageItemDataMap?: Map<string, IPackageStoreItemData>) {
        this.name = name;
        this.version = version;
        this.key = this.name + ":" + this.version;
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

        this.seekMainFile();
    }

    private updateMetricsAccess(){
        this.lastAccess = new Date().getTime();
    }

    private seekMainFile() {
        var manifest: IManifest | null
        var tmpMainFileFullPath: string = "";

        manifest = this.getManifest();

        if (manifest && manifest.main){
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

    getItemBuffer(key: string): Buffer | null{
        this.updateMetricsAccess();
        var item: IPackageStoreItemData | undefined = this.dataPackageItemDataMap.get(key);

        item = this.dataPackageItemDataMap.get(key);

        if (item === undefined){
            if (key.indexOf(".") === -1){
                item = this.dataPackageItemDataMap.get(key + ".js");

                if (item === undefined){
                    item = this.dataPackageItemDataMap.get(key + "/index.js");
                }
            }
        }

        if (item){
            var end = item.begin + item.size;
            return this.packageBuffer.subarray(item.begin, end);
        }
        else{
            return null;
        }
    }

    getMainBuffer(): Buffer | null{
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