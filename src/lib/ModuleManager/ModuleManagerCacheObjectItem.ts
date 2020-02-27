import { IManifest } from "../Manifest/IManifest";
import { IPackageStoreCacheSync } from "../PackageStoreCache/IPackageStoreCacheSync";

/**
 * manager Module Require Context Data
 */
export class ModuleManagerCacheObjectItem {
    private name: string;
    private version: string;
    
    private createAccess: number = new Date().getTime();
    private lastAccess: number = new Date().getTime();

    private cacheObject: Map<string, Object> = new Map<string, Object>();

    private hitCount: number = 0;

    private packageStoreCache: IPackageStoreCacheSync | null = null;

    private manifest: IManifest | null = null;
    
    constructor(name: string, version: string){
        this.name = name;
        this.version = version;
    }

    private updateAccessMetrics(){
        this.lastAccess = new Date().getTime();
        this.hitCount ++;
    }

    getName(): string{
        return this.name;
    }
    getVersion(): string{
        return this.version;
    }
    getCreateAccess(): number{
        return this.createAccess;
    }
    getLastAccess(): number{
        return this.lastAccess;
    }
    getHitCount(): number{
        return this.hitCount;
    }

    setObjectToCache(key: string, obj: Object): void{
        this.cacheObject.set(key, obj);
    }
    removeObjectFromCache(key: string): void{
        this.cacheObject.delete(key);
    }
    getObjectFromCache(key?: string): Object | null{
        this.updateAccessMetrics();
        if (key){
            return this.cacheObject.get(key) || null;
        }
        else{
            //access main module
            return this.cacheObject.get("") || null;
        }
    }

    getPackageStoreCache(): IPackageStoreCacheSync | null{
        this.updateAccessMetrics();
        return this.packageStoreCache;
    }
    setPackageStoreCache(packageStoreCache: IPackageStoreCacheSync | null): void{
        this.packageStoreCache = packageStoreCache;
    }

    getManifest(): IManifest | null{
        return this.manifest;
    }
    setManifest(manifest:IManifest | null): void{
        this.manifest = manifest;
    }
}