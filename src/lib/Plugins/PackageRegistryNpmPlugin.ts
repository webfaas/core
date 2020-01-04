import { IPluginPackageRegistry } from "../PluginManager/IPluginPackageRegistryRegistry";
import { PackageRegistryManagerItemStatusEnum } from "../PackageRegistryManager/PackageRegistryManagerItem";
import { TypePluginEnum, IPluginFactory, IPlugin } from "../PluginManager/IPlugin";
import { IPackageRegistry } from "../PackageRegistry/IPackageRegistry";
import { PackageRegistryNPM } from "../PackageRegistry/Registries/NPM/PackageRegistryNPM";
import { PackageRegistryNPMConfig } from "../PackageRegistry/Registries/NPM/PackageRegistryNPMConfig";
import { Core } from "../Core";

class PackageRegistryNpmPlugin implements IPluginPackageRegistry{
    name = "NPM"
    typePlugin = TypePluginEnum.PACKAGEREGISTRY;
    status = PackageRegistryManagerItemStatusEnum.ENABLED;
    registry: IPackageRegistry;
    config: PackageRegistryNPMConfig;

    constructor(core: Core){
        this.config = new PackageRegistryNPMConfig();
        this.registry = new PackageRegistryNPM(this.config, core.getLog());
        core.getModuleManager().getPackageStoreManager().getPackageRegistryManager().setDefaultRegistryName(this.name);
    }
    
    async startPlugin(core: Core) {
        await this.registry.start();
    }

    async stopPlugin(core: Core) {
        await this.registry.stop();
    }
}

const factory: IPluginFactory = function (core:Core):IPlugin {
    return new PackageRegistryNpmPlugin(core);
}

export default factory;