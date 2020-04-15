import * as chai from "chai";

import { ModuleCompileJavaScript } from "../lib/ModuleCompile/ModuleCompileJavaScript";
import { Log } from "../lib/Log/Log";
import { LogLevelEnum } from "../lib/Log/ILog";
import { ModuleCompileManifestData } from "../lib/ModuleCompile/ModuleCompileManifestData";
import { PackageStoreItemBufferResponse } from "../lib/PackageStore/PackageStoreItemBufferResponse";
import { ModuleManagerRequireContextData } from "../lib/ModuleManager/ModuleManagerRequireContextData";
import { ModuleManagerCompile } from "../lib/ModuleManager/ModuleManagerCompile";
import { ModuleManager } from "../lib/Core";

var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

var moduleCompile = new ModuleCompileJavaScript(log);
var moduleCompile_default = new ModuleCompileJavaScript();

describe("ModuleManagerCompile", () => {
    it("compilePackageStoreItemBufferSync - json", () => {
        let moduleManagerCompile = new ModuleManagerCompile(new ModuleManager(), log);

        let packageStoreItemBufferResponse = new PackageStoreItemBufferResponse("file1.json", ".json", Buffer.from(JSON.stringify({message:"message1"})));
        let moduleManagerRequireContextData = new ModuleManagerRequireContextData("");
        let moduleCompileManifestData = new ModuleCompileManifestData("name1", "version1", "file1.json");

        let responseObj:any = moduleManagerCompile.compilePackageStoreItemBufferSync(packageStoreItemBufferResponse, moduleManagerRequireContextData, moduleCompileManifestData)
        
        chai.expect(responseObj).to.not.null;
        if (responseObj){
            chai.expect(responseObj.message).to.eq("message1");
        }
    })
})