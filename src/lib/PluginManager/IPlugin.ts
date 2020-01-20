import { Core } from "../Core";

export interface IPlugin{
    startPlugin(core: Core): Promise<any>
    stopPlugin(core: Core ): Promise<any>
}