import { IPluginPackageRegistry } from "../PluginManager/IPluginPackageRegistryRegistry";
import { PackageRegistryManagerItemStatusEnum } from "../PackageRegistryManager/PackageRegistryManagerItem";
import { TypePluginEnum, IPluginFactory, IPlugin } from "../PluginManager/IPlugin";
import { IPackageRegistry } from "../PackageRegistry/IPackageRegistry";
import { PackageRegistryGitHubTarballV3 } from "../PackageRegistry/Registries/GitHubTarballV3/PackageRegistryGitHubTarballV3";
import { PackageRegistryGitHubTarballV3Config } from "../PackageRegistry/Registries/GitHubTarballV3/PackageRegistryGitHubTarballV3Config";
import { Core } from "../Core";

class PackageRegistryGitHubTarballV3Plugin implements IPluginPackageRegistry{
    name = "GITHUB"
    typePlugin = TypePluginEnum.PACKAGEREGISTRY;
    status = PackageRegistryManagerItemStatusEnum.ENABLED;
    registry: IPackageRegistry;
    config: PackageRegistryGitHubTarballV3Config;

    constructor(core: Core){
        this.config = new PackageRegistryGitHubTarballV3Config();
        this.registry = new PackageRegistryGitHubTarballV3(this.config, core.getLog());
    }
    
    async startPlugin(core: Core) {
        await this.registry.start();
    }

    async stopPlugin(core: Core) {
        await this.registry.stop();
    }
}

const factory: IPluginFactory = function (core:Core):IPlugin {
    return new PackageRegistryGitHubTarballV3Plugin(core);
}

export default factory;