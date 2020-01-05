import { Core } from "../../Core";
import { IPluginFactory, IPlugin } from "../../PluginManager/IPlugin";
import { PackageRegistryDiskTarball } from "../../PackageRegistry/Registries/DiskTarball/PackageRegistryDiskTarball";
import { PackageRegistryDiskTarballConfig } from "../../PackageRegistry/Registries/DiskTarball/PackageRegistryDiskTarballConfig";
import { PackageRegistryManagerItem } from "../../PackageRegistryManager/PackageRegistryManagerItem";
import { AbstractPackageRegistryPlugin } from "../../PluginManager/AbstractPackageRegistryPlugin";

export default class PackageRegistryDiskTarballPlugin extends AbstractPackageRegistryPlugin {
    static instanceBuilder(core:Core):IPlugin{
        return new PackageRegistryDiskTarballPlugin(core);
    }
    
    constructor(core: Core){
        let config = new PackageRegistryDiskTarballConfig();
        let registry = new PackageRegistryDiskTarball(config, core.getLog());
        super(core, registry, "DISK", "");
    }
}