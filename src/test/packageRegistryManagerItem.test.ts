import * as chai from "chai";
import * as mocha from "mocha";

import { PackageRegistryDiskTarball } from "../lib/PackageRegistry/Registries/DiskTarball/PackageRegistryDiskTarball";
import { PackageRegistryManagerItem } from "../lib/PackageRegistryManager/PackageRegistryManagerItem";

describe("Package Registry Manager Item", () => {
    var packageRegistryDiskTarball_1: PackageRegistryDiskTarball;

    it("should return object on call - default", function(){
        var packageRegistryManagerItem_1 = new PackageRegistryManagerItem("name1", "slave1", packageRegistryDiskTarball_1);
        chai.expect(packageRegistryManagerItem_1).to.be.an.instanceof(Object);
        chai.expect(packageRegistryManagerItem_1.name).to.eq("name1");
        chai.expect(packageRegistryManagerItem_1.slaveName).to.eq("slave1");
    })
})