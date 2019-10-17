import * as chai from "chai";
import * as mocha from "mocha";

import { PackageRegistryDiskTarball } from "../lib/PackageRegistry/Registries/DiskTarball/PackageRegistryDiskTarball";
import { PackageRegistryManagerItemStatusEnum, PackageRegistryManagerItem, PackageRegistryManagerItemError } from "../lib/PackageRegistryManager/PackageRegistryManagerItem";

describe("Package Registry Manager Item", () => {
    var packageRegistryDiskTarball_1: PackageRegistryDiskTarball;

    it("should return object on call - default", function(){
        var packageRegistryManagerItem_1 = new PackageRegistryManagerItem("name1", packageRegistryDiskTarball_1);
        chai.expect(packageRegistryManagerItem_1).to.be.an.instanceof(Object);
        chai.expect(packageRegistryManagerItem_1.name).to.eq("name1");
        chai.expect(packageRegistryManagerItem_1.enableCache).to.eq(false);
        chai.expect(packageRegistryManagerItem_1.error).to.eq(null);
        chai.expect(packageRegistryManagerItem_1.status).to.eq(PackageRegistryManagerItemStatusEnum.ENABLED);
        chai.expect(packageRegistryManagerItem_1.enableSeekNextRegistryWhenPackageStoreNotFound).to.eq(false);
    })

    it("should return object on call - complete", function(){
        var packageRegistryManagerItem_1 = new PackageRegistryManagerItem("name1", packageRegistryDiskTarball_1, true, true);
        chai.expect(packageRegistryManagerItem_1).to.be.an.instanceof(Object);
        chai.expect(packageRegistryManagerItem_1.name).to.eq("name1");
        chai.expect(packageRegistryManagerItem_1.enableCache).to.eq(true);
        chai.expect(packageRegistryManagerItem_1.error).to.eq(null);
        chai.expect(packageRegistryManagerItem_1.status).to.eq(PackageRegistryManagerItemStatusEnum.ENABLED);
        chai.expect(packageRegistryManagerItem_1.enableSeekNextRegistryWhenPackageStoreNotFound).to.eq(true);
    })
})

describe("Package Registry Manager Item Error", () => {
    it("should return object on call - default", function(){
        var packageRegistryManagerItemError_1 = new PackageRegistryManagerItemError(new Error("error1"));
        chai.expect(packageRegistryManagerItemError_1).to.be.an.instanceof(Object);
        chai.expect(packageRegistryManagerItemError_1.lastError.message).to.eq("error1");
        chai.expect(packageRegistryManagerItemError_1.lastDate).to.be.an.instanceof(Object);
    })

    it("should return object on call - complete", function(){
        var packageRegistryManagerItemError_1 = new PackageRegistryManagerItemError(new Error("error1"), new Date());
        chai.expect(packageRegistryManagerItemError_1).to.be.an.instanceof(Object);
        chai.expect(packageRegistryManagerItemError_1.lastError.message).to.eq("error1");
        chai.expect(packageRegistryManagerItemError_1.lastDate).to.be.an.instanceof(Object);
    })
})