import * as path from "path";

import { IPackageStoreCacheSync } from "../PackageStoreCache/IPackageStoreCacheSync";
import { ModuleCompileManifestData } from "../ModuleCompile/ModuleCompileManifestData";
import { ModuleManagerRequireContextData } from "./ModuleManagerRequireContextData";
import { IRequirePackageInfoTarget } from "./IRequirePackageInfoTarget";
import { PackageStore, IManifest, ModuleNameUtil } from "../Core";
import { PackageStoreItemBufferResponse } from "../PackageStore/PackageStoreItemBufferResponse";
import { ICodeBufferResponseFromPackageStoreCacheSync } from "./ICodeBufferResponseFromPackageStoreCacheSync";

/**
 * manager Module
 */
export class ModuleManagerConvert {
    convertToPackageInfoTarget(name: string, version: string, moduleManagerRequireContextData: ModuleManagerRequireContextData, parentModuleCompileManifestData?: ModuleCompileManifestData): IRequirePackageInfoTarget{
        let packageInfoTarget = {} as IRequirePackageInfoTarget;

        packageInfoTarget.nameParsedObj = ModuleNameUtil.parse(name, "");
        if (name.substring(0,1) === "."){
            if (parentModuleCompileManifestData){
                //internal package
                packageInfoTarget.packageName = moduleManagerRequireContextData.parentPackageStoreName;
                packageInfoTarget.packageVersion = moduleManagerRequireContextData.parentPackageStoreVersion;
                packageInfoTarget.itemKey = path.resolve("/" + parentModuleCompileManifestData.mainFileDirName, name).substring(1);
            }
            else{
                packageInfoTarget.packageName = "";
                packageInfoTarget.packageVersion = "";
                packageInfoTarget.itemKey = "";
            }
        }
        else{
            //external package
            packageInfoTarget.packageName = packageInfoTarget.nameParsedObj.fullName;
            packageInfoTarget.packageVersion = version;
            packageInfoTarget.itemKey = "";
        }

        return packageInfoTarget;
    }

    convertToCodeBufferResponse(cacheRootPackageStore: IPackageStoreCacheSync, packageInfoTarget: IRequirePackageInfoTarget, moduleManagerRequireContextData: ModuleManagerRequireContextData): ICodeBufferResponseFromPackageStoreCacheSync | null{
        if (packageInfoTarget.itemKey){
            //
            //require internal package
            //
            let parentPackageStore: PackageStore | null = cacheRootPackageStore.getPackageStore(packageInfoTarget.packageName, packageInfoTarget.packageVersion);
            if (parentPackageStore){
                let packageStoreItemBufferResponse: PackageStoreItemBufferResponse | null = parentPackageStore.getItemBuffer(packageInfoTarget.itemKey);
                if (packageStoreItemBufferResponse){
                    let codeBufferFromPackageStoreCacheSync = {} as ICodeBufferResponseFromPackageStoreCacheSync;

                    codeBufferFromPackageStoreCacheSync.manifest = parentPackageStore.getManifest();

                    codeBufferFromPackageStoreCacheSync.packageStoreItemBufferResponse = packageStoreItemBufferResponse;

                    codeBufferFromPackageStoreCacheSync.moduleCompileManifestData = new ModuleCompileManifestData(
                        parentPackageStore.getName(),
                        parentPackageStore.getVersion(),
                        packageInfoTarget.itemKey
                    );

                    return codeBufferFromPackageStoreCacheSync;
                }
                else{
                    return null;
                }
            }
            else{
                return null;
            }
        }
        else{
            //
            //require external package
            //

            //if not version exist, seek version in parent package.json
            if (packageInfoTarget.packageVersion === "" && moduleManagerRequireContextData.parentPackageStoreName){
                let parentPackageStore: PackageStore | null = cacheRootPackageStore.getPackageStore(moduleManagerRequireContextData.parentPackageStoreName, moduleManagerRequireContextData.parentPackageStoreVersion);
                if (parentPackageStore){
                    let parentPackageManifest: IManifest | null = parentPackageStore.getManifest();
                    if (parentPackageManifest && parentPackageManifest.dependencies){
                        packageInfoTarget.packageVersion = parentPackageManifest.dependencies[packageInfoTarget.nameParsedObj.moduleName] || "";
                    }
                }
            }

            let packageStore: PackageStore | null = cacheRootPackageStore.getPackageStore(packageInfoTarget.nameParsedObj.moduleName, packageInfoTarget.packageVersion);
            if (packageStore){
                let packageStoreItemBufferResponse: PackageStoreItemBufferResponse | null
                if (packageInfoTarget.nameParsedObj.fileName){
                    packageStoreItemBufferResponse = packageStore.getItemBuffer(packageInfoTarget.nameParsedObj.fileName);
                }
                else{
                    packageStoreItemBufferResponse = packageStore.getMainBuffer();
                }

                if (packageStoreItemBufferResponse){
                    let codeBufferFromPackageStoreCacheSync = {} as ICodeBufferResponseFromPackageStoreCacheSync;

                    codeBufferFromPackageStoreCacheSync.manifest = packageStore.getManifest();
                    
                    codeBufferFromPackageStoreCacheSync.packageStoreItemBufferResponse = packageStoreItemBufferResponse;

                    codeBufferFromPackageStoreCacheSync.moduleCompileManifestData = new ModuleCompileManifestData(
                        packageStore.getName(),
                        packageStore.getVersion(),
                        packageInfoTarget.nameParsedObj.fileName || packageStore.getMainFileFullPath()
                    );

                    return codeBufferFromPackageStoreCacheSync;
                }
                else{
                    return null;
                }
            }
            else{
                return null;
            }
        }
    }
}