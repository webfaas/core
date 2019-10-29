import * as chai from "chai";
import * as mocha from "mocha";

import * as fs from "fs";
import * as path from "path";
import { PackageStore } from "../lib/PackageStore/PackageStore";
import { PackageStoreUtil } from "../lib/PackageStore/PackageStoreUtil";
import { IPackageStoreItemData } from "../lib/PackageStore/IPackageStoreItemData";
import { IManifest } from "../lib/Manifest/IManifest";

describe("PackageStore", () => {
    it("should return on call", function(){
        var packageStore: PackageStore;
        var itemData: IPackageStoreItemData;
        var buffer1: Buffer = Buffer.from('AAABBBCCC{"name":"name1"}');
        var dataPackageItemDataMap: Map<string, IPackageStoreItemData> = new Map<string, IPackageStoreItemData>();
        
        itemData = PackageStoreUtil.buildItemData("file1", 0, 3);
        dataPackageItemDataMap.set(itemData.name, itemData);

        itemData = PackageStoreUtil.buildItemData("file2", 3, 3);
        dataPackageItemDataMap.set(itemData.name, itemData);

        itemData = PackageStoreUtil.buildItemData("file3", 6, 3);
        dataPackageItemDataMap.set(itemData.name, itemData);

        itemData = PackageStoreUtil.buildItemData("package.json", 9, 16);
        dataPackageItemDataMap.set(itemData.name, itemData);

        packageStore = new PackageStore("package1", "version1", "etag1", buffer1, dataPackageItemDataMap);

        chai.expect(packageStore.getName()).to.eq("package1");
        chai.expect(packageStore.getVersion()).to.eq("version1");
        chai.expect(packageStore.getKey()).to.eq("package1:version1");
        chai.expect(packageStore.getEtag()).to.eq("etag1");
        chai.expect(packageStore.getSize()).to.eq(buffer1.length);
        chai.expect(packageStore.getLength()).to.eq(dataPackageItemDataMap.size);
        chai.expect(packageStore.getLastAccess() > 0).to.eq(true);
        chai.expect(packageStore.getPackageBuffer()).to.be.an.instanceof(Buffer);
        chai.expect(packageStore.getDataPackageItemDataMap()).to.be.an.instanceof(Object);
        chai.expect(packageStore.getItemBuffer("notfound***")).to.be.null;

        var bufferFile1 = packageStore.getItemBuffer("file1");
        chai.expect(bufferFile1).to.be.an.instanceof(Object);
        if (bufferFile1){
            chai.expect(bufferFile1.toString()).to.eq("AAA");
        }

        var bufferFile2 = packageStore.getItemBuffer("file2");
        chai.expect(bufferFile2).to.be.an.instanceof(Object);
        if (bufferFile2){
            chai.expect(bufferFile2.toString()).to.eq("BBB");
        }

        var bufferFile3 = packageStore.getItemBuffer("file3");
        chai.expect(bufferFile3).to.be.an.instanceof(Object);
        if (bufferFile3){
            chai.expect(bufferFile3.toString()).to.eq("CCC");
        }

        var manifest1: IManifest | null = packageStore.getManifest();
        chai.expect(manifest1).to.be.an.instanceof(Object);
        if (manifest1){
            chai.expect(manifest1.name).to.eq("name1");
        }
        
        var manifest2: IManifest | null = packageStore.getManifest(); //from cache
        chai.expect(manifest2).to.be.an.instanceof(Object);
        if (manifest2){
            chai.expect(manifest2.name).to.eq("name1");
        }
    })

    it("should return on call", function(){
        var packageStore: PackageStore;
        var itemData: IPackageStoreItemData;
        var buffer1: Buffer = Buffer.from('AAAAAABBB');
        var dataPackageItemDataMap: Map<string, IPackageStoreItemData> = new Map<string, IPackageStoreItemData>();
        
        itemData = PackageStoreUtil.buildItemData("file1", 0, 6);
        dataPackageItemDataMap.set(itemData.name, itemData);

        itemData = PackageStoreUtil.buildItemData("file2", 6, 3);
        dataPackageItemDataMap.set(itemData.name, itemData);

        packageStore = new PackageStore("package2", "version2", "etag2", buffer1, dataPackageItemDataMap);

        chai.expect(packageStore.getName()).to.eq("package2");
        chai.expect(packageStore.getVersion()).to.eq("version2");
        chai.expect(packageStore.getKey()).to.eq("package2:version2");
        chai.expect(packageStore.getEtag()).to.eq("etag2");
        chai.expect(packageStore.getSize()).to.eq(buffer1.length);
        chai.expect(packageStore.getLength()).to.eq(dataPackageItemDataMap.size);
        chai.expect(packageStore.getLastAccess() > 0).to.eq(true);
        chai.expect(packageStore.getPackageBuffer()).to.be.an.instanceof(Buffer);
        chai.expect(packageStore.getDataPackageItemDataMap()).to.be.an.instanceof(Object);
        chai.expect(packageStore.getItemBuffer("notfound***")).to.be.null;

        var bufferFile1 = packageStore.getItemBuffer("file1");
        chai.expect(bufferFile1).to.be.an.instanceof(Object);
        if (bufferFile1){
            chai.expect(bufferFile1.toString()).to.eq("AAAAAA");
        }

        var bufferFile2 = packageStore.getItemBuffer("file2");
        chai.expect(bufferFile2).to.be.an.instanceof(Object);
        if (bufferFile2){
            chai.expect(bufferFile2.toString()).to.eq("BBB");
        }

        var manifest1: IManifest | null = packageStore.getManifest();
        chai.expect(manifest1).to.be.null;

        chai.expect(packageStore.getSize()).to.eq(9);
        packageStore.removeItemData("file1");
        chai.expect(packageStore.getSize()).to.eq(3);
        chai.expect(packageStore.getLength()).to.eq(1);
        chai.expect(packageStore.getItemBuffer("file1")).to.be.null;

        packageStore.removeItemData("file2");
        chai.expect(packageStore.getSize()).to.eq(0);
        chai.expect(packageStore.getLength()).to.eq(0);
        chai.expect(packageStore.getItemBuffer("file2")).to.be.null;
    })
})