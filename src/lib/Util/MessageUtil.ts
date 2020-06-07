import { IMessage } from "../MessageManager/IMessage";
import { IMessageHeaders, IMessageHeadersHTTP, IMessageHeadersAuthorization } from "../MessageManager/IMessageHeaders";
import { WebFaasError } from "../WebFaasError/WebFaasError";

interface IModuleInfo{
    name: string;
    method: string;
    version: string;
    path: string;
}

export interface IMessageErrorDetail{
    name: string;
    [header: string]: any;
}

export interface IMessageError{
    code: number;
    message: string;
    detail: IMessageErrorDetail;
}

export interface IJsonRpcResponse{
    jsonrpc: string;
    result: any;
    error?: IMessageError;
    id: string | number | null;
}

export interface IJsonRpcRequest{
    jsonrpc?: string;
    method: string;
    params: any;
    id: string | number | null;
}

export enum JsonRpcErrorTypeEnum{
    PARSE_ERROR=-32700,
    INVALID_REQUEST=-32600,
    METHOD_NOT_FOUND=-32601,
    INVALID_PARAMS=-32602,
    INTERNAL_ERROR=-32603,
    SERVER_ERROR=-32000
}

export class MessageUtil  {
    private static parseModuleInfo(urlPath: string, urlBasePath: string): IModuleInfo | null{
        let result = {} as IModuleInfo;
        let nameAndMethod: string;
        let version: string;
        let lastIndexUsed = 0;

        let context: string = MessageUtil.parseString(urlPath);
        if (context.substring(0,1) === "/"){
            context = context.substring(1);
        }
        if (urlBasePath){
            if (urlBasePath.substring(0,1) !== "/"){
                urlBasePath = "/" + urlBasePath;
            }
            context = context.substring(urlBasePath.length);
        }

        const pathArray = context.split("/");
        if (pathArray.length === 1){
            return null;
        }

        else if (pathArray.length === 2){
            nameAndMethod = pathArray[0];
            version = pathArray[1];
            lastIndexUsed = 1;
        }
        else{
            if (pathArray[0].substring(0,1) === "@"){
                nameAndMethod = pathArray[0] + "/" + pathArray[1];
                version = pathArray[2];
                lastIndexUsed = 2;
            }
            else{
                nameAndMethod = pathArray[0];
                version = pathArray[1];
                lastIndexUsed = 1;
            }
        }

        let path: string = "";
        for (let i = lastIndexUsed + 1; i < pathArray.length; i++){
            path += "/" + pathArray[i];
        }
        
        let nameAndMethodArray = nameAndMethod.split(":");
        if (nameAndMethodArray.length > 1){
            result.name = nameAndMethodArray[0];
            result.method = nameAndMethodArray[1];
        }
        else{
            result.name = nameAndMethodArray[0];
            result.method = "";
        }
        result.version = version;
        result.path = path;

        return result;
    };

    private static parseAuthorizationHeader(value: any): IMessageHeadersAuthorization | undefined{
        let result = {} as IMessageHeadersAuthorization;

        if (value){
            let authorizationArray = MessageUtil.parseString(value).split(" ");
            if (authorizationArray.length === 2){
                result.type = authorizationArray[0].toLowerCase();
                result.token = authorizationArray[1];
            }
            else{
                return undefined;
            }
        }
        else{
            return undefined;
        }
        
        return result;
    };

    public static parseString(value: any): string{
        if (typeof(value) === "string"){
            return value;
        }
        else{
            return "";
        }
    };

    public static parseVersion(version: string): string{
        let versionArray: Array<string> = version.split(".");
        if (versionArray.length === 1){
            return version + ".*";
        }
        if (versionArray.length === 2){
            return version + ".*";
        }
        return version;
    }

    public static parseMessageByUrlPath(urlPath: string, urlBasePath: string, payload: any, http_method?: string, http_headers?: any): IMessage | null{
        let msg = {} as IMessage;

        let moduleInfo = MessageUtil.parseModuleInfo(urlPath, urlBasePath);

        if (moduleInfo){
            msg.header = {} as IMessageHeaders;
            msg.header.name = moduleInfo.name;
            msg.header.method = moduleInfo.method;
            msg.header.version = MessageUtil.parseVersion(moduleInfo.version);
            msg.header.messageID = "";

            if (http_headers){
                msg.header.messageID = MessageUtil.parseString(http_headers["X-Request-ID"]);
                msg.header.authorization = MessageUtil.parseAuthorizationHeader(http_headers["Authorization"]);
            }

            msg.header.http = {} as IMessageHeadersHTTP;
            msg.header.http.path = moduleInfo.path;
            msg.header.http.method = (http_method || "GET").toUpperCase();
            msg.header.http.headers = http_headers || null;
    
            msg.payload = payload;

            if (!msg.header.method){
                 msg.header.method = msg.header.http.method.toLowerCase();
            }
    
            return msg;
        }
        else{
            return null;
        }
    }

