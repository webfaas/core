import * as path from "path";
import * as chai from "chai";
import * as mocha from "mocha";
import { Core } from "../lib/Core";
import { ModuleManager } from "../lib/ModuleManager/ModuleManager";
import { exec } from "child_process";

describe("Core", () => {
    it("constructor - default", function(){
        var core = new Core();
        chai.expect(typeof core.getModuleManager()).to.eq("object");
    })

    it("start", async function(){
        var core = new Core();
        await core.start();
        chai.expect(typeof(core.getModuleManager())).to.eq("object");
    })

    it("stop", async function(){
        var core = new Core();
        await core.stop();
        chai.expect(typeof(core.getModuleManager())).to.eq("object");
    })
})