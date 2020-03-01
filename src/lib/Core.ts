import { PackageRegistryManager } from "./PackageRegistryManager/PackageRegistryManager";
import { PackageStoreManager } from "./PackageStoreManager/PackageStoreManager";
import { ModuleManager } from "./ModuleManager/ModuleManager";
import { PluginManager } from "./PluginManager/PluginManager";
import { Log } from "./Log/Log";
import { Config } from "./Config/Config";
import { ISemverData } from "./Semver/ISemverData";
import { SmallSemver } from "./Semver/SmallSemver";
import { IRequestContext } from "./ModuleManager/IRequestContext";

const smallSemver: SmallSemver = new SmallSemver();

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
    private versionObj: ISemverData

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
     * return version object
     */
    getVersionObj(): ISemverData{
        return this.versionObj
    }

    /**
     * return config;
     */
    getConfig(): Config{
        return this.config;
    }

    /**
     * start plugins
     */
    async start(){
        await this.pluginManager.start();
    }

    /**
     * stop plugins
     */
    async stop(){
        await this.pluginManager.stop();
    }

    /**
     * send message
     * @param name module name
     * @param version module version
     * @param method method
     * @param requestContext request context
     * @param data data
     * @param registryName registry
     */
    sendMessage(name: string, version: string, method: string, requestContext:IRequestContext, data: any, registryName?: string): Promise<any>{
        return this.moduleManager.sendMessage(name, version, method, requestContext, data, registryName);
    }

    /**
     * invoke async
     * @param name module name
     * @param version module version
     * @param method method name
     * @param parameter parameter
     * @param registryName registry
     * @param imediateCleanMemoryCacheModuleFiles clean cache
     */
    invokeAsync(name: string, version: string, method?: string, parameter?: any[], registryName?: string, imediateCleanMemoryCacheModuleFiles = true): Promise<any>{
        return this.moduleManager.invokeAsync(name, version, method, parameter, registryName, imediateCleanMemoryCacheModuleFiles);
    }

    /**
     * import module
     * @param name module name
     * @param version module version
     * @param etag etag
     * @param registryName registry
     * @param imediateCleanMemoryCacheModuleFiles clean cache
     */
    import(name: string, version: string, etag?: string, registryName?: string, imediateCleanMemoryCacheModuleFiles = true): Promise<Object | null>{
        return this.moduleManager.getModuleManagerImport().import(name, version, etag, registryName, imediateCleanMemoryCacheModuleFiles);
    }

    constructor(config?: Config, log?: Log) {
        //not change position
        let pjson: any = require("../package.json");
        this.version = pjson.version;
        this.versionObj = smallSemver.parseVersion(this.version);
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