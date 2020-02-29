import { PackageRegistryManager } from "./PackageRegistryManager/PackageRegistryManager";
import { PackageStoreManager } from "./PackageStoreManager/PackageStoreManager";
import { ModuleManager } from "./ModuleManager/ModuleManager";
import { PluginManager } from "./PluginManager/PluginManager";
import { Log } from "./Log/Log";
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
    private version: string;

    /**
     * return registry manager
     */
    getPackageRegistryManager(): PackageRegistryManager{
        return this.packageRegistryManager;
    }
    
    /**
     * return store manager
     */
    getPackageStoreManager() : PackageStoreManager{
        return this.packageStoreManager;
    }

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
    getLog(): Log{
        return this.log;
    }

    /**
     * return version
     */
    getVersion(): string{
        return this.version;
    }

    /**
     * return config;
     */
    getConfig(): Config{
        return this.config;
    }

    async start(){
        await this.pluginManager.start();
    }

    async stop(){
        await this.pluginManager.stop();
    }

    invokeAsync(name: string, version: string, method?: string, parameter?: any[]): Promise<any>{
        return this.moduleManager.invokeAsync(name, version, method, parameter);
    }

    import(name: string, version: string, etag?: string, registryName?: string, imediateCleanMemoryCacheModuleFiles = true): Promise<Object | null>{
        return this.moduleManager.getModuleManagerImport().import(name, version, etag, registryName, imediateCleanMemoryCacheModuleFiles);
    }

    constructor(config?: Config, log?: Log) {
        //not change position
        let pjson: any = require("../package.json");
        this.version = pjson.version;
        //****
        
        this.config = config || new Config();
        this.log = log || new Log();
        
        this.packageRegistryManager = new PackageRegistryManager(this.log);
        let defaultRegistryName: string = this.config.get("registry.default", "");
        this.packageRegistryManager.setDefaultRegistryName(defaultRegistryName);

        this.packageStoreManager = new PackageStoreManager(this.packageRegistryManager, this.log);

        this.moduleManager = new ModuleManager(this.packageStoreManager, this.log);

        this.pluginManager = new PluginManager(this);
        this.pluginManager.loadPlugins();
    }
}

//Util
export { PackageStoreUtil } from "./Util/PackageStoreUtil";
export { ModuleNameUtil } from "./Util/ModuleNameUtil";

//ClientHTTP
export { ClientHTTP } from "./ClientHTTP/ClientHTTP";
export { ClientHTTPConfig } from "./ClientHTTP/ClientHTTPConfig";
export { IClientHTTPResponse } from "./ClientHTTP/IClientHTTPResponse";
export { ClientHTTPUtil } from "./Util/ClientHTTPUtil";

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