import * as chai from "chai";
import * as mocha from "mocha";

import * as fs from "fs";
import * as path from "path";
import { PackageStoreUtil } from "../lib/PackageStore/PackageStoreUtil";
import { IPackageStoreItemData } from "../lib/PackageStore/IPackageStoreItemData";
import { IManifest } from "../lib/Manifest/IManifest";
import { PackageStore } from "../lib/PackageStore/PackageStore";
import { PackageStoreItemBufferResponse } from "../lib/PackageStore/PackageStoreItemBufferResponse";
import { PackageStoreMock } from "./mocks/PackageStoreMock";

describe("PackageStoreUtil", () => {
    it("buildPackageStoreFromListBuffer - Single Buffer", function(){
        var package1 = PackageStoreUtil.buildPackageStoreFromListBuffer("name1", "version1", "etag1", [Buffer.from("AAA1")], ["item1.txt"]);
        chai.expect(package1.getName()).to.eq("name1");
        chai.expect(package1.getVersion()).to.eq("version1");
        chai.expect(package1.getEtag()).to.eq("etag1");
        chai.expect(package1.getSize()).to.eq(4);
        chai.expect(package1.getMainBuffer()?.name).to.eq(undefined);
        chai.expect(package1.getMainBuffer()?.extension).to.eq(undefined);
        chai.expect(package1.getMainBuffer()?.buffer.toString()).to.eq(undefined);
        chai.expect(package1.getItemBuffer("item1.txt")?.name).to.eq("item1.txt");
        chai.expect(package1.getItemBuffer("item1.txt")?.extension).to.eq(".txt");
        chai.expect(package1.getItemBuffer("item1.txt")?.buffer.toString()).to.eq("AAA1");
    })

    it("buildPackageStoreFromListBuffer - Multiple Buffer", function(){
        var package1 = PackageStoreUtil.buildPackageStoreFromListBuffer("name1", "version1", "etag1", [Buffer.from("AAA1"), Buffer.from("BBBB2"), Buffer.from("CCCCC3")], ["item1.txt", "item2.txt"]);
        chai.expect(package1.getName()).to.eq("name1");
        chai.expect(package1.getVersion()).to.eq("version1");
        chai.expect(package1.getEtag()).to.eq("etag1");
        chai.expect(package1.getSize()).to.eq(4 + 5 + 6); //size all buffer
        chai.expect(package1.getMainBuffer()?.name).to.eq(undefined);
        chai.expect(package1.getMainBuffer()?.extension).to.eq(undefined);
        chai.expect(package1.getMainBuffer()?.buffer.toString()).to.eq(undefined);

        chai.expect(package1.getItemBuffer("item1.txt")?.name).to.eq("item1.txt");
        chai.expect(package1.getItemBuffer("item1.txt")?.extension).to.eq(".txt");
        chai.expect(package1.getItemBuffer("item1.txt")?.buffer.toString()).to.eq("AAA1");

        chai.expect(package1.getItemBuffer("item2.txt")?.name).to.eq("item2.txt");
        chai.expect(package1.getItemBuffer("item2.txt")?.extension).to.eq(".txt");
        chai.expect(package1.getItemBuffer("item2.txt")?.buffer.toString()).to.eq("BBBB2");

        chai.expect(package1.getItemBuffer("")?.name).to.eq("");
        chai.expect(package1.getItemBuffer("")?.extension).to.eq("");
        chai.expect(package1.getItemBuffer("")?.buffer.toString()).to.eq("CCCCC3");
    })

    it("convertPackageStoreToTarGzBuffer - mathsum", function(){
        //
        //ORIGINAL
        //

        var originalPackageStoreBase = PackageStoreMock.MathSum.getPackageStore();

        chai.expect(originalPackageStoreBase.getName()).to.eq("mathsum");
        chai.expect(originalPackageStoreBase.getVersion()).to.eq("0.0.1");
        chai.expect(originalPackageStoreBase.getEtag()).to.eq("etag1");

        var itemResponse: PackageStoreItemBufferResponse | null = originalPackageStoreBase.getItemBuffer("package.json");
        chai.expect(itemResponse).to.be.an.instanceof(Object);
        if (itemResponse){
            chai.expect(itemResponse.name).to.eq("package.json");
            chai.expect(itemResponse.extension).to.eq(".json");
            chai.expect(itemResponse.buffer.toString()).to.eq(PackageStoreMock.MathSum.packageJSONBuffer.toString());
        }

        var itemResponse: PackageStoreItemBufferResponse | null = originalPackageStoreBase.getItemBuffer("index.js");
        chai.expect(itemResponse).to.be.an.instanceof(Object);
        if (itemResponse){
            chai.expect(itemResponse.name).to.eq("index.js");
            chai.expect(itemResponse.extension).to.eq(".js");
            chai.expect(itemResponse.buffer.toString()).to.eq(PackageStoreMock.MathSum.moduleIndexBuffer.toString());
        }
        chai.expect(originalPackageStoreBase.getMainBuffer()?.buffer.toString()).to.eq(PackageStoreMock.MathSum.moduleIndexBuffer.toString());

        var originalBufferTarGz: Buffer = PackageStoreUtil.convertPackageStoreToTarGzBuffer(originalPackageStoreBase);
        
        //
        //TARGET
        //

        var targetPackageStoreBase = PackageStoreUtil.buildPackageStoreFromTarGzBuffer("mathsum2", "0.0.2", "etag2", originalBufferTarGz);

        chai.expect(targetPackageStoreBase.getName()).to.eq("mathsum2");
        chai.expect(targetPackageStoreBase.getVersion()).to.eq("0.0.2");
        chai.expect(targetPackageStoreBase.getEtag()).to.eq("etag2");

        var itemResponse: PackageStoreItemBufferResponse | null = targetPackageStoreBase.getItemBuffer("package.json");
        chai.expect(itemResponse).to.be.an.instanceof(Object);
        if (itemResponse){
            chai.expect(itemResponse.name).to.eq("package.json");
            chai.expect(itemResponse.extension).to.eq(".json");
            chai.expect(itemResponse.buffer.toString()).to.eq(PackageStoreMock.MathSum.packageJSONBuffer.toString());
        }

        var itemResponse: PackageStoreItemBufferResponse | null = targetPackageStoreBase.getItemBuffer("index.js");
        chai.expect(itemResponse).to.be.an.instanceof(Object);
        if (itemResponse){
            chai.expect(itemResponse.name).to.eq("index.js");
            chai.expect(itemResponse.extension).to.eq(".js");
            chai.expect(itemResponse.buffer.toString()).to.eq(PackageStoreMock.MathSum.moduleIndexBuffer.toString());
        }
        chai.expect(targetPackageStoreBase.getMainBuffer()?.buffer.toString()).to.eq(PackageStoreMock.MathSum.moduleIndexBuffer.toString());
    })

    it("convertPackageStoreToTarGzBuffer - MathSumIndexInFolder", function(){
        //
        //ORIGINAL
        //

        var originalPackageStoreBase = PackageStoreMock.MathSumIndexInFolder.getPackageStore();

        chai.expect(originalPackageStoreBase.getName()).to.eq("mathsum");
        chai.expect(originalPackageStoreBase.getVersion()).to.eq("0.0.1");
        chai.expect(originalPackageStoreBase.getEtag()).to.eq("etag1");

        var itemResponse: PackageStoreItemBufferResponse | null = originalPackageStoreBase.getItemBuffer("package.json");
        chai.expect(itemResponse).to.be.an.instanceof(Object);
        if (itemResponse){
            chai.expect(itemResponse.name).to.eq("package.json");
            chai.expect(itemResponse.extension).to.eq(".json");
            chai.expect(itemResponse.buffer.toString()).to.eq(PackageStoreMock.MathSumIndexInFolder.packageJSONBuffer.toString());
        }

        var itemResponse: PackageStoreItemBufferResponse | null = originalPackageStoreBase.getItemBuffer("folder1/index.js");
        chai.expect(itemResponse).to.be.an.instanceof(Object);
        if (itemResponse){
            chai.expect(itemResponse.name).to.eq("folder1/index.js");
            chai.expect(itemResponse.extension).to.eq(".js");
            chai.expect(itemResponse.buffer.toString()).to.eq(PackageStoreMock.MathSumIndexInFolder.moduleIndexBuffer.toString());
        }
        chai.expect(originalPackageStoreBase.getMainBuffer()?.buffer.toString()).to.eq(PackageStoreMock.MathSumIndexInFolder.moduleIndexBuffer.toString());

        var originalBufferTarGz: Buffer = PackageStoreUtil.convertPackageStoreToTarGzBuffer(originalPackageStoreBase);
        
        //
        //TARGET
        //

        var targetPackageStoreBase = PackageStoreUtil.buildPackageStoreFromTarGzBuffer("mathsum2", "0.0.2", "etag2", originalBufferTarGz);

        chai.expect(targetPackageStoreBase.getName()).to.eq("mathsum2");
        chai.expect(targetPackageStoreBase.getVersion()).to.eq("0.0.2");
        chai.expect(targetPackageStoreBase.getEtag()).to.eq("etag2");

        var itemResponse: PackageStoreItemBufferResponse | null = targetPackageStoreBase.getItemBuffer("package.json");
        chai.expect(itemResponse).to.be.an.instanceof(Object);
        if (itemResponse){
            chai.expect(itemResponse.name).to.eq("package.json");
            chai.expect(itemResponse.extension).to.eq(".json");
            chai.expect(itemResponse.buffer.toString()).to.eq(PackageStoreMock.MathSumIndexInFolder.packageJSONBuffer.toString());
        }

        var itemResponse: PackageStoreItemBufferResponse | null = targetPackageStoreBase.getItemBuffer("folder1/index.js");
        chai.expect(itemResponse).to.be.an.instanceof(Object);
        if (itemResponse){
            chai.expect(itemResponse.name).to.eq("folder1/index.js");
            chai.expect(itemResponse.extension).to.eq(".js");
            chai.expect(itemResponse.buffer.toString()).to.eq(PackageStoreMock.MathSumIndexInFolder.moduleIndexBuffer.toString());
        }
        chai.expect(targetPackageStoreBase.getMainBuffer()?.buffer.toString()).to.eq(PackageStoreMock.MathSumIndexInFolder.moduleIndexBuffer.toString());
    })
})