import * as chai from "chai";
import * as fs from "fs";
import * as path from "path";

import { Log } from "../lib/Log/Log";
import { LogLevelEnum } from "../lib/Log/ILog";
import { ModuleCompileManifestData } from "../lib/ModuleCompile/ModuleCompileManifestData";
import { ModuleCompileWasm } from "../lib/ModuleCompile/ModuleCompileWasm";

var log = new Log();
var logThrowError = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

var moduleCompile = new ModuleCompileWasm(log);
var moduleCompile_default = new ModuleCompileWasm();
var moduleCompile_throwError = new ModuleCompileWasm(logThrowError);

logThrowError.write = function(level:LogLevelEnum, method:string, code:string, message:string, detail?:any, filename?:string, invokeContext?:any){
    console.log("mock => ", method, code, message);
    if (method === "compile" && code === "COMPILE" && message === "compiled"){
        throw new Error("Error in compile");
    }
}

describe("ModuleCompileWasm", () => {
    it("should return response on call", async () => {
        chai.expect(typeof moduleCompile.getLog()).to.eq("object");

        var manifest: ModuleCompileManifestData = new ModuleCompileManifestData("moduleTest1", "1.0.0", "/moduleTest1.js");
        
        var manifest2: ModuleCompileManifestData = new ModuleCompileManifestData("moduleTest2", "2.0.0", "/moduleTest2.js");

        let moduleBuffer = fs.readFileSync(path.join(__dirname, "mocks/wasm/sum.wasm"));
        
        var module1 = await moduleCompile.compile(moduleBuffer, manifest);
        chai.expect(module1.exports.sum(2,3)).to.eq(5);

        try {
            var module2 = await moduleCompile.compile(Buffer.from("AAAA"), manifest);
            throw new Error("Sucess");
        }
        catch (errTry) {
            chai.expect(errTry.message.indexOf("compile")).to.gt(-1);
        }

        try {
            var module3 = await moduleCompile_throwError.compile(moduleBuffer, manifest);
            throw new Error("Sucess");
        }
        catch (errTry) {
            chai.expect(errTry.message).to.eq("Error in compile");
        }
    })
})