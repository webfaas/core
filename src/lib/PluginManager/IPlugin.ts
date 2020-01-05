import { Core } from "../Core";

export interface IPlugin{
    startPlugin(core: Core): Promise<any>
    stopPlugin(core: Core ): Promise<any>
}

export interface IPluginFactory{
    (core:Core): IPlugin;
}