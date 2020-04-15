import { IMessage } from "./IMessage";

/**
 * IModuleManagerFilter
 */
export interface IMessageManagerFilter {
    priority: number
    filter(msg: IMessage): Promise<any>
}