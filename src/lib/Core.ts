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
        this.packageStoreManager = new PackageStoreManager(this.packageRegistryManager, this.log);
        this.moduleManager = new ModuleManager(this.packageStoreManager, this.log);
        this.pluginManager = new PluginManager(this);
    }
}

//Util
export { PackageStoreUtil } from "./Util/PackageStoreUtil";
export { ModuleNameUtil } from "./Util/ModuleNameUtil";

//ClientHTTP
export { ClientHTTP } from "./ClientHTTP/ClientHTTP";
export { ClientHTTPConfig } from "./ClientHTTP/ClientHTTPConfig";
export { IClientHTTPResponse } from "./ClientHTTP/IClientHTTPResponse";

//Log
export { Log } from "./Log/Log";
export { LogLevelEnum } from "./Log/ILog";

//PackageRegistry
export { IPackageRegistry } from "./PackageRegistry/IPackageRegistry";
export { IPackageRegistryResponse } from "./PackageRegistry/IPackageRegistryResponse";

//Manifest
export { IManifest } from "./Manifest/IManifest";

//PackageStore
export { PackageStore } from "./PackageStore/PackageStore";
export { IPackageStoreItemData } from "./PackageStore/IPackageStoreItemData";

//Plugin
export { IPlugin } from "./PluginManager/IPlugin";

//ModuleManager
export { ModuleManager } from "./ModuleManager/ModuleManager";

//WebFaasError
export { WebFaasError } from "./WebFaasError/WebFaasError";