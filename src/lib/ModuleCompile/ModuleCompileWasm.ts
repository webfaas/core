import { Log } from "../Log/Log";
import { LogLevelEnum, LogCodeEnum } from "../Log/ILog";
import { ModuleCompileManifestData } from "./ModuleCompileManifestData";
import { WebFaasError } from "../WebFaasError/WebFaasError";

/**
 * ModuleCompileWasm
 */
export class ModuleCompileWasm {
    private log: Log;

    constructor(log?: Log) {
        this.log = log || new Log();
    }

    getLog(): Log{
        return this.log;
    }

    /**
     * return a wasm compiled
     * @param code 
     * @param moduleCompileManifestData 
     */
    compile(code: Buffer, moduleCompileManifestData: ModuleCompileManifestData): Promise<any>{
        return new Promise((resolve, reject)=>{
            let timeInit: number = new Date().getTime();
            let logDetail = {} as any;
            logDetail.manifest = moduleCompileManifestData;

            WebAssembly.compile(code).then((module) => {
                WebAssembly.instantiate(module).then((instance) => {
                    logDetail.delay = new Date().getTime() - timeInit;
            
                    this.log.write(LogLevelEnum.INFO, "compile", LogCodeEnum.COMPILE.toString(), "compiled", logDetail, __filename);

                    resolve(instance);
                }).catch((errTry)=>{
                    this.log.writeError("compile", errTry, logDetail, __filename);
                    reject(errTry);
                });
            }).catch((errTry)=>{
                this.log.writeError("compile", errTry, logDetail, __filename);
                reject(errTry);
            });
        });
    }
}