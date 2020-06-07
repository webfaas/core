import { Log } from "../Log/Log";
import { types } from "util"
import { WebFaasError } from "../WebFaasError/WebFaasError";
import { IMessage } from "./IMessage";
import { ModuleManager } from "../ModuleManager/ModuleManager";
import { ModuleManagerImport } from "../ModuleManager/ModuleManagerImport";
import { IMessageManagerFilter } from "./IMessageManagerFilter";
import { LogLevelEnum, EventManager, EventManagerEnum } from "../Core";
import { LogCodeEnum } from "../Log/ILog";
import { MessageUtil } from "../Util/MessageUtil";
import { MessageManagerTenant } from "./MessageManagerTenant";
import { Config } from "../Config/Config";

/**
 * Message Manager
 */
export class MessageManager {
    private log: Log;
    private moduleManager: ModuleManager;
    private moduleManagerImport: ModuleManagerImport;
    private preFilterInvokeAsyncList: Array<IMessageManagerFilter> = new Array<IMessageManagerFilter>();
    private listTenant: Map<string, MessageManagerTenant> = new Map<string, MessageManagerTenant>();
    private defaultTenant: MessageManagerTenant;
    
    constructor(moduleManager: ModuleManager, log: Log){
        this.moduleManager = moduleManager;
        this.moduleManagerImport = this.moduleManager.getModuleManagerImport();
        this.log = log;
        
        let defaultConfig = new Config();
        this.defaultTenant = new MessageManagerTenant("default", defaultConfig, this.log);

        EventManager.addListener(EventManagerEnum.QUIT, ()=>{
            this.stop();
        });
    }

    /**
     * return tenant
     * @param name tenant name
     */
    getTenant(name: string): MessageManagerTenant{
        let tenant = this.listTenant.get(name);
        if (tenant){
            return tenant;
        }
        else{
            return this.defaultTenant;
        }
    }

    /**
     * add tenant
     * @param name tenant name
     * @param tenant tenant
     */
    addTenant(name: string, tenant: MessageManagerTenant){
        this.listTenant.set(name, tenant);
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

    /**
     * parse version
     * @param version 
     */
    parseVersion(version: string): string{
        return MessageUtil.parseVersion(version);
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
                reject(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.PAYLOAD_INVALID, "message required"));
                return;
            }
            //msg.header
            if (!msg.header){
                reject(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.PAYLOAD_INVALID, "header required"));
                return;
            }
            //msg.header.name
            if (typeof(msg.header.name) !== "string"){
                reject(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.PAYLOAD_INVALID, "header.name type string required"));
                return;
            }
            if (msg.header.name.length > 214){
                reject(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.PAYLOAD_INVALID, "header.name max length 214"));
                return;
            }
            //msg.header.version
            if (typeof(msg.header.version) !== "string"){
                reject(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.PAYLOAD_INVALID, "header.version type string required"));
                return;
            }
            if (msg.header.version.length > 256){
                reject(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.PAYLOAD_INVALID, "header.version max length 256"));
                return;
            }
            //msg.header.method
            if (typeof(msg.header.method) !== "string"){
                reject(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.PAYLOAD_INVALID, "header.method type string required"));
                return;
            }
            if (msg.header.method.length > 256){
                reject(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.PAYLOAD_INVALID, "header.method max length 256"));
                return;
            }
            //msg.header.messageID
            if (typeof(msg.header.messageID) !== "string"){
                reject(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.PAYLOAD_INVALID, "header.messageID type string required"));
                return;
            }
            if (msg.header.messageID.length > 1024){
                reject(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.PAYLOAD_INVALID, "header.messageID max length 1024"));
                return;
            }
            //msg.header.registryName
            if (typeof(msg.header.registryName) !== "string" && typeof(msg.header.registryName) !== "undefined"){
                reject(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.PAYLOAD_INVALID, "header.registryName type not string"));
                return;
            }
            if (msg.header.registryName && msg.header.registryName.length > 1024){
                reject(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.PAYLOAD_INVALID, "header.registryName max length 1024"));
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

                        if (targetInvoke){
                            let tenant = this.getTenant(msg.header.tenantID);
                            
                            let startTime_invoke = new Date().getTime();
                            let responseSyncCallInvoke = targetInvoke(msg, tenant.invokeContext);
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
                            reject(new WebFaasError.NotFoundError(WebFaasError.NotFoundErrorTypeEnum.METHOD, msg.header.method));
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

    stop(){
        this.listTenant.forEach((tenant) => {
            tenant.stop();
        })
    }
}