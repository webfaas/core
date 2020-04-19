import { Log } from "../Log/Log";
import { types } from "util"
import { WebFaasError } from "../WebFaasError/WebFaasError";
import { IMessage } from "./IMessage";
import { ModuleManager } from "../ModuleManager/ModuleManager";
import { ModuleManagerImport } from "../ModuleManager/ModuleManagerImport";
import { IMessageManagerFilter } from "./IMessageManagerFilter";
import { LogLevelEnum } from "../Core";
import { LogCodeEnum } from "../Log/ILog";

/**
 * manager Module
 */
export class MessageManager {
    private log: Log;
    private moduleManager: ModuleManager;
    private moduleManagerImport: ModuleManagerImport;
    private preFilterInvokeAsyncList: Array<IMessageManagerFilter> = new Array<IMessageManagerFilter>();
    
    constructor(moduleManager: ModuleManager, log: Log){
        this.moduleManager = moduleManager;
        this.moduleManagerImport = this.moduleManager.getModuleManagerImport();
        this.log = log;
    }

    /**
     * add pre filter
     * @param filter 
     */
    addPreFilterInvokeAsync(filter: IMessageManagerFilter): void{
        if (filter.priority){
            for (let i = 0; i < this.preFilterInvokeAsyncList.length; i++){
                let item = this.preFilterInvokeAsyncList[i];
                if (filter.priority > item.priority){
                    this.preFilterInvokeAsyncList.splice(i, 0, filter);
                    return;
                }
            }
        }
        this.preFilterInvokeAsyncList.push(filter);
    }

    parseVersion(version: string): string{
        let versionArray: Array<string> = version.split(".");
        if (versionArray.length === 1){
            return version + ".*";
        }
        if (versionArray.length === 2){
            return version + ".*";
        }
        return version;
    }

    /**
     * send message
     * @param msg 
     */
    sendMessage(msg: IMessage): Promise<IMessage | null>{
        let startTime_init = new Date().getTime();
        return new Promise((resolve, reject) => {
            //
            //validate input
            //
            
            //msg
            if (!msg){
                reject(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.PAYLOADINVALID, new TypeError("message required")));
                return;
            }
            //msg.header
            if (!msg.header){
                reject(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.PAYLOADINVALID, new TypeError("header required")));
                return;
            }
            //msg.header.name
            if (typeof(msg.header.name) !== "string"){
                reject(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.PAYLOADINVALID, new TypeError("header.name type string required")));
                return;
            }
            if (msg.header.name.length > 214){
                reject(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.PAYLOADINVALID, new TypeError("header.name max length 214")));
                return;
            }
            //msg.header.version
            if (typeof(msg.header.version) !== "string"){
                reject(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.PAYLOADINVALID, new TypeError("header.version type string required")));
                return;
            }
            if (msg.header.version.length > 256){
                reject(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.PAYLOADINVALID, new TypeError("header.version max length 256")));
                return;
            }
            //msg.header.method
            if (typeof(msg.header.method) !== "string"){
                reject(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.PAYLOADINVALID, new TypeError("header.method type string required")));
                return;
            }
            if (msg.header.method.length > 256){
                reject(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.PAYLOADINVALID, new TypeError("header.method max length 256")));
                return;
            }
            //msg.header.messageID
            if (typeof(msg.header.messageID) !== "string"){
                reject(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.PAYLOADINVALID, new TypeError("header.messageID type string required")));
                return;
            }
            if (msg.header.messageID.length > 1024){
                reject(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.PAYLOADINVALID, new TypeError("header.messageID max length 1024")));
                return;
            }
            //msg.header.registryName
            if (typeof(msg.header.registryName) !== "string" && typeof(msg.header.registryName) !== "undefined"){
                reject(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.PAYLOADINVALID, new TypeError("header.registryName type not string")));
                return;
            }
            if (msg.header.registryName && msg.header.registryName.length > 1024){
                reject(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.PAYLOADINVALID, new TypeError("header.registryName max length 1024")));
                return;
            }

            //
            //execute
            //
            this.moduleManagerImport.import(msg.header.name, msg.header.version, undefined, msg.header.registryName, true).then((moduleObj: any)=>{
                if (moduleObj){
                    //pre filter
                    let startTime_filter = new Date().getTime();
                    Promise.all(this.preFilterInvokeAsyncList.map((item)=>{return item.filter(msg)})).then(()=>{
                        //pre filter - ok
                        let targetInvoke: Function | undefined = undefined;
                        if (msg.header.method){
                            targetInvoke = moduleObj[msg.header.method];
                        }
                        else{
                            targetInvoke = moduleObj;
                        }
                        
                        let startTime_invoke = new Date().getTime();
                        if (targetInvoke){
                            let responseSyncCallInvoke = targetInvoke(msg);
                            if (types.isPromise(responseSyncCallInvoke)){
                                Promise.resolve(responseSyncCallInvoke).then((responseAsyncCallInvoke: any) => {
                                    let endTime_invoke = new Date().getTime();
                                    let optLog: any = {}
                                    optLog.header = msg.header;
                                    optLog.time = {};
                                    optLog.time.total = endTime_invoke - startTime_init;
                                    optLog.time.filter = startTime_invoke - startTime_filter;
                                    optLog.time.invoke = endTime_invoke - startTime_invoke;
                                    this.log.write(LogLevelEnum.INFO, "sendMessage", LogCodeEnum.PROCESS, "invoke", optLog, __filename);
                                    resolve(responseAsyncCallInvoke);
                                }).catch((errTryPromise) => {
                                    reject(new WebFaasError.InvokeError(errTryPromise));
                                });
                            }    
                            else{
                                let endTime_invoke = new Date().getTime();
                                let optLog: any = {}
                                optLog.header = msg.header;
                                optLog.time = {};
                                optLog.time.total = endTime_invoke - startTime_init;
                                optLog.time.filter = startTime_invoke - startTime_filter;
                                optLog.time.invoke = endTime_invoke - startTime_invoke;
                                this.log.write(LogLevelEnum.INFO, "sendMessage", LogCodeEnum.PROCESS, "invoke", optLog, __filename);
                                resolve(responseSyncCallInvoke);
                            }
                        }
                        else{
                            //method not found
                            this.log.write(LogLevelEnum.ERROR, "sendMessage", LogCodeEnum.PROCESS, "method not found", {header:msg.header}, __filename);
                            reject(new WebFaasError.NotFoundError(WebFaasError.NotFoundErrorTypeEnum.FUNCMETHOD, msg.header.method));
                        }
                    }).catch((errPreFilter)=>{
                        //pre filter - error
                        this.log.writeError("sendMessage:prefilter", errPreFilter, {header:msg.header}, __filename);
                        reject(errPreFilter);
                    })
                }
                else{
                    reject(new WebFaasError.NotFoundError(WebFaasError.NotFoundErrorTypeEnum.MANIFEST, "module not found"));
                }
            }).catch((errImport) => {
                //import - error
                this.log.writeError("sendMessage:import", errImport, {header:msg.header}, __filename);
                reject(errImport);
            });
        })
    }
}