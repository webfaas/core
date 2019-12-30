import * as chai from "chai";
import * as mocha from "mocha";

import { ModuleManagerRequireContextData } from "../lib/ModuleManager/ModuleManagerRequireContextData";

describe("ModuleManagerRequireContextData", () => {
    it("should return property on call - default", function(done){
        var moduleManagerRequireContextData = new ModuleManagerRequireContextData("key1");
        chai.expect(moduleManagerRequireContextData.rootPackageStoreKey).to.eq("key1");
        chai.expect(moduleManagerRequireContextData.parentPackageStoreName).to.eq("");
        chai.expect(moduleManagerRequireContextData.parentPackageStoreVersion).to.eq("");

        done();
    })

    it("should return property on call - all", function(done){
        var moduleManagerRequireContextData = new ModuleManagerRequireContextData("key1", "name1", "version1");
        chai.expect(moduleManagerRequireContextData.rootPackageStoreKey).to.eq("key1");
        chai.expect(moduleManagerRequireContextData.parentPackageStoreName).to.eq("name1");
        chai.expect(moduleManagerRequireContextData.parentPackageStoreVersion).to.eq("version1");

        done();
    })
})