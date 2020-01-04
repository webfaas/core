import * as fs from "fs";
import * as path from "path";
import { IPluginPackageRegistry } from "./IPluginPackageRegistryRegistry";
import { IPlugin, TypePluginEnum, IPluginFactory } from "./IPlugin";
import { Core } from "../Core";

export class PluginManager {
    core: Core;
    listPluginRegistry: Array<IPluginPackageRegistry> = new Array<IPluginPackageRegistry>();

    constructor(core: Core){
        this.core = core;
        this.loadInternalPlugins();
    }

    addPlugin(plugin: IPlugin): void{
        switch (plugin.typePlugin){
            case TypePluginEnum.PACKAGEREGISTRY:
                this.addPluginPackageRegistry(<IPluginPackageRegistry> plugin)
        }
    }

    addPluginPackageRegistry(plugin: IPluginPackageRegistry): void{
        this.listPluginRegistry.push(plugin);
        let packageRegistryManager = this.core.getModuleManager().getPackageStoreManager().getPackageRegistryManager();
        packageRegistryManager.addRegistry(plugin.name, plugin.registry, plugin.status);
    }

    async start(): Promise<any>{
        for (let i = 0; i < this.listPluginRegistry.length; i++){
            let plugin: IPlugin = this.listPluginRegistry[i];
            await plugin.startPlugin(this.core);
        }
    }

    async stop(): Promise<any>{
        for (let i = 0; i < this.listPluginRegistry.length; i++){
            let plugin: IPlugin = this.listPluginRegistry[i];
            await plugin.stopPlugin(this.core);
        }
    }

    private loadInternalPlugins(){
        let scanFolderName = path.join(__dirname, "../Plugins");
        let files = fs.readdirSync(scanFolderName);
        for (let i = 0; i < files.length; i++){
            if ( path.extname(files[i]).toLowerCase() === ".js" ){
                let fullFileName = path.join(scanFolderName, files[i]);
                let newPluginFactory: any = require(fullFileName);
                let newPlugin: IPlugin;
                if (newPluginFactory.__esModule){
                    newPlugin = newPluginFactory.default(this.core);
                }
                else{
                    newPlugin = newPluginFactory(this.core);
                }
                this.addPlugin(newPlugin);
            }
        }
    }
}