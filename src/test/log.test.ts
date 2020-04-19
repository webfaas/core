import * as chai from "chai";

import {Log} from "../lib/Log/Log";
import { LogLevelEnum, IWriteLog, ILogData, parseLogLevel } from "../lib/Log/ILog";

var lastLog: ILogData;
var lastLogException: Error;

class CustomWriteLog implements IWriteLog {
    write(logData: ILogData): void {
        lastLog = logData;
    }
}

class CustomWriteLogException implements IWriteLog {
    write(logData: ILogData): void {
        throw new Error("Exception test");
    }
}

describe("ILog", () => {
    it("should write log on call string", () => {
        chai.expect(parseLogLevel("OFF")).to.eq(LogLevelEnum.OFF);
        chai.expect(parseLogLevel("FATAL")).to.eq(LogLevelEnum.FATAL);
        chai.expect(parseLogLevel("ERROR")).to.eq(LogLevelEnum.ERROR);
        chai.expect(parseLogLevel("WARN")).to.eq(LogLevelEnum.WARN);
        chai.expect(parseLogLevel("INFO")).to.eq(LogLevelEnum.INFO);
        chai.expect(parseLogLevel("DEBUG")).to.eq(LogLevelEnum.DEBUG);
        chai.expect(parseLogLevel("TRACE")).to.eq(LogLevelEnum.TRACE);
    })

    it("should write log on call number", () => {
        chai.expect(parseLogLevel(0)).to.eq(LogLevelEnum.OFF);
        chai.expect(parseLogLevel(100)).to.eq(LogLevelEnum.FATAL);
        chai.expect(parseLogLevel(200)).to.eq(LogLevelEnum.ERROR);
        chai.expect(parseLogLevel(300)).to.eq(LogLevelEnum.WARN);
        chai.expect(parseLogLevel(400)).to.eq(LogLevelEnum.INFO);
        chai.expect(parseLogLevel(500)).to.eq(LogLevelEnum.DEBUG);
        chai.expect(parseLogLevel(600)).to.eq(LogLevelEnum.TRACE);
    })
})

