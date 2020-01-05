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
        chai.expect(typeof core.getPluginManager()).to.eq("object");
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

    it("invokeAsync @webfaaslabs/mathsum version - 0.0.1", async function(){
        var core = new Core();
        await core.start();
        var response: any = await core.invokeAsync("@webfaaslabs/mathsum", "0.0.1", "", [2,3]);

        chai.expect(response).to.eq(5);
    })
})