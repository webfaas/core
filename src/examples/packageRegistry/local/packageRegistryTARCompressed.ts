"use strict";

//wget https://registry.npmjs.org/semver/-/semver-5.6.0.tg
//wget https://registry.npmjs.org/semver

import * as fs from "fs";
import * as path from "path";
import { PackageStore } from "../../../lib/PackageStore/PackageStore";
import { PackageRegistry } from "../../../lib/PackageRegistry/PackageRegistry";
import { PackageRegistryResponseFormatEnum } from "../../../lib/PackageRegistry/IPackageRegistryResponse";

var packageRegistry: PackageRegistry = new PackageRegistry();
var fileBuffer = fs.readFileSync(path.join(__dirname, "semver-5.6.0.tgz"));
var packageStore: PackageStore = packageRegistry.packageParse(PackageRegistryResponseFormatEnum.BUNDLE_TAR_COMPRESSED, "semver", "5.6.0", "", fileBuffer);

console.log(packageStore);

var itemBuffer = packageStore.getItemBuffer("README.md");
if (itemBuffer){
    console.log(itemBuffer.toString());
}

var manifest = packageStore.getManifest();
if (manifest){
    console.log(manifest.name);
    console.log(manifest["description"]);
    console.log(manifest["notfound"]);
    console.log(manifest);
}