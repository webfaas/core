import * as path from "path";
import * as os from "os";

/**
 * Config
 */
export class PackageRegistryDiskTarballConfig  {
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