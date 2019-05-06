import { IModuleCompileRequireBuilder, IModuleCompileManifestData } from "./IModuleCompile";

/**
 * DefaultModuleCompileRequireBuilder
 */
export class DefaultModuleCompileRequireBuilder implements IModuleCompileRequireBuilder {
    /**
     * process require
     * @param path path file
     * @param manifest manifest data
     */
    processRequire(path: string, manifest: IModuleCompileManifestData): any {
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