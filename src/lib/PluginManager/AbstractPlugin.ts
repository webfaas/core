import { Core } from "../Core";
import { IPlugin } from "./IPlugin";
import { IPackageRegistry } from "../PackageRegistry/IPackageRegistry";
import { PackageRegistryManagerItem } from "../PackageRegistryManager/PackageRegistryManagerItem";

export abstract class AbstractPlugin implements IPlugin {
    abstract startPlugin(core: Core): Promise<any>
    abstract stopPlugin(core: Core): Promise<any>
    
    static instanceBuilder(core:Core):IPlugin{
        throw new Error("Override static method");
    }
}