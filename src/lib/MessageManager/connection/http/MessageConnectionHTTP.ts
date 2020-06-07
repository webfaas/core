import { ClientHTTP, Log, IClientHTTPResponse } from "../../../Core";
import { IInvokeContext } from "../../../InvokeContext/IInvokeContext";
import { IncomingHttpHeaders } from "http";

export class MessageConnectionHTTP{
    private clientHTTP: ClientHTTP;
    private invokeContext: IInvokeContext;

    constructor(invokeContext: IInvokeContext, log: Log, clientHTTP:ClientHTTP){
        this.clientHTTP = clientHTTP;
        this.invokeContext = invokeContext;
    }
    
    request(url: string, method?: string, dataRequestBuffer?: Buffer, headers?: IncomingHttpHeaders): Promise<IClientHTTPResponse>{
        return this.clientHTTP.request(url, method, dataRequestBuffer, headers, this.invokeContext);
    }

    getTenantID(): string{
        return this.invokeContext.tenantID;
    }
}