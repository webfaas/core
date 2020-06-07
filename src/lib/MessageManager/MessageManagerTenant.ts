import { Config } from "../Config/Config";
import { IMessageConnectionFactory } from "./connection/IMessageConnectionFactory";
import { MessageConnectionHTTPFactory } from "./connection/http/MessageConnectionHTTPFactory";
import { IInvokeContext } from "../InvokeContext/IInvokeContext";
import { Log } from "../Core";

export class MessageManagerTenant{
    tenantID: string;
    config: Config;
    log: Log;
    listConnectionFactory: Map<string, IMessageConnectionFactory>;
    invokeContext = {} as IInvokeContext;

    constructor(tenantID: string, config: Config, log: Log){
        this.tenantID = tenantID;
        this.config = config;
        this.log = log;
        this.listConnectionFactory = new Map<string, IMessageConnectionFactory>();
        this.listConnectionFactory.set("http", new MessageConnectionHTTPFactory());
        this.invokeContext.tenantID = tenantID;
        this.invokeContext.getConnection = (name: string) => {
            let factoryConnection = this.listConnectionFactory.get(name);
            if (factoryConnection){
                return factoryConnection.factory(this.invokeContext, this.log, this.config);
            }
            else{
                return null;
            }
        }
    }

    stop(){
        this.listConnectionFactory.forEach((factory)=>{
            factory.stop();
        })
    }
}