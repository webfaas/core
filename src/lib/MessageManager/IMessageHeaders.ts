/**
 * IMessageHeaders
 */

export interface IMessageHeadersAuthorization{
    type: string;
    token: string;
}

export interface IMessageHeadersHTTP{
    path: string;
    method: string;
    headers: any;
    statusCode?: number;
    contentType?: string;
}

export interface IMessageHeadersIdentity{
    iss: string;
    sub: string;
    aud: string;
    exp: number;
    nbf?: number;
    jti?: string;
    [claim: string]: any;
}

export interface IMessageHeaders {
    "tenantID": string;
    "messageID": string;
    "name": string;
    "version": string;
    "method": string;
    "registryName"?: string;
    "authorization"?: IMessageHeadersAuthorization;
    "identity"?: IMessageHeadersIdentity;
    "http"?: IMessageHeadersHTTP;
    [header: string]: any;
}