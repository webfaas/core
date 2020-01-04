import { Core } from "../Core";

export enum TypePluginEnum{
    PACKAGEREGISTRY = "PACKAGEREGISTRY"
}

export interface IPlugin{
    typePlugin: TypePluginEnum
    startPlugin(core: Core): Promise<any>
    stopPlugin(core: Core ): Promise<any>
}

export interface IPluginFactory{
    (core:Core): IPlugin;
}