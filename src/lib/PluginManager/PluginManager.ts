import * as fs from "fs";
import * as path from "path";
import { Core } from "../Core";
import { IPlugin, IPluginFactory } from "./IPlugin";
import { AbstractPackageRegistryPlugin } from "./AbstractPackageRegistryPlugin";

export class PluginManager {
    core: Core;
    listPlugin: Array<IPlugin> = new Array<IPlugin>();

    constructor(core: Core){
        this.core = core;
        this.loadInternalPlugins();
    }

    /**
     * start plugins
     */
    async start(): Promise<any>{
        for (let i = 0; i < this.listPlugin.length; i++){
            let plugin: IPlugin = this.listPlugin[i];
            await plugin.startPlugin(this.core);
        }
    }

    /**
     * stop plugins
     */
    async stop(): Promise<any>{
        for (let i = 0; i < this.listPlugin.length; i++){
            let plugin: IPlugin = this.listPlugin[i];
            await plugin.stopPlugin(this.core);
        }
    }

    /**
     * add plugin
     * @param plugin plugin
     */
    addPlugin(plugin: IPlugin): void{
        this.listPlugin.push(plugin);
    }

    /**
     * build instance
     * @param pluginClassOrFunction class or function
     */
    instanceBuild(pluginClassOrFunction: any): IPlugin{
        let newPlugin: IPlugin;
        if (pluginClassOrFunction.default && pluginClassOrFunction.default.instanceBuilder){
            newPlugin = pluginClassOrFunction.default.instanceBuilder(this.core);
        }
        else{
            newPlugin = pluginClassOrFunction(this.core);
        }
        return newPlugin;
    }

    /**d
     * load plugin from file
     * @param fullFileName full file name
     */
    private loadPluginFromFile(fullFileName: string){
        if (path.extname(fullFileName).toLowerCase() === ".js" ){
            let pluginClassOrFunction: any = require(fullFileName);
            let newPlugin = this.instanceBuild(pluginClassOrFunction);
            this.addPlugin(newPlugin);
        }
    }

    /**
     * load internal plugins
     */
    private loadInternalPlugins(){
        let scanFolderName = path.join(__dirname, "../Plugins");
        let files = fs.readdirSync(scanFolderName);
        for (let i = 0; i < files.length; i++){
            this.loadPluginFromFile(path.join(scanFolderName, files[i]));
        }
    }
}