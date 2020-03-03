import * as fs from "fs";
import * as path from "path";
import { Core, LogLevelEnum } from "../Core";
import { IPlugin } from "./IPlugin";
import { LogCodeEnum } from "../Log/ILog";
import { DirectoryFSUtil } from "../Util/DirectoryFSUtil";

export class PluginManager {
    core: Core;
    listPlugin: Array<IPlugin> = new Array<IPlugin>();
    
    constructor(core: Core){
        this.core = core;
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
    loadPlugins(pluginsDir?: string){
        let targetDir = pluginsDir || DirectoryFSUtil.getMainDirectory();
        this.loadPluginsByFolder(path.join(targetDir, "node_modules"));
    }

    /**
     * load plugins by folder
     */
    loadPluginsByFolder(scanFolderName: string): void{
        let file: string = "";
        let filePath: string = "";
        try {
            let files = fs.readdirSync(scanFolderName);
            for (let i = 0; i < files.length; i++){
                file = files[i];
                filePath = path.join(scanFolderName, file);
                if (file.substring(0,1) === "@"){
                    this.loadPluginsByFolder(filePath);
                }
                else{
                    if (file.indexOf("webfaas-plugin-") === 0){
                        if (fs.statSync(filePath).isDirectory()){
                            let pluginFunctionFactory: any = require(filePath);
                            let newPlugin = this.instancePluginBuild(pluginFunctionFactory);
                            this.core.getLog().write(LogLevelEnum.INFO, "loadPluginsByFolder", LogCodeEnum.PROCESS.toString(), "plugin loaded", {file: file}, __filename);
                            this.addPlugin(newPlugin);
                        }
                    }
                }
            }
        }
        catch (errTry) {
            if (errTry.code === "ENOENT"){
                return;
            }
            else{
                this.core.getLog().writeError("loadPluginsByFolder", errTry, {scanFolderName: scanFolderName, file: file}, __filename);
                throw errTry;
            }
        }
    }
}