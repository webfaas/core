import { IPackageRegistry } from "../../lib/PackageRegistry/IPackageRegistry";
import { IPackageRegistryResponse } from "../../lib/PackageRegistry/IPackageRegistryResponse";
import { PackageStore } from "../../lib/PackageStore/PackageStore";
import { IPackageStoreItemData } from "../../lib/PackageStore/IPackageStoreItemData";
import { PackageStoreUtil } from "../../lib/PackageStore/PackageStoreUtil";

export namespace PackageRegistryResponseMock{
    function addItemData(name: string, begin: number, fileBuffer: Buffer, dataPackageItemDataMap: Map<string, IPackageStoreItemData>){
        let itemData = {} as IPackageStoreItemData;
        itemData.begin = begin;
        itemData.name = name;
        itemData.size = fileBuffer.length;
        dataPackageItemDataMap.set(itemData.name, itemData);
        return begin + fileBuffer.length;
    }

    export class Manifest implements IPackageRegistryResponse{
        etag: string;
        packageStore: PackageStore | null = null;
    
        constructor(name: string, versions: string[] = ["0.0.1"], description: string = "test"){
            this.etag = "001";
            
            var itemData: IPackageStoreItemData;
            var dataPackageItemDataMap: Map<string, IPackageStoreItemData> = new Map<string, IPackageStoreItemData>();
            var nextPos: number = 0;
            var lastVersion = versions[versions.length - 1];

            var manifestVersionsObj: any = {};
            for (var i = 0; i < versions.length; i++){
                let version = versions[i];
                manifestVersionsObj[version] = {name:name, version:version, main:"index.js", description: description};
            }
            
            var packageObj = {name:name, version:lastVersion, main:"index.js", versions: manifestVersionsObj, description: description};
            var packageBuffer = Buffer.from(JSON.stringify(packageObj));
            nextPos = addItemData("package.json", nextPos, packageBuffer, dataPackageItemDataMap);

            this.packageStore = new PackageStore(name, packageObj.version, this.etag, packageBuffer, dataPackageItemDataMap);
        }
    }

    export class AbstractBase implements IPackageRegistryResponse{
        etag: string;
        packageStore: PackageStore | null = null;
    
        constructor(name: string, version: string, description: string, moduleText: string){
            this.etag = "etag" + version;
            
            var itemData: IPackageStoreItemData;
            var dataPackageItemDataMap: Map<string, IPackageStoreItemData> = new Map<string, IPackageStoreItemData>();
            var nextPos: number = 0;

            let packageObj = {name:name, version:version, main:"index.js", description: description};
            let packageBuffer = Buffer.from(JSON.stringify(packageObj));
            nextPos = addItemData("package.json", nextPos, packageBuffer, dataPackageItemDataMap);

            let file1Buffer = Buffer.from(moduleText);
            nextPos = addItemData("index.js", nextPos, file1Buffer, dataPackageItemDataMap);
    
            var bufferTotal: Buffer = Buffer.concat([packageBuffer, file1Buffer]);
    
            this.packageStore = new PackageStore(name, version, this.etag, bufferTotal, dataPackageItemDataMap);
        }
    }

    export class MathSum extends AbstractBase{
        constructor(name: string = "mathsum", version: string = "0.0.1", description: string = "test"){
            let moduleText = `
                module.exports = function(x,y){
                    return x + y
                }
            `

            super(name, version, description, moduleText);
        }
    }

    export class HostName extends AbstractBase{
        constructor(name: string = "hostname", version: string = "0.0.1", description: string = "test"){
            let moduleText = `
                const os = require("os");
                module.exports = function(){
                    return os.hostname();
                }
            `

            super(name, version, description, moduleText);
        }
    }

    export class SyntaxError extends AbstractBase{
        constructor(name: string = "syntaxerror", version: string = "0.0.1", description: string = "test"){
            let moduleText = `
                module.exports = function(\\\///\|||aaaa
            `

            super(name, version, description, moduleText);
        }
    }

    export class ExecutionError extends AbstractBase{
    
        constructor(name: string = "executionerror", version: string = "0.0.1", description: string = "test"){
            let moduleText = `
                module.exports = function(){
                    throw new Error("execution error");
                }
            `

            super(name, version, description, moduleText);
        }
    }

    export class ModuleWhitoutExport extends AbstractBase{
    
        constructor(name: string = "modulewhitoutexport", version: string = "0.0.1", description: string = "test"){
            let moduleText = `
                var privatefunc1 = function(){
                    return "test";
                }
            `

            super(name, version, description, moduleText);
        }
    }

    export class ModuleDependencyNotDeclared extends AbstractBase{
    
        constructor(name: string = "moduledependencynotdeclared", version: string = "0.0.1", description: string = "test"){
            let moduleText = `
                const dependency = require("@registry/notdeclared");
                module.exports = function(){
                    return "A";
                }
            `

            super(name, version, description, moduleText);
        }
    }

    export class MathSumAsync implements IPackageRegistryResponse{
        etag: string;
        packageStore: PackageStore | null = null;
    
