import * as fs from "fs";
import * as path from "path";
import { Core } from "../Core";
import { IPlugin } from "./IPlugin";

export class PluginManager {
    core: Core;
    listPlugin: Array<IPlugin> = new Array<IPlugin>();
    rootDir: string = "";

    constructor(core: Core, rootDir?: string){
        this.core = core;

        if (rootDir){
            this.rootDir = rootDir;
        }
        else{
            if (process.mainModule){
                this.rootDir = path.dirname(process.mainModule.filename);
            }
            else{
                this.rootDir = path.resolve(__dirname, "../../../");
            }
        }

        this.loadPlugins();
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
     * build instance plugin
     * @param pluginClassOrFunction class or function
     */
    instancePluginBuild(pluginFunctionFactory: any): IPlugin{
        let newPlugin: IPlugin;
        if (pluginFunctionFactory.default){
            newPlugin = pluginFunctionFactory.default(this.core);
        }
        else{
            newPlugin = pluginFunctionFactory(this.core);
        }
        return newPlugin;
    }

    /**
     * load plugins
     */
    loadPlugins(){
        this.loadPluginsByFolder(path.join(__dirname, "node_modules"));
    }

    /**
     * load plugins by folder
     */
    loadPluginsByFolder(scanFolderName: string){
        try {
            let files = fs.readdirSync(scanFolderName);
            for (let i = 0; i < files.length; i++){
                let file = path.join(scanFolderName, files[i]);
                if (file.indexOf("webfaas-plugin-") > -1){
                    if (fs.statSync(file).isDirectory()){
                        let pluginFunctionFactory: any = require(file);
                        let newPlugin = this.instancePluginBuild(pluginFunctionFactory);
                        this.addPlugin(newPlugin);
                    }
                }
            }
        }
        catch (error) {
            return;
        }
    }
}