import * as chai from "chai";
import * as mocha from "mocha";

import { ModuleManagerCacheObjectItem } from "../lib/ModuleManager/ModuleManagerCacheObjectItem";
import { IManifest } from "../lib/Core";

describe("ModuleManagerCacheObjectItem", () => {
    it("should return property on call", function(done){
        var moduleManagerCacheObjectItem = new ModuleManagerCacheObjectItem("name1", "version1");
        chai.expect(moduleManagerCacheObjectItem.getName()).to.eq("name1");
        chai.expect(moduleManagerCacheObjectItem.getVersion()).to.eq("version1");
        chai.expect(moduleManagerCacheObjectItem.getCreateAccess()).to.gt(0);
        chai.expect(moduleManagerCacheObjectItem.getLastAccess()).to.gt(0);
        chai.expect(moduleManagerCacheObjectItem.getHitCount()).to.eq(0);

        done();
    })

    it("should return object in cache", function(done){
        var moduleManagerCacheObjectItem = new ModuleManagerCacheObjectItem("name1", "version1");
        let newObj1 = {};
        chai.expect(moduleManagerCacheObjectItem.getObjectFromCache("notexist")).to.null;
        moduleManagerCacheObjectItem.setObjectToCache("key1", newObj1);
        chai.expect(moduleManagerCacheObjectItem.getObjectFromCache("key1")).to.eq(newObj1);
        moduleManagerCacheObjectItem.removeObjectFromCache("key1");
        chai.expect(moduleManagerCacheObjectItem.getObjectFromCache("key1")).to.null;
        chai.expect(moduleManagerCacheObjectItem.getHitCount()).to.eq(3);

        chai.expect(moduleManagerCacheObjectItem.getObjectFromCache()).to.null;
        chai.expect(moduleManagerCacheObjectItem.getHitCount()).to.eq(4);

        let manifest1 = {} as IManifest;
        manifest1.name = "name1";
        moduleManagerCacheObjectItem.setManifest(manifest1);
        chai.expect(moduleManagerCacheObjectItem.getManifest()?.name).to.eq("name1");
        chai.expect(moduleManagerCacheObjectItem.getHitCount()).to.eq(4);

        done();
    })
})