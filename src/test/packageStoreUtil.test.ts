import * as chai from "chai";
import * as mocha from "mocha";

import * as fs from "fs";
import * as path from "path";
import { PackageStoreUtil } from "../lib/PackageStore/PackageStoreUtil";
import { IPackageStoreItemData } from "../lib/PackageStore/IPackageStoreItemData";
import { IManifest } from "../lib/Manifest/IManifest";

describe("PackageStoreUtil", () => {
    it("should return on call", function(){
        var itemData: IPackageStoreItemData;
        
        var bufferFile = fs.readFileSync(path.join(__dirname, "data/data-package/semver/semver-5.6.0.tgz"));
        var dataPackageItemDataMap: Map<string, IPackageStoreItemData> = PackageStoreUtil.converBufferTarGZFormatToMapPackageItemDataMap(bufferFile);
        chai.expect(dataPackageItemDataMap).to.be.an.instanceof(Object);
        if (dataPackageItemDataMap){
            var item: IPackageStoreItemData | undefined = dataPackageItemDataMap.get("package.json");
            chai.expect(item).to.be.an.instanceof(Object);
            if (item){
                chai.expect(item.name).to.eq("package.json");
            }
        }
    })
})