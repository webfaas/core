import * as chai from "chai";
import * as mocha from "mocha";
import { IModuleNameData, ModuleNameUtil } from "../lib/Util/ModuleNameUtil";

describe("ModuleName", () => {
    var moduleNameResponse: IModuleNameData;

    it("should return response on call", () => {
        moduleNameResponse = ModuleNameUtil.parse("@my-company/module/v4", "file1.js");
        chai.expect(moduleNameResponse.fullName).to.eq("@my-company/module/v4/file1.js");
        chai.expect(moduleNameResponse.scopeName).to.eq("my-company");
        chai.expect(moduleNameResponse.moduleName).to.eq("@my-company/module");
        chai.expect(moduleNameResponse.moduleNameWhitOutScopeName).to.eq("module");
        chai.expect(moduleNameResponse.fileName).to.eq("v4/file1.js");

        moduleNameResponse = ModuleNameUtil.parse("@my-company/module", "file1.js");
        chai.expect(moduleNameResponse.fullName).to.eq("@my-company/module/file1.js");
        chai.expect(moduleNameResponse.scopeName).to.eq("my-company");
        chai.expect(moduleNameResponse.moduleName).to.eq("@my-company/module");
        chai.expect(moduleNameResponse.moduleNameWhitOutScopeName).to.eq("module");
        chai.expect(moduleNameResponse.fileName).to.eq("file1.js");

        moduleNameResponse = ModuleNameUtil.parse("module/v4", "file1.js");
        chai.expect(moduleNameResponse.fullName).to.eq("module/v4/file1.js");
        chai.expect(moduleNameResponse.scopeName).to.eq("default");
        chai.expect(moduleNameResponse.moduleName).to.eq("module");
        chai.expect(moduleNameResponse.moduleNameWhitOutScopeName).to.eq("module");
        chai.expect(moduleNameResponse.fileName).to.eq("v4/file1.js");

        moduleNameResponse = ModuleNameUtil.parse("module1", "file1.js");
        chai.expect(moduleNameResponse.fullName).to.eq("module1/file1.js");
        chai.expect(moduleNameResponse.scopeName).to.eq("default");
        chai.expect(moduleNameResponse.moduleName).to.eq("module1");
        chai.expect(moduleNameResponse.moduleNameWhitOutScopeName).to.eq("module1");
        chai.expect(moduleNameResponse.fileName).to.eq("file1.js");

        moduleNameResponse = ModuleNameUtil.parse("module1/file1", "");
        chai.expect(moduleNameResponse.fullName).to.eq("module1/file1");
        chai.expect(moduleNameResponse.scopeName).to.eq("default");
        chai.expect(moduleNameResponse.moduleName).to.eq("module1");
        chai.expect(moduleNameResponse.moduleNameWhitOutScopeName).to.eq("module1");
        chai.expect(moduleNameResponse.fileName).to.eq("file1");

        moduleNameResponse = ModuleNameUtil.parse("@my-company/module1/file1", "");
        chai.expect(moduleNameResponse.fullName).to.eq("@my-company/module1/file1");
        chai.expect(moduleNameResponse.scopeName).to.eq("my-company");
        chai.expect(moduleNameResponse.moduleName).to.eq("@my-company/module1");
        chai.expect(moduleNameResponse.moduleNameWhitOutScopeName).to.eq("module1");
        chai.expect(moduleNameResponse.fileName).to.eq("file1");
    })
})