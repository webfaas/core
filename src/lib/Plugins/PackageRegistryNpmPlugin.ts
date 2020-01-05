import { Core } from "../Core";
import { IPluginFactory, IPlugin } from "../PluginManager/IPlugin";
import { PackageRegistryNPM } from "../PackageRegistry/Registries/NPM/PackageRegistryNPM";
import { PackageRegistryNPMConfig } from "../PackageRegistry/Registries/NPM/PackageRegistryNPMConfig";
import { PackageRegistryManagerItem } from "../PackageRegistryManager/PackageRegistryManagerItem";
import { AbstractPackageRegistryPlugin } from "../PluginManager/AbstractPackageRegistryPlugin";

export default class PackageRegistryNpmPlugin extends AbstractPackageRegistryPlugin {
    static instanceBuilder(core:Core):IPlugin{
        return new PackageRegistryNpmPlugin(core);
    }
    
    constructor(core: Core){
        let config = new PackageRegistryNPMConfig();
        let registry = new PackageRegistryNPM(config, core.getLog());
        super(core, registry, "NPM", "");

        core.getModuleManager().getPackageStoreManager().getPackageRegistryManager().setDefaultRegistryName("NPM");
    }
}