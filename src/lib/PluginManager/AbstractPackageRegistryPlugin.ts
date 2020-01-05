import { Core } from "../Core";
import { IPlugin } from "./IPlugin";
import { IPackageRegistry } from "../PackageRegistry/IPackageRegistry";
import { PackageRegistryManagerItem } from "../PackageRegistryManager/PackageRegistryManagerItem";

export abstract class AbstractPackageRegistryPlugin implements IPlugin {
    registry: IPackageRegistry;
    data: PackageRegistryManagerItem;
    
    async startPlugin(core: Core) {
        await this.registry.start();
    }

    async stopPlugin(core: Core) {
        await this.registry.stop();
    }

    constructor(core: Core, registry: IPackageRegistry, name: string, slaveName: string){
        this.registry = registry;
        this.data = new PackageRegistryManagerItem(name, slaveName, registry);
        
        let packageRegistryManager = core.getModuleManager().getPackageStoreManager().getPackageRegistryManager();
        packageRegistryManager.addRegistry(this.data.name, this.data.slaveName, this.data.registry);
    }
}