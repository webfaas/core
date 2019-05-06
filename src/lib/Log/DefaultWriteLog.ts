import { ILogData, IWriteLog } from './ILog';

export class DefaultWriteLog implements IWriteLog {
    constructor() {
    }

    write(logData: ILogData): void {
        console.log(JSON.stringify(logData));
    }
}