"use strict";

//wget https://registry.npmjs.org/semver/-/semver-5.6.0.tg
//wget https://registry.npmjs.org/semver

import * as fs from "fs";
import * as path from "path";
import { PackageStore } from "../../../lib/PackageStore/PackageStore";
import { PackageRegistry } from "../../../lib/PackageRegistry/PackageRegistry";
import { PackageRegistryResponseFormatEnum } from "../../../lib/PackageRegistry/IPackageRegistryResponse";

var packageRegistry: PackageRegistry = new PackageRegistry();
var fileBuffer = fs.readFileSync(path.join(__dirname, "semver.json"));
var packageStore: PackageStore = packageRegistry.packageParse(PackageRegistryResponseFormatEnum.MANIFEST_UNCOMPRESSED, "semver", "", "", fileBuffer);

console.log(packageStore);

var manifest = packageStore.getManifest();
if (manifest){
    console.log(manifest.name);
    console.log(manifest["description"]);
    console.log(manifest["notfound"]);
    console.log(manifest);
}