import * as vm from "vm";
import { SandBox } from "./SandBox";
import { Log } from "../Log/Log";
import { LogLevelEnum, LogCodeEnum } from "../Log/ILog";
import { IInvokeContext } from "../InvokeContext/IInvokeContext";
import { ModuleCompileManifestData } from "./ModuleCompileManifestData";
import { WebFaasError } from "../WebFaasError/WebFaasError";

const wrapper = [
    "(function (exports, require, module, __filename, __dirname) { ",
    "\n});"
];

/**
 * ModuleCompile
 */
export class ModuleCompile {
    private log: Log;
    private defaultSandBoxContext: vm.Context;

    constructor(log?: Log) {
        this.log = log || Log.getInstance();
        this.defaultSandBoxContext = SandBox.SandBoxBuilderContext();
    }

    /**
     * return singleton instance
     */
    static getInstance(): ModuleCompile{
        return moduleCompileInstance;
    }

    private defaultGlobalRequire = (path: string): any => {
        this.log.write(LogLevelEnum.DEBUG, "defaultGlobalRequire", LogCodeEnum.PROCESS.toString(), path, null, __filename);
        return require(path);
    }

    getLog(): Log{
        return this.log;
    }

    /**
     * return a code compiled
     * @param code source code
     * @param manifest manifest data
     * @param sandboxContext sadbox context
     * @param invokeContext context invoke
     */
    compile(code: string, moduleCompileManifestData: ModuleCompileManifestData, sandboxContext?: vm.Context, globalRequire?: Function): any{
        try {
            var timeInit: number = new Date().getTime();

            var codeWrapper: string = wrapper[0] + code + wrapper[1];
    
            if (!sandboxContext){
                sandboxContext = this.defaultSandBoxContext;
            }
            
            var compiledWrapper = vm.runInNewContext(codeWrapper, sandboxContext, {
                filename: moduleCompileManifestData.mainFileFullPath,
                lineOffset: 0,
                displayErrors: true
            });
    
            var newModule = {} as Object;
            
            compiledWrapper(newModule, globalRequire || this.defaultGlobalRequire, newModule, moduleCompileManifestData.mainFileFullPath, moduleCompileManifestData.mainFileDirName);
    
            //logDetail
            var logDetail = {} as any;
            logDetail.manifest = moduleCompileManifestData;
            logDetail.delay = new Date().getTime() - timeInit;
    
            this.log.write(LogLevelEnum.INFO, "compile", LogCodeEnum.COMPILE.toString(), "compiled", logDetail, __filename);
    
            return newModule;
        }
        catch (errTry) {
            //logDetail
            var logDetail = {} as any;
            logDetail.moduleCompileManifestData = moduleCompileManifestData;
            
            this.log.writeError("compile", errTry, logDetail, __filename);

            throw new WebFaasError.CompileError(errTry);
        }
    }
}

const moduleCompileInstance:ModuleCompile = new ModuleCompile();