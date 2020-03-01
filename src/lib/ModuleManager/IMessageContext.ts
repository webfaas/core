import { IRequestContext } from "./IRequestContext";

/**
 * IMessageContext
 */
export interface IMessageContext {
    requestContext: IRequestContext
    sendMessage(name: string, version: string, method: string, data: any, registryName?: string): Promise<any>
}