        constructor(name: string = "mathsumasync", version: string = "0.0.1", dependencies: any = {"@registry1/mathsum": "0.0.1"}, description: string = "test"){
            this.etag = "etag" + version;
            
            var itemData: IPackageStoreItemData;
            var dataPackageItemDataMap: Map<string, IPackageStoreItemData> = new Map<string, IPackageStoreItemData>();
            var nextPos: number = 0;

            let packageObj = {name:name, version:version, main:"index.js", description: description, dependencies: dependencies};
            let packageBuffer = Buffer.from(JSON.stringify(packageObj));
            nextPos = addItemData("package.json", nextPos, packageBuffer, dataPackageItemDataMap);

            let moduleText = `
                Object.defineProperty(exports, "__esModule", { value: true });
                const mathSum = require("@registry1/mathsum");
                function internalsum(event) {
                    return mathSum(event.x, event.y);
                }
                async function sum(event) {
                    return { result: internalsum(event) };
                }
                exports.sum = sum;
            `

            let file1Buffer = Buffer.from(moduleText);
            nextPos = addItemData("index.js", nextPos, file1Buffer, dataPackageItemDataMap);
    
            var bufferTotal: Buffer = Buffer.concat([packageBuffer, file1Buffer]);
    
            this.packageStore = new PackageStore(name, version, this.etag, bufferTotal, dataPackageItemDataMap);
        }
    }

    export class ModuleDependencyNotFound implements IPackageRegistryResponse{
        etag: string;
        packageStore: PackageStore | null = null;
    
        constructor(name: string = "moduledependencynotfound", version: string = "0.0.1", dependencies: any = {"@registry1/notfound": "0.0.1"}, description: string = "test"){
            this.etag = "etag" + version;
            
            var itemData: IPackageStoreItemData;
            var dataPackageItemDataMap: Map<string, IPackageStoreItemData> = new Map<string, IPackageStoreItemData>();
            var nextPos: number = 0;

            let packageObj = {name:name, version:version, main:"index.js", description: description, dependencies: dependencies};
            let packageBuffer = Buffer.from(JSON.stringify(packageObj));
            nextPos = addItemData("package.json", nextPos, packageBuffer, dataPackageItemDataMap);

            let moduleText = `
                module.exports = function(){
                    return "A";
                }
            `

            let file1Buffer = Buffer.from(moduleText);
            nextPos = addItemData("index.js", nextPos, file1Buffer, dataPackageItemDataMap);
    
            var bufferTotal: Buffer = Buffer.concat([packageBuffer, file1Buffer]);
    
            this.packageStore = new PackageStore(name, version, this.etag, bufferTotal, dataPackageItemDataMap);
        }
    }

    export class InternalRelativeDependency implements IPackageRegistryResponse{
        etag: string;
        packageStore: PackageStore | null = null;
    
        constructor(name: string = "internalrelativedependency", version: string = "0.0.1", description: string = "test"){
            this.etag = "etag" + version;
            
            var itemData: IPackageStoreItemData;
            var dataPackageItemDataMap: Map<string, IPackageStoreItemData> = new Map<string, IPackageStoreItemData>();
            var nextPos: number = 0;

            let packageObj = {name:name, version:version, main:"index.js", description: description};
            let packageBuffer = Buffer.from(JSON.stringify(packageObj));
            nextPos = addItemData("package.json", nextPos, packageBuffer, dataPackageItemDataMap);

            let moduleText1 = `
                const dependency1 = require("./dependency1.js");
                const dependency2 = require("./dependency2.json");
                const dependency3 = require("./folder1");
                module.exports = function(){
                    return dependency1() + dependency2.name + dependency3() + "D"; //return => ABCD
                }
            `

            let moduleText2 = `
                module.exports = function(){
                    return "A";
                }
            `

            let moduleText3 = `
                {"name":"B"}
            `

            let moduleText4 = `
                module.exports = function(){
                    return "C";
                }
            `

            let file1Buffer = Buffer.from(moduleText1);
            nextPos = addItemData("index.js", nextPos, file1Buffer, dataPackageItemDataMap);

            let file2Buffer = Buffer.from(moduleText2);
            nextPos = addItemData("dependency1.js", nextPos, file2Buffer, dataPackageItemDataMap);

            let file3Buffer = Buffer.from(moduleText3);
            nextPos = addItemData("dependency2.json", nextPos, file3Buffer, dataPackageItemDataMap);

            let file4Buffer = Buffer.from(moduleText4);
            nextPos = addItemData("folder1/index.js", nextPos, file4Buffer, dataPackageItemDataMap);
    
            var bufferTotal: Buffer = Buffer.concat([packageBuffer, file1Buffer, file2Buffer, file3Buffer, file4Buffer]);
    
            this.packageStore = new PackageStore(name, version, this.etag, bufferTotal, dataPackageItemDataMap);
        }
    }

    export class SimpleText implements IPackageRegistryResponse{
        etag: string;
        packageStore: PackageStore | null = null;
    
        constructor(name: string = "simpletext", version: string = "0.0.1", description: string = "test", file1Text = "AAA", file2Text = "BBB", file3Text = "CCC"){
            this.etag = "etag" + version;
    
            var itemData: IPackageStoreItemData;
            var dataPackageItemDataMap: Map<string, IPackageStoreItemData> = new Map<string, IPackageStoreItemData>();
            var nextPos: number = 0;

            let packageObj = {name:name, version:version, main:"", description: description};
            let packageBuffer = Buffer.from(JSON.stringify(packageObj));
            nextPos = addItemData("package.json", nextPos, packageBuffer, dataPackageItemDataMap);

            let file1Buffer = Buffer.from(file1Text);
            nextPos = addItemData("file1.txt", nextPos, file1Buffer, dataPackageItemDataMap);

            let file2Buffer = Buffer.from(file2Text);
            nextPos = addItemData("file2.txt", nextPos, file2Buffer, dataPackageItemDataMap);

            let file3Buffer = Buffer.from(file3Text);
            nextPos = addItemData("file3.txt", nextPos, file3Buffer, dataPackageItemDataMap);

            var bufferTotal: Buffer = Buffer.concat([packageBuffer, file1Buffer, file2Buffer, file3Buffer]);
            
            this.packageStore = new PackageStore(name, version, this.etag, bufferTotal, dataPackageItemDataMap);
        }
    }
}