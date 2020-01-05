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

    addPlugin(plugin: IPlugin): void{
        this.listPlugin.push(plugin);
    }

    async start(): Promise<any>{
        for (let i = 0; i < this.listPlugin.length; i++){
            let plugin: IPlugin = this.listPlugin[i];
            await plugin.startPlugin(this.core);
        }
    }

    async stop(): Promise<any>{
        for (let i = 0; i < this.listPlugin.length; i++){
            let plugin: IPlugin = this.listPlugin[i];
            await plugin.stopPlugin(this.core);
        }
    }

    loadPluginFromFactoryPlugin(newPluginFactory: any){
        let newPlugin: IPlugin;
        if (newPluginFactory.__esModule){
            newPlugin = newPluginFactory.default(this.core);
        }
        else{
            newPlugin = newPluginFactory(this.core);
        }
        this.addPlugin(newPlugin);
    }

    private loadPluginFromFile(fullFileName: string){
        if (path.extname(fullFileName).toLowerCase() === ".js" ){
            let newPluginFactory: any = require(fullFileName);
            this.loadPluginFromFactoryPlugin(newPluginFactory);
        }
    }

    private loadInternalPlugins(){
        let scanFolderName = path.join(__dirname, "../Plugins");
        let files = fs.readdirSync(scanFolderName);
        for (let i = 0; i < files.length; i++){
            this.loadPluginFromFile(path.join(scanFolderName, files[i]));
        }
    }
}