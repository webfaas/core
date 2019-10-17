import { IModuleCompileRequireBuilder, IModuleCompileManifestData } from "./IModuleCompile";
import { Log } from "../Log/Log";
import { LogLevelEnum, LogCodeEnum } from "../Log/ILog";

/**
 * DefaultModuleCompileRequireBuilder
 */
export class DefaultModuleCompileRequireBuilder implements IModuleCompileRequireBuilder {
    private log: Log;

    constructor(log: Log) {
        this.log = log;
    }

    /**
     * process require
     * @param path path file
     * @param manifest manifest data
     */
    processRequire(path: string, manifest: IModuleCompileManifestData): any {
        this.log.write(LogLevelEnum.DEBUG, "processRequire", LogCodeEnum.PROCESS.toString(), path, manifest, __filename);
        return require(path);
    }

    /**
     * build require function
     * @param manifest manifest data
     */
    requireBuilder(manifest: IModuleCompileManifestData): Function {
        var newRequire = (path: string) => {
            return this.processRequire(path, manifest);
        }

        return newRequire;
    }
}