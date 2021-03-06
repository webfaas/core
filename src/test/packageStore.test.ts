import * as chai from "chai";
import * as mocha from "mocha";

import * as fs from "fs";
import * as path from "path";
import { PackageStore } from "../lib/PackageStore/PackageStore";
import { PackageStoreUtil } from "../lib/Util/PackageStoreUtil";
import { IPackageStoreItemData } from "../lib/PackageStore/IPackageStoreItemData";
import { IManifest } from "../lib/Manifest/IManifest";

describe("PackageStore", () => {
    it("should return on call - not containing package.json", function(){
        var packageStore: PackageStore;
        var itemData: IPackageStoreItemData;
        var buffer1: Buffer = Buffer.from('AAAAAABBB');
        var dataPackageItemDataMap: Map<string, IPackageStoreItemData> = new Map<string, IPackageStoreItemData>();
        
        itemData = PackageStoreUtil.buildItemData("file1.js", 0, 6);
        dataPackageItemDataMap.set(itemData.name, itemData);

        itemData = PackageStoreUtil.buildItemData("file2.js", 6, 3);
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
            chai.expect(bufferFile1.buffer.toString()).to.eq("AAAAAA");
        }

        var bufferFile2 = packageStore.getItemBuffer("file2");
        chai.expect(bufferFile2).to.be.an.instanceof(Object);
        if (bufferFile2){
            chai.expect(bufferFile2.buffer.toString()).to.eq("BBB");
        }

        var manifest1: IManifest | null = packageStore.getManifest();
        chai.expect(manifest1).to.be.null;

        chai.expect(packageStore.getSize()).to.eq(9);
        packageStore.removeItemData("file1.js");
        chai.expect(packageStore.getSize()).to.eq(3);
        chai.expect(packageStore.getLength()).to.eq(1);
        chai.expect(packageStore.getItemBuffer("file1")).to.be.null;

        packageStore.removeItemData("file2.js");
        chai.expect(packageStore.getSize()).to.eq(0);
        chai.expect(packageStore.getLength()).to.eq(0);
        chai.expect(packageStore.getItemBuffer("file2")).to.be.null;

        var bufferFile4 = packageStore.getMainBuffer();
        chai.expect(bufferFile4).to.be.null;
    })

    it("should return on call - containing package.json - main: file1.js", function(){
        var packageStore: PackageStore;
        var itemData: IPackageStoreItemData;
        var buffer1: Buffer = Buffer.from('AAABBBCCC{"name":"name1", "version":"1.0.0", "main":"file1.js"}');
        var dataPackageItemDataMap: Map<string, IPackageStoreItemData> = new Map<string, IPackageStoreItemData>();
        
        itemData = PackageStoreUtil.buildItemData("file1.js", 0, 3);
        dataPackageItemDataMap.set(itemData.name, itemData);

        itemData = PackageStoreUtil.buildItemData("file2.js", 3, 3);
        dataPackageItemDataMap.set(itemData.name, itemData);

        itemData = PackageStoreUtil.buildItemData("file3.js", 6, 3);
        dataPackageItemDataMap.set(itemData.name, itemData);

        itemData = PackageStoreUtil.buildItemData("package.json", 9, 62);
        dataPackageItemDataMap.set(itemData.name, itemData);

        packageStore = new PackageStore("package1", "version1", "etag1", buffer1, dataPackageItemDataMap);

        chai.expect(packageStore.getName()).to.eq("package1");
        chai.expect(packageStore.getVersion()).to.eq("version1");
        chai.expect(packageStore.getKey()).to.eq("package1:version1");
        chai.expect(packageStore.getEtag()).to.eq("etag1");
        chai.expect(packageStore.getMainFileFullPath()).to.eq("file1.js");
        chai.expect(packageStore.getSize()).to.eq(buffer1.length);
        chai.expect(packageStore.getLength()).to.eq(dataPackageItemDataMap.size);
        chai.expect(packageStore.getLastAccess() > 0).to.eq(true);
        chai.expect(packageStore.getPackageBuffer()).to.be.an.instanceof(Buffer);
        chai.expect(packageStore.getDataPackageItemDataMap()).to.be.an.instanceof(Object);
        chai.expect(packageStore.getItemBuffer("notfound***")).to.be.null;

        var bufferFile1 = packageStore.getItemBuffer("file1");
        chai.expect(bufferFile1).to.be.an.instanceof(Object);
        if (bufferFile1){
            chai.expect(bufferFile1.buffer.toString()).to.eq("AAA");
        }

        var bufferFile2 = packageStore.getItemBuffer("file2");
        chai.expect(bufferFile2).to.be.an.instanceof(Object);
        if (bufferFile2){
            chai.expect(bufferFile2.buffer.toString()).to.eq("BBB");
        }

        var bufferFile3 = packageStore.getItemBuffer("file3");
        chai.expect(bufferFile3).to.be.an.instanceof(Object);
        if (bufferFile3){
            chai.expect(bufferFile3.buffer.toString()).to.eq("CCC");
        }

        var bufferFile4 = packageStore.getMainBuffer();
        chai.expect(bufferFile4).to.be.an.instanceof(Object);
        if (bufferFile4){
            chai.expect(bufferFile4.buffer.toString()).to.eq("AAA");
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
            chai.expect(manifest2.version).to.eq("1.0.0");
            chai.expect(manifest2.main).to.eq("file1.js");
        }
    })

    it("should return on call - containing package.json - main: ./file1.js", function(){
        var packageStore: PackageStore;
        var itemData: IPackageStoreItemData;
        var buffer1: Buffer = Buffer.from('AAABBBCCC{"name":"name1", "version":"1.0.0", "main":"./file1.js"}');
        var dataPackageItemDataMap: Map<string, IPackageStoreItemData> = new Map<string, IPackageStoreItemData>();
        
        itemData = PackageStoreUtil.buildItemData("file1.js", 0, 3);
        dataPackageItemDataMap.set(itemData.name, itemData);

        itemData = PackageStoreUtil.buildItemData("file2.js", 3, 3);
        dataPackageItemDataMap.set(itemData.name, itemData);

        itemData = PackageStoreUtil.buildItemData("file3.js", 6, 3);
        dataPackageItemDataMap.set(itemData.name, itemData);

        itemData = PackageStoreUtil.buildItemData("package.json", 9, 62);
        dataPackageItemDataMap.set(itemData.name, itemData);

        packageStore = new PackageStore("package1", "version1", "etag1", buffer1, dataPackageItemDataMap);

        chai.expect(packageStore.getName()).to.eq("package1");
        chai.expect(packageStore.getVersion()).to.eq("version1");
        chai.expect(packageStore.getKey()).to.eq("package1:version1");
        chai.expect(packageStore.getEtag()).to.eq("etag1");
        chai.expect(packageStore.getMainFileFullPath()).to.eq("file1.js");
        chai.expect(packageStore.getSize()).to.eq(buffer1.length);
        chai.expect(packageStore.getLength()).to.eq(dataPackageItemDataMap.size);
        chai.expect(packageStore.getLastAccess() > 0).to.eq(true);
        chai.expect(packageStore.getPackageBuffer()).to.be.an.instanceof(Buffer);
        chai.expect(packageStore.getDataPackageItemDataMap()).to.be.an.instanceof(Object);
        chai.expect(packageStore.getItemBuffer("notfound***")).to.be.null;

        var bufferFile1 = packageStore.getItemBuffer("file1");
        chai.expect(bufferFile1).to.be.an.instanceof(Object);
        if (bufferFile1){
            chai.expect(bufferFile1.buffer.toString()).to.eq("AAA");
        }

        var bufferFile2 = packageStore.getItemBuffer("file2");
        chai.expect(bufferFile2).to.be.an.instanceof(Object);
        if (bufferFile2){
            chai.expect(bufferFile2.buffer.toString()).to.eq("BBB");
        }

        var bufferFile3 = packageStore.getItemBuffer("file3");
        chai.expect(bufferFile3).to.be.an.instanceof(Object);
        if (bufferFile3){
            chai.expect(bufferFile3.buffer.toString()).to.eq("CCC");
        }

        var bufferFile4 = packageStore.getMainBuffer();
        chai.expect(bufferFile4).to.be.an.instanceof(Object);
        if (bufferFile4){
            chai.expect(bufferFile4.buffer.toString()).to.eq("AAA");
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
            chai.expect(manifest2.version).to.eq("1.0.0");
            chai.expect(manifest2.main).to.eq("file1.js");
        }
    })

    it("should return on call - containing package.json - main: folder1/index.js", function(){
        var packageStore: PackageStore;
        var itemData: IPackageStoreItemData;
        var buffer1: Buffer = Buffer.from('AAABBBCCC{"name":"name1", "version":"1.0.0", "main":"folder1"}');
        var dataPackageItemDataMap: Map<string, IPackageStoreItemData> = new Map<string, IPackageStoreItemData>();
        
        itemData = PackageStoreUtil.buildItemData("folder1/index.js", 0, 3);
        dataPackageItemDataMap.set(itemData.name, itemData);

        itemData = PackageStoreUtil.buildItemData("file2.js", 3, 3);
        dataPackageItemDataMap.set(itemData.name, itemData);

        itemData = PackageStoreUtil.buildItemData("file3.js", 6, 3);
        dataPackageItemDataMap.set(itemData.name, itemData);

        itemData = PackageStoreUtil.buildItemData("package.json", 9, 62);
        dataPackageItemDataMap.set(itemData.name, itemData);

        packageStore = new PackageStore("package1", "version1", "etag1", buffer1, dataPackageItemDataMap);

        chai.expect(packageStore.getName()).to.eq("package1");
        chai.expect(packageStore.getVersion()).to.eq("version1");
        chai.expect(packageStore.getKey()).to.eq("package1:version1");
        chai.expect(packageStore.getEtag()).to.eq("etag1");
        chai.expect(packageStore.getMainFileFullPath()).to.eq("folder1/index.js");
        chai.expect(packageStore.getSize()).to.eq(buffer1.length);
        chai.expect(packageStore.getLength()).to.eq(dataPackageItemDataMap.size);
        chai.expect(packageStore.getLastAccess() > 0).to.eq(true);
        chai.expect(packageStore.getPackageBuffer()).to.be.an.instanceof(Buffer);
        chai.expect(packageStore.getDataPackageItemDataMap()).to.be.an.instanceof(Object);
        chai.expect(packageStore.getItemBuffer("notfound***")).to.be.null;

        var bufferFile1 = packageStore.getItemBuffer("folder1");
        chai.expect(bufferFile1).to.be.an.instanceof(Object);
        if (bufferFile1){
            chai.expect(bufferFile1.buffer.toString()).to.eq("AAA");
        }

        var bufferFile2 = packageStore.getItemBuffer("file2");
        chai.expect(bufferFile2).to.be.an.instanceof(Object);
        if (bufferFile2){
            chai.expect(bufferFile2.buffer.toString()).to.eq("BBB");
        }

        var bufferFile3 = packageStore.getItemBuffer("file3");
        chai.expect(bufferFile3).to.be.an.instanceof(Object);
        if (bufferFile3){
            chai.expect(bufferFile3.buffer.toString()).to.eq("CCC");
        }

        var bufferFile4 = packageStore.getMainBuffer();
        chai.expect(bufferFile4).to.be.an.instanceof(Object);
        if (bufferFile4){
            chai.expect(bufferFile4.buffer.toString()).to.eq("AAA");
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
            chai.expect(manifest2.version).to.eq("1.0.0");
            chai.expect(manifest2.main).to.eq("folder1");
        }
    })

    it("should return on call - containing package.json - main: not main", function(){
        var packageStore: PackageStore;
        var itemData: IPackageStoreItemData;
        var buffer1: Buffer = Buffer.from('AAABBBCCC{"name":"name1", "version":"1.0.0", "main":""}');
        var dataPackageItemDataMap: Map<string, IPackageStoreItemData> = new Map<string, IPackageStoreItemData>();
        
        itemData = PackageStoreUtil.buildItemData("index.js", 0, 3);
        dataPackageItemDataMap.set(itemData.name, itemData);

        itemData = PackageStoreUtil.buildItemData("file2.js", 3, 3);
        dataPackageItemDataMap.set(itemData.name, itemData);

        itemData = PackageStoreUtil.buildItemData("file3.js", 6, 3);
        dataPackageItemDataMap.set(itemData.name, itemData);

        itemData = PackageStoreUtil.buildItemData("package.json", 9, 62);
        dataPackageItemDataMap.set(itemData.name, itemData);

        packageStore = new PackageStore("package1", "version1", "etag1", buffer1, dataPackageItemDataMap);

        chai.expect(packageStore.getName()).to.eq("package1");
        chai.expect(packageStore.getVersion()).to.eq("version1");
        chai.expect(packageStore.getKey()).to.eq("package1:version1");
        chai.expect(packageStore.getEtag()).to.eq("etag1");
        chai.expect(packageStore.getMainFileFullPath()).to.eq("index.js");
        chai.expect(packageStore.getSize()).to.eq(buffer1.length);
        chai.expect(packageStore.getLength()).to.eq(dataPackageItemDataMap.size);
        chai.expect(packageStore.getLastAccess() > 0).to.eq(true);
        chai.expect(packageStore.getPackageBuffer()).to.be.an.instanceof(Buffer);
        chai.expect(packageStore.getDataPackageItemDataMap()).to.be.an.instanceof(Object);
        chai.expect(packageStore.getItemBuffer("notfound***")).to.be.null;

        var bufferFile1 = packageStore.getItemBuffer("index");
        chai.expect(bufferFile1).to.be.an.instanceof(Object);
        if (bufferFile1){
            chai.expect(bufferFile1.buffer.toString()).to.eq("AAA");
        }

        var bufferFile2 = packageStore.getItemBuffer("file2");
        chai.expect(bufferFile2).to.be.an.instanceof(Object);
        if (bufferFile2){
            chai.expect(bufferFile2.buffer.toString()).to.eq("BBB");
        }

        var bufferFile3 = packageStore.getItemBuffer("file3");
        chai.expect(bufferFile3).to.be.an.instanceof(Object);
        if (bufferFile3){
            chai.expect(bufferFile3.buffer.toString()).to.eq("CCC");
        }

        var bufferFile4 = packageStore.getMainBuffer();
        chai.expect(bufferFile4).to.be.an.instanceof(Object);
        if (bufferFile4){
            chai.expect(bufferFile4.buffer.toString()).to.eq("AAA");
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
            chai.expect(manifest2.version).to.eq("1.0.0");
            chai.expect(manifest2.main).to.eq("");
        }
    })
})