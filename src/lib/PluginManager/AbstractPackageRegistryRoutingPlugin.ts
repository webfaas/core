import { Core } from "../Core";
import { IPlugin } from "./IPlugin";
import { IPackageRegistry } from "../PackageRegistry/IPackageRegistry";
import { PackageRegistryManagerItem } from "../PackageRegistryManager/PackageRegistryManagerItem";

export abstract class AbstractPackageRegistryRoutingPlugin implements IPlugin {
    async startPlugin(core: Core) {
    }

    async stopPlugin(core: Core) {
    }

    abstract getRegistryNameByExternalRouting(moduleName: string): string

    constructor(core: Core){
        let self = this;
        let packageRegistryManager = core.getModuleManager().getPackageStoreManager().getPackageRegistryManager();
        packageRegistryManager.getRegistryNameByExternalRouting = function(moduleName: string): string {
            return self.getRegistryNameByExternalRouting(moduleName);
        }
    }
}