import * as chai from "chai";
import * as mocha from "mocha";

import { SmallManifest } from "../lib/Manifest/SmallManifest";

describe("SmallManifest", () => {
    it("should return property", function(){
        var listVersion = ["version1", "version2"];
        var smallManifest = new SmallManifest("name1", listVersion);
        chai.expect(smallManifest.name).to.eq("name1");
        chai.expect(smallManifest.versionsArray).to.eq(listVersion);
        //chai.expect(smallManifest.versionsArray).to.be.an.instanceOf(Array);
    })
})