describe("Log", () => {
    var log = new Log(new CustomWriteLog());
    var logException = new Log(new CustomWriteLogException());

    it("should write log on call", () => {
        var now = new Date();

        log.write(LogLevelEnum.INFO, "method1", "test1", "message1");
        chai.expect(lastLog.level).to.eq(LogLevelEnum.INFO);
        chai.expect(lastLog.date.getFullYear()).to.eq(now.getFullYear());
        chai.expect(lastLog.code).to.eq("test1");
        chai.expect(lastLog.message).to.eq("message1");
        chai.expect(lastLog.method).to.eq("method1");

        log.write(LogLevelEnum.INFO, "method2", "test2", "message2");
        chai.expect(lastLog.level).to.eq(LogLevelEnum.INFO);
        chai.expect(lastLog.date.getFullYear()).to.eq(now.getFullYear());
        chai.expect(lastLog.code).to.eq("test2");
        chai.expect(lastLog.message).to.eq("message2");
        chai.expect(lastLog.method).to.eq("method2");

        log.write(LogLevelEnum.DEBUG, "method_debug", "test debug", "message debug not write");
        chai.expect(lastLog.level).to.eq(LogLevelEnum.INFO); //not write DEBUG > INFO

        log.write(LogLevelEnum.TRACE, "method_trace", "test trace", "message trace not write");
        chai.expect(lastLog.level).to.eq(LogLevelEnum.INFO); //not write TRACE > INFO

        //LogLevelEnum.DEBUG
        log.changeCurrentLevel(LogLevelEnum.DEBUG);

        log.write(LogLevelEnum.DEBUG, "method3", "test3", "message3");
        chai.expect(lastLog.level).to.eq(LogLevelEnum.DEBUG);
        chai.expect(lastLog.date.getFullYear()).to.eq(now.getFullYear());
        chai.expect(lastLog.code).to.eq("test3");
        chai.expect(lastLog.message).to.eq("message3");
        chai.expect(lastLog.method).to.eq("method3");

        log.write(LogLevelEnum.TRACE, "method_trace", "test trace", "message trace not write");
        chai.expect(lastLog.level).to.eq(LogLevelEnum.DEBUG); //not write TRACE > DEBUG

        //LogLevelEnum.TRACE
        log.changeCurrentLevel(LogLevelEnum.TRACE);

        log.write(LogLevelEnum.TRACE, "method4", "test4", "message4");
        chai.expect(lastLog.level).to.eq(LogLevelEnum.TRACE);
        chai.expect(lastLog.date.getFullYear()).to.eq(now.getFullYear());
        chai.expect(lastLog.code).to.eq("test4");
        chai.expect(lastLog.message).to.eq("message4");
        chai.expect(lastLog.method).to.eq("method4");

        log.write(LogLevelEnum.WARN, "method5", "test5", "message5");
        chai.expect(lastLog.level).to.eq(LogLevelEnum.WARN);
        chai.expect(lastLog.date.getFullYear()).to.eq(now.getFullYear());
        chai.expect(lastLog.code).to.eq("test5");
        chai.expect(lastLog.message).to.eq("message5");
        chai.expect(lastLog.method).to.eq("method5");

        log.write(LogLevelEnum.ERROR, "method6", "test6", "message6");
        chai.expect(lastLog.level).to.eq(LogLevelEnum.ERROR);
        chai.expect(lastLog.date.getFullYear()).to.eq(now.getFullYear());
        chai.expect(lastLog.code).to.eq("test6");
        chai.expect(lastLog.message).to.eq("message6");
        chai.expect(lastLog.method).to.eq("method6");

        log.write(LogLevelEnum.FATAL, "method7", "test7", "message7");
        chai.expect(lastLog.level).to.eq(LogLevelEnum.FATAL);
        chai.expect(lastLog.date.getFullYear()).to.eq(now.getFullYear());
        chai.expect(lastLog.code).to.eq("test7");
        chai.expect(lastLog.message).to.eq("message7");
        chai.expect(lastLog.method).to.eq("method7");

        //LogLevelEnum.OFF
        log.changeCurrentLevel(LogLevelEnum.OFF);

        log.write(LogLevelEnum.INFO, "method_info", "test info", "message info not write");
        chai.expect(lastLog.level).to.eq(LogLevelEnum.FATAL); //not write OFF

        log.writeError("method_error", new Error("message_error"), {message:"message_error"});
        chai.expect(lastLog.level).to.eq(LogLevelEnum.FATAL); //not write OFF

        //LogLevelEnum.INFO
        log.changeCurrentLevel(LogLevelEnum.INFO);

        log.writeError("method8", new Error("message8"), {message:"message8"}, "file8", null);
        chai.expect(lastLog.level).to.eq(LogLevelEnum.ERROR);
        chai.expect(lastLog.date.getFullYear()).to.eq(now.getFullYear());
        chai.expect(lastLog.code).to.eq("Error");
        chai.expect(lastLog.message).to.eq("message8");
        chai.expect(lastLog.method).to.eq("method8");
        chai.expect(lastLog.filename).to.eq("file8");

        log.write(LogLevelEnum.INFO, "method9", "test9", "message9", {message:"message9"}, "file9", {info:"info9"});
        chai.expect(lastLog.level).to.eq(LogLevelEnum.INFO);
        chai.expect(lastLog.date.getFullYear()).to.eq(now.getFullYear());
        chai.expect(lastLog.code).to.eq("test9");
        chai.expect(lastLog.message).to.eq("message9");
        chai.expect(lastLog.method).to.eq("method9");
        chai.expect(lastLog.detail).to.not.null;
        if (lastLog.detail){
            chai.expect(lastLog.detail.message).to.eq("message9");
        }
        chai.expect(lastLog.filename).to.eq("file9");
        chai.expect(lastLog.invokeContext).to.not.null;
        if (lastLog.invokeContext){
            chai.expect(lastLog.invokeContext.data).to.not.null;
            if (lastLog.invokeContext.data){
                chai.expect(lastLog.invokeContext.data.info).to.eq("info9");
            }
        }

        //force exception
        var originalConsoleError = console.error;
        console.error = function(message?: any, ...optionalParams: any[]){
            lastLogException = message;
        };
        
        chai.expect(logException.writeError("method10", new Error("message10"), {message:"message10"}, "file10", null)).to.not.throw;
        chai.expect(lastLogException.message).to.eq("Exception test");

        chai.expect(logException.write(LogLevelEnum.INFO, "method11", "test11", "message11")).to.not.throw;
        chai.expect(lastLogException.message).to.eq("Exception test");

        //disable console capture error
        console.error = originalConsoleError;

        //LogLevelEnum.TRACE
        log.changeCurrentLevel(LogLevelEnum.TRACE);

        log.write(LogLevelEnum.TRACE, "method12", "test12", "message12");
        chai.expect(lastLog.level).to.eq(LogLevelEnum.TRACE);
        chai.expect(lastLog.date.getFullYear()).to.eq(now.getFullYear());
        chai.expect(lastLog.code).to.eq("test12");
        chai.expect(lastLog.message).to.eq("message12");
        chai.expect(lastLog.method).to.eq("method12");
    })
});

describe("Log - Default", () => {
    var log = new Log();
    log.changeCurrentLevel(LogLevelEnum.INFO);
    
    it("INFO", () => {
        log.write(LogLevelEnum.INFO, "method1", "test1", "message1");
        log.write(LogLevelEnum.INFO, "method1", "test1", "message1", {});
    })

    it("DEBUG", () => {
        log.write(LogLevelEnum.DEBUG, "method1", "test1", "message1");
        log.write(LogLevelEnum.DEBUG, "method1", "test1", "message1", {});
    })
});