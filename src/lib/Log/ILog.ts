import { IInvokeContext } from "../InvokeContext/IInvokeContext";

export enum LogLevelEnum {
    OFF = 0,
    FATAL = 100,
    ERROR = 200,
    WARN = 300,
    INFO = 400,
    DEBUG = 500,
    TRACE = 600
}

export enum LogCodeEnum {
    PROCESS = "PROCESS",
    OPENFILE = "OPENFILE",
    WRITEFILE = "WRITEFILE",
    COMPILE = "COMPILE"
}

export interface ILogData {
    level: LogLevelEnum,
    date: Date,
    method: string,
    message: string,
    code: string,
    stack?: string,
    filename?: string | null,
    invokeContext?: IInvokeContext,
    detail?: any
}

export interface IWriteLog {
    write(logData:ILogData):void
}

export function parseLogLevel(level: LogLevelEnum | string): LogLevelEnum{
    if (typeof(level) === "string"){
        level.toUpperCase();
        if (level === "OFF"){
            return LogLevelEnum.OFF;
        }
        else if (level === "FATAL"){
            return LogLevelEnum.FATAL;
        }
        else if (level === "ERROR"){
            return LogLevelEnum.ERROR;
        }
        else if (level === "WARN"){
            return LogLevelEnum.WARN;
        }
        else if (level === "DEBUG"){
            return LogLevelEnum.DEBUG;
        }
        else if (level === "TRACE"){
            return LogLevelEnum.TRACE;
        }
        else {
            return LogLevelEnum.INFO;
        }
    }
    else{
        return level;
    }
};