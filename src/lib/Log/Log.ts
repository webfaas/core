import * as path from 'path';

import { LogLevelEnum, LogCodeEnum, ILogData, IWriteLog, parseLogLevel } from './ILog';
import { DefaultWriteLog } from './DefaultWriteLog';
import { IInvokeContext } from '../InvokeContext/IInvokeContext';

const rootPath = process.cwd();
var logInstance:Log;

/**
 * Log
 */
export class Log {
    currentWriteLog: IWriteLog
    currentLevel: LogLevelEnum

    /**
     * 
     * @param writeLog class responsible for saving the log
     */
    constructor(writeLog?:IWriteLog) {
        if (writeLog){
            this.currentWriteLog = writeLog;
        }
        else{
            this.currentWriteLog = new DefaultWriteLog();
        }
        this.currentLevel = LogLevelEnum.INFO;
    }

    /**
     * return singleton instance
     */
    static getInstance(): Log{
        return logInstance;
    }

    private parseLog(level:LogLevelEnum, method:string, code:string, message:string, detail?:any, filename?:string, invokeContext?:IInvokeContext): ILogData{
        var logObj = {} as ILogData;
        logObj.level = level;
        logObj.date = new Date();
        logObj.method = method;
        logObj.code = code;
        logObj.message = message;
        if (detail){
            logObj.detail = detail;
        }
        if (filename){
            if (filename.indexOf(path.sep) === -1){
                logObj.filename = filename;
            }
            else{
                logObj.filename = path.relative(process.cwd(), filename);
            }
        }
        if (invokeContext){
            logObj.invokeContext = invokeContext;
        }
        return logObj;
    }

    /**
     * change level of log
     * @param level level of log
     */
    changeCurrentLevel(level: LogLevelEnum | string){
        this.currentLevel = parseLogLevel(level)
    }

    /**
     * write log
     * @param level of log
     * @param method name of method 
     * @param code code
     * @param message  message
     * @param detail generic object detail
     * @param filename name of file
     * @param invokeContext context invoke
     */
    write(level:LogLevelEnum, method:string, code:string, message:string, detail?:any, filename?:string, invokeContext?:any){
        try {
            if ((this.currentLevel !== LogLevelEnum.OFF) && (this.currentLevel >= level)){
                var logData: ILogData;
                logData = this.parseLog(level, method, code, message, detail, filename, invokeContext);
                this.currentWriteLog.write(logData);
            }
            else{
                //not write
                return;
            }
        }
        catch (errTry) {
            console.error(errTry);
        }
    }

    /**
     * write log error
     * @param method name of method
     * @param error object error
     * @param detail generic object detail
     * @param filename name of file
     * @param invokeContext context invoke
     */
    writeError(method:string, error:Error, detail?:any, filename?:string, invokeContext?:any){
        try {
            if ((this.currentLevel !== LogLevelEnum.OFF) && (this.currentLevel >= LogLevelEnum.ERROR)){
                var logData: ILogData;
                logData = this.parseLog(LogLevelEnum.ERROR, method, error.name, error.message, detail, filename, invokeContext);
                logData.stack = error.stack;
                this.currentWriteLog.write(logData);
            }
            else{
                //not write
                return;
            }
        }
        catch (errTry) {
            console.error(errTry);
        }
    }
}

logInstance = new Log();