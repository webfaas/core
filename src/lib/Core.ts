import { PackageRegistryManager } from "./PackageRegistryManager/PackageRegistryManager";
import { PackageStoreManager } from "./PackageStoreManager/PackageStoreManager";
import { ModuleManager } from "./ModuleManager/ModuleManager";
import { PluginManager } from "./PluginManager/PluginManager";
import { Log } from "./Log/Log";
import { InvokeData } from "./ModuleManager/InvokeData";
import { Config } from "./Config/Config";

/**
 * WEBFAAS CORE
 */
export class Core {
    private packageRegistryManager: PackageRegistryManager;
    private packageStoreManager : PackageStoreManager;
    private moduleManager: ModuleManager;
    private pluginManager: PluginManager;
    private log: Log;
    private config: Config;

    /**
     * return module manager
     */
    getModuleManager(): ModuleManager{
        return this.moduleManager;
    }

    /**
     * return plugin manager
     */
    getPluginManager(): PluginManager{
        return this.pluginManager;
    }

    /**
     * return log
     */
    getLog(){
        return this.log;
    }

    async start(){
        await this.pluginManager.start();
    }

    async stop(){
        await this.pluginManager.stop();
    }

    async invokeAsync(name: string, version: string, method?: string, parameter?: any[]){
        return await this.moduleManager.invokeAsync(name, version, method, parameter);
    }

    constructor() {
        this.config = new Config();
        this.log = Log.getInstance();
        
        this.packageRegistryManager = new PackageRegistryManager(this.log);
        //let diskPackageStore = new PackageStoreCacheDisk();
        //this.packageStoreManager = new PackageStoreManager(packageRegistryManager, diskPackageStore, this.log);
        this.packageStoreManager = new PackageStoreManager(this.packageRegistryManager, undefined, this.log);
        this.moduleManager = new ModuleManager(this.packageStoreManager, this.log);
        this.pluginManager = new PluginManager(this);
    }
}