    public static parseJsonRpcResponseError(typeErrorOrCode: JsonRpcErrorTypeEnum | number, err: Error): IJsonRpcResponse{
        let payloadJsonRpc = {} as IJsonRpcResponse;
        payloadJsonRpc.jsonrpc = "2.0";
        payloadJsonRpc.error = {} as IMessageError;
        payloadJsonRpc.error.code = typeErrorOrCode;
        payloadJsonRpc.error.message = err.message;
        payloadJsonRpc.error.detail = Object.assign({}, err);
        if (!payloadJsonRpc.error.detail.name){
            payloadJsonRpc.error.detail.name = err.name;
        }
        payloadJsonRpc.id = null;
        return payloadJsonRpc;
    }

    public static parseJsonRpcResponseSuccess(payload: any, id: string | number): IJsonRpcResponse{
        let payloadJsonRpc = {} as IJsonRpcResponse;
        payloadJsonRpc.jsonrpc = "2.0";
        payloadJsonRpc.result = payload;
        payloadJsonRpc.id = id;
        return payloadJsonRpc;
    }

    public static parseJsonRpcRequest(payload: any): IJsonRpcRequest{
        let payloadObj: IJsonRpcRequest;

        if (!payload){
            throw new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.PAYLOAD_INVALID, "payload required");
        }

        try {
            payloadObj = JSON.parse(payload.toString());
        }
        catch (errParse) {
            throw new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.PAYLOAD_INVALID, errParse.message);
        }

        if (typeof(payloadObj.method) !== "string"){
            throw new WebFaasError.NotFoundError(WebFaasError.NotFoundErrorTypeEnum.METHOD, "The JSON sent is not a valid Request object.");
        }

        return payloadObj;
    }

    public static parseMessageByPayloadJsonRpc(payloadJsonRpcRequest: IJsonRpcRequest, http_urlPath?: string, http_method?: string, http_headers?: any): IMessage | null{
        let msg = {} as IMessage;

        if (payloadJsonRpcRequest && payloadJsonRpcRequest.method){
            let moduleInfo = MessageUtil.parseModuleInfo(payloadJsonRpcRequest.method, "");

            if (moduleInfo){
                msg.header = {} as IMessageHeaders;
                msg.header.name = moduleInfo.name;
                msg.header.method = moduleInfo.method;
                msg.header.version = MessageUtil.parseVersion(moduleInfo.version);
                msg.header.messageID = (payloadJsonRpcRequest.id || "").toString();

                if (http_headers){
                    msg.header.authorization = MessageUtil.parseAuthorizationHeader(http_headers["Authorization"]);
                }
                if (http_urlPath){
                    msg.header.http = {} as IMessageHeadersHTTP;
                    msg.header.http.path = http_urlPath;
                    msg.header.http.method = http_method || "GET";
                    msg.header.http.headers = http_headers || null;
                }
        
                msg.payload = payloadJsonRpcRequest.params || null;
        
                return msg;
            }
            else{
                return null;
            }
        }
        else{
            return null;
        }
    }

    public static convertErrorToCodeHttp(errSend: Error): number{
        if (errSend instanceof WebFaasError.ClientHttpError){
            return 502;
        }
        else if (errSend instanceof WebFaasError.CompileError){
            return 501;
        }
        else if (errSend instanceof WebFaasError.NotFoundError){
            return 404;
        }
        else if (errSend instanceof WebFaasError.ValidateError){
            return 400;
        }
        else if (errSend instanceof WebFaasError.SecurityError){
            let httpError: WebFaasError.SecurityError = errSend;
            let statusCode: number = 400;

            if (httpError.type === WebFaasError.SecurityErrorTypeEnum.MISSING_CREDENTIALS){
                statusCode = 401;
            }
            else if (httpError.type === WebFaasError.SecurityErrorTypeEnum.FORBIDDEN){
                statusCode = 403;
            }
            else if (httpError.type === WebFaasError.SecurityErrorTypeEnum.INVALID_CREDENTIALS){
                statusCode = 401;
            }
            else if (httpError.type === WebFaasError.SecurityErrorTypeEnum.PAYLOAD_INVALID){
                statusCode = 400;
            }
            else if (httpError.type === WebFaasError.SecurityErrorTypeEnum.PAYLOAD_LARGE){
                statusCode = 413;
            }
            else if (httpError.type === WebFaasError.SecurityErrorTypeEnum.THROTTLED){
                statusCode = 429;
            }
            else if (httpError.type === WebFaasError.SecurityErrorTypeEnum.UNCLASSIFIED){
                statusCode = 400;
            }

            return statusCode;
        }
        else{
            return 500;
        }
    }

    public static convertErrorToCodeJsonRpc(errSend: Error): number{
        if (errSend instanceof WebFaasError.ClientHttpError){
            return -32600; //Invalid Request
        }
        else if (errSend instanceof WebFaasError.NotFoundError){
            return -32601; //Method not found
        }
        else if (errSend instanceof WebFaasError.ValidateError){
            return -32600; //Invalid Request
        }
        else if (errSend instanceof WebFaasError.SecurityError){
            return -32600; //Invalid Request
        }
        else{
            return -32000; //Server error
        }
    }
}