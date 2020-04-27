import { PackageRegistryManager } from "./PackageRegistryManager/PackageRegistryManager";
import { PackageStoreManager } from "./PackageStoreManager/PackageStoreManager";
import { ModuleManager } from "./ModuleManager/ModuleManager";
import { Log } from "./Log/Log";
import { Config } from "./Config/Config";
import { ISemverData } from "./Semver/ISemverData";
import { SmallSemver } from "./Semver/SmallSemver";
import { MessageManager } from "./MessageManager/MessageManager";
import { ModuleManagerImport } from "./ModuleManager/ModuleManagerImport";
import { IMessage } from "./MessageManager/IMessage";

const smallSemver: SmallSemver = new SmallSemver();

/**
 * WEBFAAS CORE
 */
export class Core {
    private packageRegistryManager: PackageRegistryManager;
    private packageStoreManager : PackageStoreManager;
    private moduleManager: ModuleManager;
    private moduleManagerImport: ModuleManagerImport;
    private messageManager: MessageManager;
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
     * return message manager
     */
    getMessageManager(): MessageManager{
        return this.messageManager;
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
     * send message
     * @param msg message
     */
    sendMessage(msg: IMessage): Promise<IMessage | null>{
        return this.messageManager.sendMessage(msg);
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
        return this.moduleManagerImport.import(name, version, etag, registryName, imediateCleanMemoryCacheModuleFiles);
    }

    constructor(config?: Config, log?: Log, packageRegistryManager?: PackageRegistryManager, packageStoreManager? : PackageStoreManager, moduleManager?: ModuleManager) {
        //not change position
        let pjson: any = require("../package.json");
        this.version = pjson.version;
        this.versionObj = smallSemver.parseVersion(this.version);
        //****
        
        this.config = config || new Config();
        this.log = log || new Log();
    
        if (packageRegistryManager){
            this.packageRegistryManager = packageRegistryManager;
        }
        else{
            this.packageRegistryManager = new PackageRegistryManager(this.log);
            let defaultRegistryName: string = this.config.get("registry.default", "");
            this.packageRegistryManager.setDefaultRegistryName(defaultRegistryName);
        }

        if (packageStoreManager){
            this.packageStoreManager = packageStoreManager;
        }
        else{
            this.packageStoreManager = new PackageStoreManager(this.packageRegistryManager, this.log);
        }

        if (moduleManager){
            this.moduleManager = moduleManager;
        }
        else{
            this.moduleManager = new ModuleManager(this.packageStoreManager, this.log);
        }

        this.moduleManagerImport = this.moduleManager.getModuleManagerImport();
        this.messageManager = new MessageManager(this.moduleManager, this.log);
    }
}

//Util
export { PackageStoreUtil } from "./Util/PackageStoreUtil";
export { ModuleNameUtil } from "./Util/ModuleNameUtil";
export { MessageUtil } from "./Util/MessageUtil";

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
export { PluginManager } from "./PluginManager/PluginManager";

//ModuleManager
export { ModuleManager } from "./ModuleManager/ModuleManager";

//MessageManager
export { MessageManager } from "./MessageManager/MessageManager";
export { IMessage } from "./MessageManager/IMessage";
export { IMessageHeaders, IMessageHeadersAuthorization, IMessageHeadersHTTP, IMessageHeadersIdentity } from "./MessageManager/IMessageHeaders";
export { IMessageManagerFilter } from "./MessageManager/IMessageManagerFilter";

//WebFaasError
export { WebFaasError } from "./WebFaasError/WebFaasError";