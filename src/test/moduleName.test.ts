import * as chai from "chai";
import * as mocha from "mocha";

import {ModuleName} from "../lib/ModuleName/ModuleName";
import { IModuleNameData } from "../lib/ModuleName/IModuleName";

var moduleName = ModuleName.getInstance();

describe("ModuleName", () => {
    var moduleNameResponse: IModuleNameData;

    it("should return response on call", () => {
        moduleNameResponse = moduleName.parse("@my-company/module/v4", "file1.js");
        chai.expect(moduleNameResponse.moduleName).to.eq("@my-company/module");
        chai.expect(moduleNameResponse.fileName).to.eq("v4/file1.js");

        moduleNameResponse = moduleName.parse("@my-company/module", "file1.js");
        chai.expect(moduleNameResponse.moduleName).to.eq("@my-company/module");
        chai.expect(moduleNameResponse.fileName).to.eq("file1.js");

        moduleNameResponse = moduleName.parse("module/v4", "file1.js");
        chai.expect(moduleNameResponse.moduleName).to.eq("module");
        chai.expect(moduleNameResponse.fileName).to.eq("v4/file1.js");

        moduleNameResponse = moduleName.parse("module1", "file1.js");
        chai.expect(moduleNameResponse.moduleName).to.eq("module1");
        chai.expect(moduleNameResponse.fileName).to.eq("file1.js");

        moduleNameResponse = moduleName.parse("module1/file1", "");
        chai.expect(moduleNameResponse.moduleName).to.eq("module1");
        chai.expect(moduleNameResponse.fileName).to.eq("file1");

        moduleNameResponse = moduleName.parse("@my-company/module1/file1", "");
        chai.expect(moduleNameResponse.moduleName).to.eq("@my-company/module1");
        chai.expect(moduleNameResponse.fileName).to.eq("file1");
    })
})