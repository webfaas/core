import * as path from "path";
import * as os from "os";
import * as fs from "fs";

/**
 * Config
 */
export class PackageRegistryManagerCacheDiskConfig  {
    base: string
    
    constructor(base?: string){
        if (base){
            this.base = base;
        }
        else{
            this.base = path.join(os.homedir(), ".webfass");
        }
    }
}