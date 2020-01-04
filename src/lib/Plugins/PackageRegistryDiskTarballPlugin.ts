import { IPluginPackageRegistry } from "../PluginManager/IPluginPackageRegistryRegistry";
import { PackageRegistryManagerItemStatusEnum } from "../PackageRegistryManager/PackageRegistryManagerItem";
import { TypePluginEnum, IPluginFactory, IPlugin } from "../PluginManager/IPlugin";
import { IPackageRegistry } from "../PackageRegistry/IPackageRegistry";
import { PackageRegistryDiskTarball } from "../PackageRegistry/Registries/DiskTarball/PackageRegistryDiskTarball";
import { PackageRegistryDiskTarballConfig } from "../PackageRegistry/Registries/DiskTarball/PackageRegistryDiskTarballConfig";
import { Core } from "../Core";

class PackageRegistryDiskTarballPlugin implements IPluginPackageRegistry{
    name = "DISK"
    typePlugin = TypePluginEnum.PACKAGEREGISTRY;
    status = PackageRegistryManagerItemStatusEnum.ENABLED;
    registry: IPackageRegistry;
    config: PackageRegistryDiskTarballConfig;

    constructor(core: Core){
        this.config = new PackageRegistryDiskTarballConfig();
        this.registry = new PackageRegistryDiskTarball(this.config, core.getLog());
    }
    
    async startPlugin(core: Core) {
        await this.registry.start();
    }

    async stopPlugin(core: Core) {
        await this.registry.stop();
    }
}

const factory: IPluginFactory = function (core:Core):IPlugin {
    return new PackageRegistryDiskTarballPlugin(core);
}

export default factory;