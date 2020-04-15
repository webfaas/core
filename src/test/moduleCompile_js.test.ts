import * as chai from "chai";
import * as mocha from "mocha";

import { ModuleCompileJavaScript } from "../lib/ModuleCompile/ModuleCompileJavaScript";
import { SandBox } from "../lib/ModuleCompile/SandBox";
import { Context } from "vm";
import { Log } from "../lib/Log/Log";
import { LogLevelEnum } from "../lib/Log/ILog";
import { ModuleCompileManifestData } from "../lib/ModuleCompile/ModuleCompileManifestData";

var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

var moduleCompile = new ModuleCompileJavaScript(log);
var moduleCompile_default = new ModuleCompileJavaScript();

describe("ModuleCompileJavaScript", () => {
    it("should return response on call", () => {
        chai.expect(typeof moduleCompile.getLog()).to.eq("object");

        var manifest: ModuleCompileManifestData = new ModuleCompileManifestData("moduleTest1", "1.0.0", "/moduleTest1.js");
        
        var manifest2: ModuleCompileManifestData = new ModuleCompileManifestData("moduleTest2", "2.0.0", "/moduleTest2.js");
        
        var module1 = moduleCompile.compile("module.exports = function(){return 'value1'}", manifest);
        chai.expect(module1.exports()).to.eq("value1");

        var module2 = moduleCompile.compile("module.exports = function(){return 'value2'}", manifest2);
        chai.expect(module2.exports()).to.eq("value2");

        var sandBoxContext: Context = SandBox.SandBoxBuilderContext();
        var module3 = moduleCompile.compile("module.exports = function(){return 'value3'}", manifest, sandBoxContext);
        chai.expect(module3.exports()).to.eq("value3");

        try {
            moduleCompile.compile("force error", manifest);

            throw new Error("should force error");
        }
        catch (errorTry) {
            chai.expect(errorTry.message).to.eq("Unexpected identifier");
        }

        var module4 = moduleCompile.compile("module.exports = function(){var url = require('url'); return url.parse('value4')}", manifest);
        chai.expect(module4.exports().path).to.eq("value4");

        var module5 = moduleCompile.compile("module.exports = function(){return process.cwd()}", manifest);
        chai.expect(module5.exports()).to.eq(process.cwd());

        var module6 = moduleCompile.compile("module.exports = function(){var process = require('process'); return process.cwd()}", manifest);
        chai.expect(module6.exports()).to.eq(process.cwd());
    })
})