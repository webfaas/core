import { Core } from "../Core";
import { IPluginFactory, IPlugin } from "../PluginManager/IPlugin";
import { PackageRegistryDiskTarball } from "../PackageRegistry/Registries/DiskTarball/PackageRegistryDiskTarball";
import { PackageRegistryDiskTarballConfig } from "../PackageRegistry/Registries/DiskTarball/PackageRegistryDiskTarballConfig";
import { PackageRegistryManagerItem } from "../PackageRegistryManager/PackageRegistryManagerItem";
import { AbstractPackageRegistryPlugin } from "../PluginManager/AbstractPackageRegistryPlugin";

class PackageRegistryDiskTarballPlugin extends AbstractPackageRegistryPlugin {
    constructor(core: Core){
        let config = new PackageRegistryDiskTarballConfig();
        let registry = new PackageRegistryDiskTarball(config, core.getLog());
        super(core, registry, "DISK", "");
    }
}

const factory: IPluginFactory = function (core:Core):IPlugin {
    return new PackageRegistryDiskTarballPlugin(core);
}

export default factory;