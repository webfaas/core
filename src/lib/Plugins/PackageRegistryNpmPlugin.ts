import { Core } from "../Core";
import { IPluginFactory, IPlugin } from "../PluginManager/IPlugin";
import { PackageRegistryNPM } from "../PackageRegistry/Registries/NPM/PackageRegistryNPM";
import { PackageRegistryNPMConfig } from "../PackageRegistry/Registries/NPM/PackageRegistryNPMConfig";
import { PackageRegistryManagerItem } from "../PackageRegistryManager/PackageRegistryManagerItem";
import { AbstractPackageRegistryPlugin } from "../PluginManager/AbstractPackageRegistryPlugin";

class PackageRegistryNpmPlugin extends AbstractPackageRegistryPlugin {
    constructor(core: Core){
        let config = new PackageRegistryNPMConfig();
        let registry = new PackageRegistryNPM(config, core.getLog());
        super(core, registry, "NPM", "");

        core.getModuleManager().getPackageStoreManager().getPackageRegistryManager().setDefaultRegistryName("NPM");
    }
}

const factory: IPluginFactory = function (core:Core):IPlugin {
    return new PackageRegistryNpmPlugin(core);
}

export default factory;