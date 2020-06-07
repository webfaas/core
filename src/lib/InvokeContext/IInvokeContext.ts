import { LogLevelEnum } from "../Core";

export interface IInvokeContext {
    tenantID: string;
    writeLog(level:LogLevelEnum, message:string): void;
    getConnection(name: string): any
}