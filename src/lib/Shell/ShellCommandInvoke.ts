import { Core } from "../Core";
import { InvokeData } from "../ModuleManager/InvokeData";
import { IShellCommand } from "./IShellCommand";
import { LogLevelEnum, LogCodeEnum } from "../Log/ILog";

export class ShellCommandInvoke implements IShellCommand {
    core: Core;
    commandTrigger: string = "INVOKE";
    info: string = "INVOKE [MODULE] [PARAMETERS] [REGISTRYNAME]";
    example: string = "INVOKE @webfaaslabs/mathsum:0.0.1 '[2,5]'";
    defaultRegistryName: string = "defaultregistrynamenotconfigured";

    constructor(core: Core){
        this.core = core;
    }
    
    executeCommand(shellArgv: string[]): Promise<any>{
        return new Promise((resolve, reject) => {
            if (shellArgv.length > 3){
                let subCommandText: string = shellArgv[3];
                let invokeData1 = InvokeData.parseInvokeCommandTexto(shellArgv[3]);
                let parameters: any[] = [];
                let registryName = "";
    
                let parameterValue: any = shellArgv[4];
                if (parameterValue){
                    if ((parameterValue.substring(0,1) === "{") || (parameterValue.substring(0,1) === "[")){
                        parameterValue = JSON.parse(parameterValue);
                        if (Array.isArray(parameterValue)){
                            let parameterValueList: any[] = parameterValue;
                            for (let i2 = 0; i2 < parameterValueList.length; i2++){
                                parameters.push(parameterValueList[i2]);
                            }
                        }
                        else{
                            parameters.push(parameterValue);
                        }
                    }
                    else{
                        parameters.push(parameterValue);
                    }
                }
                registryName = shellArgv[5] || this.defaultRegistryName;
                registryName = registryName.toUpperCase();
                
                this.core.getLog().write(LogLevelEnum.INFO, "executeCommand", LogCodeEnum.PROCESS.toString(), "INVOKE", invokeData1, __filename);
                
                this.core.getModuleManager().invokeAsync(invokeData1.name, invokeData1.version, invokeData1.method, parameters, registryName).then((response)=>{
                    resolve(response);
                }).catch((error) => {
                    reject(error);
                });
            }
            else{
                resolve();
            }
        })
    }
}