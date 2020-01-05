import { Core } from "../Core";
import { IPlugin, IPluginFactory } from "../PluginManager/IPlugin";
import { AbstractPackageRegistryRoutingPlugin } from "../PluginManager/AbstractPackageRegistryRoutingPlugin";

export class DefaultPackageRegistryRoutingPlugin extends AbstractPackageRegistryRoutingPlugin {
    private listRegistryNameByScope: Map<string, string> = new Map<string, string>();
    
    /**
     * return registry name by scope name
     * @param scopeName scope name
     */
    getRegistryNameByScopeName(scopeName: string): string{
        return this.listRegistryNameByScope.get(scopeName) || "";
    }

    /**
     * add route by scope name
     * @param scopeName scope name
     * @param registryName registry name
     */
    addRegistryNameByScopeName(scopeName: string, registryName: string): void{
        this.listRegistryNameByScope.set(scopeName, registryName);
    }

    /**
     * remove route by scope name
     * @param scopeName scope name
     */
    removeRegistryNameByScopeName(scopeName: string): void{
        this.listRegistryNameByScope.delete(scopeName);
    }

    /**
     * return scope name by module name
     * @param name module name
     */
    getScopeNameByModuleName(name: string): string{
        if (name.substring(0,1) === "@"){
            return name.substring(1, name.indexOf("/"));
        }
        else{
            return "default";
        }
    }

    getRegistryNameByExternalRouting(moduleName: string): string{
        let scopeName: string = this.getScopeNameByModuleName(moduleName);
        return this.getRegistryNameByScopeName(scopeName);
    }

    constructor(core:Core){
        super(core);
    }
}

const factory: IPluginFactory = function (core:Core):IPlugin {
    return new DefaultPackageRegistryRoutingPlugin(core);
}

export default factory;