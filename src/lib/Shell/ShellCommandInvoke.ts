import { Core } from "../Core";
import { InvokeData } from "../ModuleManager/InvokeData";
import { IShellCommand } from "./IShellCommand";

export class ShellCommandInvoke implements IShellCommand {
    core: Core | null = null;
    commandTrigger: string = "INVOKE";
    info: string = "INVOKE [MODULE] [PARAMETERS] [REGISTRYNAME]";
    example: string = "INVOKE @webfaaslabs/mathsum:0.0.1 '[2,5]'";
    
    executeCommand(shellArgv: string[]){
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
            registryName = shellArgv[5] || "NPM";
            registryName = registryName.toUpperCase();
            
            console.log("invoke... ", "name:", invokeData1.name, "version:", invokeData1.version, "method:", invokeData1.method, "parameters:", parameters, "registryName:", registryName);
            /* istanbul ignore else  */
            if (this.core){
                this.core.getModuleManager().invokeAsync(invokeData1.name, invokeData1.version, invokeData1.method, parameters, registryName).then((response)=>{
                    console.log("invoke.response => ", response);
                }).catch((error) => {
                    console.log("invoke.error => ", error);
                });
            }
        }
    }
}