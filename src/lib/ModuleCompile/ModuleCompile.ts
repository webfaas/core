import * as vm from "vm";
import { IModuleCompile, IModuleCompileRequireBuilder, IModuleCompileManifestData } from "./IModuleCompile";
import { DefaultModuleCompileRequireBuilder } from "./DefaultModuleCompileRequire";
import { SandBox } from "./SandBox";
import { Log } from "../Log/Log";
import { LogLevelEnum, LogCodeEnum } from "../Log/ILog";
import { IInvokeContext } from "../InvokeContext/IInvokeContext";

const wrapper = [
    "(function (exports, require, module, __filename, __dirname) { ",
    "\n});"
];

/**
 * ModuleCompile
 */
export class ModuleCompile {
    private log: Log;

    constructor(log?: Log) {
        this.log = log || Log.getInstance();
        this.defaultRequireBuilder = new DefaultModuleCompileRequireBuilder(this.log);
        this.defaultSandBoxContext = SandBox.SandBoxBuilderContext();
    }

    /**
     * return singleton instance
     */
    static getInstance(): ModuleCompile{
        return moduleCompileInstance;
    }

    defaultRequireBuilder: IModuleCompileRequireBuilder
    defaultSandBoxContext: vm.Context

    /**
     * return a code compiled
     * @param code source code
     * @param manifest manifest data
     * @param sandboxContext sadbox context
     * @param invokeContext context invoke
     */
    compile(code: string, manifest: IModuleCompileManifestData, sandboxContext?: vm.Context, invokeContext?: IInvokeContext): any{
        try {
            var timeInit: number = new Date().getTime();

            var codeWrapper: string = wrapper[0] + code + wrapper[1];
    
            if (!sandboxContext){
                sandboxContext = this.defaultSandBoxContext;
            }
            
            var compiledWrapper = vm.runInNewContext(codeWrapper, sandboxContext, {
                filename: manifest.filePath,
                lineOffset: 0,
                displayErrors: true
            });
    
            var newModule = {} as IModuleCompile;
            newModule.exports = {};
            var newRequire: Function = this.defaultRequireBuilder.requireBuilder(manifest);
            
            compiledWrapper(newModule.exports, newRequire, newModule, manifest.filePath || manifest.name, "");
    
            //logDetail
            var logDetail = {} as any;
            logDetail.manifest = manifest;
            logDetail.delay = new Date().getTime() - timeInit;
    
            this.log.write(LogLevelEnum.INFO, "compile", LogCodeEnum.COMPILE.toString(), "compiled", logDetail, __filename, invokeContext);
    
            return newModule;
        }
        catch (errTry) {
            //logDetail
            var logDetail = {} as any;
            logDetail.manifest = manifest;
            
            this.log.writeError("constructor", errTry, logDetail, __filename, invokeContext);
            throw errTry;
        }
    }
}

const moduleCompileInstance:ModuleCompile = new ModuleCompile();