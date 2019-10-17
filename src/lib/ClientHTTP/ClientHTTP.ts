import * as http from "http";
import * as https from "https";
import * as urlParse from "url";
import { ClientHTTPConfig } from "./ClientHTTPConfig";
import { IClientHTTPResponse } from "./IClientHTTPResponse";
import { Log } from "../Log/Log";
import { LogLevelEnum, LogCodeEnum } from "../Log/ILog";
import { IInvokeContext } from "../InvokeContext/IInvokeContext";
import { IncomingHttpHeaders } from "http";

export class ClientHTTP  {
    listHttpAgent: Map<string, http.Agent> = new Map<string, http.Agent>();
    listHttpsAgent: Map<string, https.Agent> = new Map<string, https.Agent>();
    
    private config: ClientHTTPConfig;
    private log: Log;

    constructor(config?: ClientHTTPConfig, log?: Log){
        this.log = log || Log.getInstance();

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
     * destroy all agents
     */
    destroy(){
        Array.from(this.listHttpAgent.keys()).forEach((key) => {
            let agent = this.listHttpAgent.get(key);
            if (agent){
                agent.destroy();
                this.listHttpAgent.delete(key);
            }
        });

        Array.from(this.listHttpsAgent.keys()).forEach((key) => {
            let agent = this.listHttpsAgent.get(key);
            if (agent){
                agent.destroy();
                this.listHttpsAgent.delete(key);
            }
        });
    }

    /**
     * request http/https
     * @param url remote url
     * @param method methods http. ex: GET | POST | PUT | DELETE
     * @param headers headers http
     */
    request(url: string, method?: string, dataRequestBuffer?: Buffer, headers?: IncomingHttpHeaders, invokeContext?: IInvokeContext): Promise<IClientHTTPResponse>{
        var selfLog: Log = this.log;
        
        return new Promise((resolve, reject) => {
            try {
                var dataResponse = [] as any[];
                var urlParsedObj = urlParse.parse(url);
                var clientHTTPResponseObj = {} as IClientHTTPResponse;
                var clientRequest: http.ClientRequest;
                var startTime = new Date().getTime();
    
                var handleResponse = function(responseHTTP: http.IncomingMessage){
                    responseHTTP.on("data", function(chunk){
                        dataResponse.push(chunk);
                    });
                    responseHTTP.on("end", function(){
                        try {
                            clientHTTPResponseObj.statusCode = responseHTTP.statusCode || 0;
                            clientHTTPResponseObj.headers = responseHTTP.headers;
                            clientHTTPResponseObj.data = Buffer.concat(dataResponse);

                            selfLog.write(LogLevelEnum.INFO, "request", LogCodeEnum.PROCESS.toString(), "reponse", {url:url, method: method, statusCode: clientHTTPResponseObj.statusCode, size: clientHTTPResponseObj.data.length, responseTime:(new Date().getTime() - startTime)}, __filename, invokeContext);

                            resolve(clientHTTPResponseObj);
                        }
                        catch (errTry) {
                            selfLog.writeError("request", errTry, {method:method, url:url}, __filename, invokeContext);
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

                    httpsRequestOption.key = this.config.key;
                    httpsRequestOption.cert = this.config.cert;
                    httpsRequestOption.pfx = this.config.pfx;
                    httpsRequestOption.ca = this.config.ca;
                    
                    httpsRequestOption.host = urlParsedObj.host;
                    httpsRequestOption.hostname = urlParsedObj.hostname;
                    httpsRequestOption.path = urlParsedObj.path;
                    httpsRequestOption.port = urlParsedObj.port;
                    
                    var httpsAgent: https.Agent | undefined = this.listHttpsAgent.get(httpsRequestOption.hostname || "");
                    if (!httpsAgent){
                        httpsAgent = new https.Agent({ keepAlive: this.config.keepAlive, maxSockets:this.config.maxSockets });
                        this.listHttpsAgent.set(httpsRequestOption.hostname || "", httpsAgent);
                        
                        selfLog.write(LogLevelEnum.INFO, "request", LogCodeEnum.PROCESS.toString(), "new agent", {protocol:"https", hostname: httpsRequestOption.hostname, keepAlive: this.config.keepAlive, maxSockets:this.config.maxSockets}, __filename, invokeContext);
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

                        selfLog.write(LogLevelEnum.INFO, "request", LogCodeEnum.PROCESS.toString(), "new agent", {protocol:"http", hostname: httpRequestOption.hostname, keepAlive: this.config.keepAlive, maxSockets:this.config.maxSockets}, __filename, invokeContext);
                    }
                    httpRequestOption.agent = httpAgent;
        
                    clientRequest = http.request(httpRequestOption, handleResponse);
                }
    
                clientRequest.on("timeout", function() {
                    clientRequest.abort();
                });

                clientRequest.on("error", function(err) {
                    selfLog.writeError("request", err, {method:method, url:url}, __filename, invokeContext);
                    reject(err);
                });

                if (dataRequestBuffer){
                    clientRequest.write(dataRequestBuffer);
                }
                
                clientRequest.end();
            }
            catch (errTry) {
                selfLog.writeError("request", errTry, {method:method, url:url}, __filename, invokeContext);
                reject(errTry);
            }
        })
    }
}

const clientHTTPInstance: ClientHTTP = new ClientHTTP();