import { Log } from "../Log/Log";
import { types } from "util"
import { WebFaasError } from "../WebFaasError/WebFaasError";
import { IMessage } from "./IMessage";
import { ModuleManager } from "../ModuleManager/ModuleManager";
import { ModuleManagerImport } from "../ModuleManager/ModuleManagerImport";
import { IMessageManagerFilter } from "./IMessageManagerFilter";

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
        this.moduleManagerImport = moduleManager.getModuleManagerImport();
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

    /**
     * send message
     * @param msg 
     */
    sendMessage(msg: IMessage): Promise<any>{
        return new Promise((resolve, reject) => {
            this.moduleManagerImport.import(msg.header.name, msg.header.version, undefined, msg.header.registryName, true).then((moduleObj: any)=>{
                if (moduleObj){
                    //pre filter
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
                            let responseSyncCallInvoke = targetInvoke(msg);
                            if (types.isPromise(responseSyncCallInvoke)){
                                Promise.resolve(responseSyncCallInvoke).then((responseAsyncCallInvoke: any) => {
                                    resolve(responseAsyncCallInvoke);
                                }).catch((errTryPromise) => {
                                    reject(new WebFaasError.InvokeError(errTryPromise));
                                });
                            }    
                            else{
                                resolve(responseSyncCallInvoke);
                            }
                        }
                        else{
                            //method not found
                            reject(new WebFaasError.NotFoundError(WebFaasError.NotFoundErrorTypeEnum.FUNCMETHOD, msg.header.method));
                        }
                    }).catch((errPreFilter)=>{
                        //pre filter - error
                        reject(errPreFilter);
                    })
                }
                else{
                    resolve(null);
                }
            }).catch((errImport) => {
                reject(errImport);
            });
        })
    }
}