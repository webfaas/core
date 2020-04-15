/**
 * IMessageHeaders
 */
export interface IMessageHeaders {
    "messageID": string;
    "name": string;
    "version": string;
    "method": string;
    "registryName"?: string;
    [header: string]: any;
}