import * as chai from "chai";
import * as mocha from "mocha";

import { PackageRegistryManagerItem } from "../lib/PackageRegistryManager/PackageRegistryManagerItem";
import { PackageRegistryMock } from "./mocks/PackageRegistryMock";
import { IPackageRegistry } from "../lib/PackageRegistry/IPackageRegistry";

describe("Package Registry Manager Item", () => {
    var packageRegistry: IPackageRegistry = new PackageRegistryMock.PackageRegistry1()

    it("should return object on call - default", function(){
        var packageRegistryManagerItem_1 = new PackageRegistryManagerItem("name1", "slave1", packageRegistry);
        chai.expect(packageRegistryManagerItem_1).to.be.an.instanceof(Object);
        chai.expect(packageRegistryManagerItem_1.name).to.eq("name1");
        chai.expect(packageRegistryManagerItem_1.slaveName).to.eq("slave1");
    })
})