import { PackageStore } from "../../lib/PackageStore/PackageStore";
import { PackageStoreUtil } from "../../lib/Util/PackageStoreUtil";

export namespace PackageStoreMock{
    export class MathSum {
        static packageJSONBuffer = Buffer.from(JSON.stringify({
            name: "sum",
            main: "index.js"
        }));
        
        static moduleIndexBuffer = Buffer.from(`
            module.exports = function(x, y){
                return x + y;
            }
        `);

        static getPackageStore(): PackageStore{
            var packageStore = new PackageStore("mathsum", "0.0.1", "etag1");

            packageStore.addItemBuffer("package.json", MathSum.packageJSONBuffer);
            packageStore.addItemBuffer("index.js", MathSum.moduleIndexBuffer);

            return packageStore;
        }
    }

    export class MathSumIndexInFolder {
        static packageJSONBuffer = Buffer.from(JSON.stringify({
            name: "sum",
            main: "folder1"
        }));
        
        static moduleIndexBuffer = Buffer.from(`
            module.exports = function(x, y){
                return x + y;
            }
        `);

        static getPackageStore(): PackageStore{
            var packageStore = new PackageStore("mathsum", "0.0.1", "etag1");

            packageStore.addItemBuffer("package.json", MathSumIndexInFolder.packageJSONBuffer);
            packageStore.addItemBuffer("folder1/index.js", MathSumIndexInFolder.moduleIndexBuffer);

            return packageStore;
        }
    }
}