import { IInvokeContext } from "../../InvokeContext/IInvokeContext";
import { Log } from "../../Core";
import { Config } from "../../Config/Config";

export interface IMessageConnectionFactory{
    factory(invokeContext: IInvokeContext, log: Log, config:Config): any
    stop(): void
}