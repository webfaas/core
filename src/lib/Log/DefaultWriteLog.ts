import { ILogData, IWriteLog, LogLevelEnum } from './ILog';

export class DefaultWriteLog implements IWriteLog {
    constructor() {
    }

    write(logData: ILogData): void {
        //console.log(JSON.stringify(logData));
        if (logData.level === LogLevelEnum.INFO){
            let detailTexto = "";
            if (logData.detail){
                let detailTexto = JSON.stringify(logData.detail);
            }
            console.log(`${logData.level} ${logData.date.toISOString()} ${logData.method} CODE:${logData.code} MESSAGE:${logData.message} ${detailTexto} `);
        }
        else{
            console.log(JSON.stringify(logData));
        }
    }
}