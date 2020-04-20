/**
 * IMessageHeaders
 */

interface IMessageHeadersAuthorization{
    type: string;
    token: string;
}

interface IMessageHeadersIdentity{
    
}

export interface IMessageHeaders {
    "messageID": string;
    "name": string;
    "version": string;
    "method": string;
    "registryName"?: string;
    "authorization"?: IMessageHeadersAuthorization;
    "identity"?: IMessageHeadersIdentity;
    [header: string]: any;
}