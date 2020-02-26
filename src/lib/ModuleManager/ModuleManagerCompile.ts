import { Log } from "../Log/Log";
import { ModuleCompileJavaScript } from "../ModuleCompile/ModuleCompileJavaScript";
import { ModuleCompileWasm } from "../ModuleCompile/ModuleCompileWasm";
import { SandBox } from "../ModuleCompile/SandBox";
import { Context } from "vm";
import { LogLevelEnum, LogCodeEnum } from "../Log/ILog";
import { ModuleCompileManifestData } from "../ModuleCompile/ModuleCompileManifestData";
import { ModuleManagerRequireContextData } from "./ModuleManagerRequireContextData";
import { PackageStoreItemBufferResponse } from "../PackageStore/PackageStoreItemBufferResponse";
import { ModuleManager } from "./ModuleManager";

/**
 * ModuleManagerCompile
 */
export class ModuleManagerCompile {
    private log: Log;
    private moduleManager: ModuleManager;
    private moduleCompileJavaScript: ModuleCompileJavaScript;
    private moduleCompileWasm: ModuleCompileWasm;
    private sandBoxContext: Context;
    
    constructor(moduleManager: ModuleManager, log: Log){
        this.moduleManager = moduleManager;
        this.log = log;
        this.sandBoxContext = SandBox.SandBoxBuilderContext();
        this.moduleCompileJavaScript = new ModuleCompileJavaScript(this.log);
        this.moduleCompileWasm = new ModuleCompileWasm(this.log);
        this.sandBoxContext = SandBox.SandBoxBuilderContext();
    }

    compilePackageStoreItemBufferSync(itemBufferResponse: PackageStoreItemBufferResponse, moduleManagerRequireContextData: ModuleManagerRequireContextData, moduleCompileManifestData: ModuleCompileManifestData): Object | null{
        var responseObj: Object | null = null;
        if (itemBufferResponse.extension === ".json"){
            responseObj = JSON.parse(itemBufferResponse.buffer.toString());
        }
        else{
            responseObj = this.compilePackageJavaScriptSync(moduleManagerRequireContextData, moduleCompileManifestData, itemBufferResponse.buffer);
        }
        return responseObj;
    }

    compilePackageStoreItemBufferAsync(itemBufferResponse: PackageStoreItemBufferResponse, moduleManagerRequireContextData: ModuleManagerRequireContextData, moduleCompileManifestData: ModuleCompileManifestData): Promise<Object | null>{
        return new Promise(async (resolve, reject) => {
            try {
                if (itemBufferResponse.extension === ".wasm"){
                    let responseObj = await this.compilePackageWasmAsync(moduleManagerRequireContextData, moduleCompileManifestData, itemBufferResponse.buffer);
                    resolve(responseObj);
                }
                else{
                    resolve(this.compilePackageStoreItemBufferSync(itemBufferResponse, moduleManagerRequireContextData, moduleCompileManifestData));
                }                
            }
            catch (errTry) {
                reject(errTry);
            }
        });
    }

    compilePackageJavaScriptSync(moduleManagerRequireContextData: ModuleManagerRequireContextData, moduleCompileManifestData: ModuleCompileManifestData, codeBuffer: Buffer): Object | null{
        try {
            var moduleManagerRequireContextDataDependency: ModuleManagerRequireContextData = new ModuleManagerRequireContextData(moduleManagerRequireContextData.rootPackageStoreKey);
            moduleManagerRequireContextDataDependency.parentPackageStoreName = moduleCompileManifestData.name;
            moduleManagerRequireContextDataDependency.parentPackageStoreVersion = moduleCompileManifestData.version;
    
            var globalRequire = (path: string): any => {
                this.log.write(LogLevelEnum.DEBUG, "processRequire", LogCodeEnum.PROCESS.toString(), path, moduleCompileManifestData, __filename);

                let responseModule = this.moduleManager.requireSync(path, "", moduleManagerRequireContextDataDependency, moduleCompileManifestData);
                if (responseModule){
                    return responseModule;
                }
                else{
                    this.log.write(LogLevelEnum.ERROR, "processRequire", LogCodeEnum.OPENFILE.toString(), path, moduleCompileManifestData, __filename);
                    throw new Error("Cannot find module '" + path + "'");
                }
            }
    
            var newModule = this.moduleCompileJavaScript.compile(codeBuffer.toString(), moduleCompileManifestData, this.sandBoxContext, globalRequire);

            if (newModule.exports){
                return newModule.exports;
            }
            else{
                if (newModule.__esModule){
                    return newModule;
                }
                else{
                    return null;
                }
            }
        }
        catch (errTry) {
            var errDetail: any = {};
            errDetail.moduleManagerRequireContextData = moduleManagerRequireContextData;
            errDetail.moduleCompileManifestData = moduleCompileManifestData;
            this.log.writeError("compilePackage", errTry, errDetail, __filename);
            throw errTry;
        }
    }

    compilePackageWasmAsync(moduleManagerRequireContextData: ModuleManagerRequireContextData, moduleCompileManifestData: ModuleCompileManifestData, codeBuffer: Buffer): Promise<Object | null>{
        return new Promise((resolve, reject) => {
            this.moduleCompileWasm.compile(codeBuffer, moduleCompileManifestData).then((newModule) => {
                resolve(newModule.exports);
            }).catch((errCompile)=>{
                var errDetail: any = {};
                errDetail.moduleManagerRequireContextData = moduleManagerRequireContextData;
                errDetail.moduleCompileManifestData = moduleCompileManifestData;
                this.log.writeError("compilePackageWasmAsync", errCompile, errDetail, __filename);
                reject(errCompile);
            });
        });
    }
}