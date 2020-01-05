import { Core } from "../Core";
import { IPluginFactory, IPlugin } from "../PluginManager/IPlugin";
import { PackageRegistryGitHubTarballV3 } from "../PackageRegistry/Registries/GitHubTarballV3/PackageRegistryGitHubTarballV3";
import { PackageRegistryGitHubTarballV3Config } from "../PackageRegistry/Registries/GitHubTarballV3/PackageRegistryGitHubTarballV3Config";
import { PackageRegistryManagerItem } from "../PackageRegistryManager/PackageRegistryManagerItem";
import { AbstractPackageRegistryPlugin } from "../PluginManager/AbstractPackageRegistryPlugin";

class PackageRegistryGitHubTarballV3Plugin extends AbstractPackageRegistryPlugin {
    constructor(core: Core){
        let config = new PackageRegistryGitHubTarballV3Config();
        let registry = new PackageRegistryGitHubTarballV3(config, core.getLog());
        super(core, registry, "GITHUB", "");
    }
}

const factory: IPluginFactory = function (core:Core):IPlugin {
    return new PackageRegistryGitHubTarballV3Plugin(core);
}

export default factory;