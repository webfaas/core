import { IMessageHeaders } from "./IMessageHeaders";

/**
 * IMessage
 */
export interface IMessage {
    payload: any
    header: IMessageHeaders
}