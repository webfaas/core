import { IManifest } from "../Manifest/IManifest";

//TODO: MANAGER LIST OF DEPENDENCY

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
    
    constructor(name: string, version: string){
        this.name = name;
        this.version = version;
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

    setObjectToCache(key: string, obj: Object){
        this.cacheObject.set(key, obj);
    }
    getObjectFromCache(key?: string): Object | null{
        if (key){
            return this.cacheObject.get(key || "") || null;
        }
        else{
            //access main module
            this.lastAccess = new Date().getTime();
            this.hitCount ++;
            return this.cacheObject.get("") || null;
        }
    }
}