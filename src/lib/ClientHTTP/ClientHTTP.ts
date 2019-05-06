import * as http from "http";
import * as https from "https";
import * as urlParse from "url";
import { ClientHTTPConfig } from "./ClientHTTPConfig";
import { IClientHTTPResponse } from "./IClientHTTPResponse";
import { Log } from "../Log/Log";
import { LogLevelEnum, LogCodeEnum } from "../Log/ILog";
import { IInvokeContext } from "../InvokeContext/IInvokeContext";
import { IncomingHttpHeaders } from "http";

const log = Log.getInstance();

export class ClientHTTP  {
    listHttpAgent: Map<string, http.Agent> = new Map<string, http.Agent>();
    listHttpsAgent: Map<string, https.Agent> = new Map<string, https.Agent>();
    
    private config: ClientHTTPConfig;

    constructor(config?: ClientHTTPConfig){
        if (config){
            this.config = config;
        }
        else{
            this.config = new ClientHTTPConfig();
        }
    }

    /**
     * return singleton instance
     */
    static getInstance(): ClientHTTP{
        return clientHTTPInstance;
    }

    /**
     * request http/https
     * @param url remote url
     * @param method methods http. ex: GET | POST | PUT | DELETE
     * @param headers headers http
     */
    request(url: string, method?: string, data?: any, headers?: IncomingHttpHeaders, invokeContext?: IInvokeContext): Promise<IClientHTTPResponse>{
        return new Promise((resolve, reject) => {
            try {
                var data = [] as any[];
                var urlParsedObj = urlParse.parse(url);
                var clientHTTPResponseObj = {} as IClientHTTPResponse;
                var clientRequest: http.ClientRequest;
    
                var handleResponse = function(responseHTTP: http.IncomingMessage){
                    responseHTTP.on("data", function(chunk){
                        data.push(chunk);
                    });
                    responseHTTP.on("end", function(){
                        try {
                            if (responseHTTP.statusCode){
                                clientHTTPResponseObj.statusCode = responseHTTP.statusCode;
                            }
                            else{
                                clientHTTPResponseObj.statusCode = 0;
                            }
                            clientHTTPResponseObj.headers = responseHTTP.headers;
                            clientHTTPResponseObj.data = Buffer.concat(data);
    
                            //log.info(__filename, "request", {method:option.method, url:url, statusCode:response.statusCode, responseTime:(new Date().getTime() - startTime), size:buffer.length});

                            resolve(clientHTTPResponseObj);
                        }
                        catch (errTry) {
                            reject(errTry);
                        }
                    });
                }
        
                if (method){
                    method = method.toUpperCase();
                }
                else{
                    method = "GET";
                }
                
                if (urlParsedObj.protocol === "https:"){
                    let httpsRequestOption: https.RequestOptions = {};
                    httpsRequestOption.timeout = this.config.timeout;
                    httpsRequestOption.method = method;
                    if (headers){
                        httpsRequestOption.headers = headers;
                    }
                    httpsRequestOption.rejectUnauthorized = this.config.rejectUnauthorized;
                    
                    httpsRequestOption.host = urlParsedObj.host;
                    httpsRequestOption.hostname = urlParsedObj.hostname;
                    httpsRequestOption.path = urlParsedObj.path;
                    httpsRequestOption.port = urlParsedObj.port;
        
                    var httpsAgent: https.Agent | undefined = this.listHttpsAgent.get(httpsRequestOption.hostname || "");
                    if (!httpsAgent){
                        httpsAgent = new https.Agent({ keepAlive: this.config.keepAlive, maxSockets:this.config.maxSockets });
                        this.listHttpsAgent.set(httpsRequestOption.hostname || "", httpsAgent);
                        
                        log.write(LogLevelEnum.INFO, "request", LogCodeEnum.PROCESS.toString(), "new agent", {protocol:"https", hostname: httpsRequestOption.hostname, keepAlive: this.config.keepAlive, maxSockets:this.config.maxSockets}, __filename, invokeContext);
                    }
                    httpsRequestOption.agent = httpsAgent;
    
                    clientRequest = https.request(httpsRequestOption, handleResponse);
                }
                else{
                    let httpRequestOption: http.RequestOptions = {};
                    httpRequestOption.timeout = this.config.timeout;
                    httpRequestOption.method = method;
                    if (headers){
                        httpRequestOption.headers = headers;
                    }
        
                    httpRequestOption.host = urlParsedObj.host;
                    httpRequestOption.hostname = urlParsedObj.hostname;
                    httpRequestOption.path = urlParsedObj.path;
                    httpRequestOption.port = urlParsedObj.port;
        
                    var httpAgent: http.Agent | undefined = this.listHttpAgent.get(httpRequestOption.hostname || "");
                    if (!httpAgent){
                        httpAgent = new http.Agent({ keepAlive: this.config.keepAlive, maxSockets:this.config.maxSockets });
                        this.listHttpAgent.set(httpRequestOption.hostname || "", httpAgent);

                        log.write(LogLevelEnum.INFO, "request", LogCodeEnum.PROCESS.toString(), "new agent", {protocol:"http", hostname: httpRequestOption.hostname, keepAlive: this.config.keepAlive, maxSockets:this.config.maxSockets}, __filename, invokeContext);
                    }
                    httpRequestOption.agent = httpAgent;
        
                    clientRequest = http.request(httpRequestOption, handleResponse);
                }
    
                clientRequest.on("timeout", function() {
                    clientRequest.abort();
                });

                clientRequest.on("error", function(err) {
                    //log.error(__filename, "request", {code:err.code, message:err.message, url:url, maxTime:self.config.requestTimeout});
                    reject(err);
                });

                if (data){
                    clientRequest.write(data);
                }
                
                clientRequest.end();
            }
            catch (errTry) {
                reject(errTry);
            }
        })
    }
}

const clientHTTPInstance: ClientHTTP = new ClientHTTP();