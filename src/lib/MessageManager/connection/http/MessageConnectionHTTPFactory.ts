import { IInvokeContext } from "../../../InvokeContext/IInvokeContext";
import { Log, ClientHTTP } from "../../../Core";
import { IMessageConnectionFactory } from "../IMessageConnectionFactory";
import { Config } from "../../../Config/Config";
import { MessageConnectionHTTP } from "./MessageConnectionHTTP";

const listMessageConnectionByTenant: Map<string, MessageConnectionHTTP> = new Map<string, MessageConnectionHTTP>();
const listClientConnectionByTenant: Map<string, ClientHTTP> = new Map<string, ClientHTTP>();

export class MessageConnectionHTTPFactory implements IMessageConnectionFactory{
    factory(invokeContext: IInvokeContext, log: Log, config: Config) {
        let messageConnectionHTTP = listMessageConnectionByTenant.get(invokeContext.tenantID);
        if (!messageConnectionHTTP){
            let configHttp = config.get("http");
            let clientHTTP = new ClientHTTP(configHttp, log);
            messageConnectionHTTP = new MessageConnectionHTTP(invokeContext, log, clientHTTP);
            
            listMessageConnectionByTenant.set(invokeContext.tenantID, messageConnectionHTTP);
            listClientConnectionByTenant.set(invokeContext.tenantID, clientHTTP);
        }
        return messageConnectionHTTP;
    }
    
    stop(): void {
        listClientConnectionByTenant.forEach(clientHTTP => {
            clientHTTP.destroy();
        });
        listClientConnectionByTenant.clear();
        listMessageConnectionByTenant.clear();
    }
}