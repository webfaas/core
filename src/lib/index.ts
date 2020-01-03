import { ModuleManager } from "../lib/ModuleManager/ModuleManager";
import { PackageStoreManager } from "./PackageStoreManager/PackageStoreManager";
import { Log } from "./Log/Log";
import { InvokeData } from "./ModuleManager/InvokeData";

export class Core {
    private moduleManager: ModuleManager;

    getModuleManager(){
        return this.moduleManager;
    }

    static moduleManagerBuild(packageStoreManager?: PackageStoreManager, log?: Log): ModuleManager{
        let moduleManager: ModuleManager = new ModuleManager(packageStoreManager, log);
        return moduleManager;
    }

    constructor(moduleManager?: ModuleManager) {
        if (moduleManager){
            this.moduleManager = moduleManager;
        }
        else{
            this.moduleManager = Core.moduleManagerBuild();
        }
    }
}

if (process.argv.length > 2){
    let core = new Core();
    let commandText: string = process.argv[2];
    if (commandText){
        let commandText: string = process.argv[2].trim().toUpperCase();

        switch(commandText){
            case "INVOKE":
                if (process.argv.length > 3){
                    let subCommandText: string = process.argv[3];
                    let invokeData1 = InvokeData.parseInvokeCommandTexto(process.argv[3]);
                    let parameters: any[] = [];
                    let registryName = "";

                    let parameterValue: any = process.argv[4];
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
                    registryName = process.argv[5] || "NPM";
                    registryName = registryName.toUpperCase();
                    
                    console.log("invoke... ", "name:", invokeData1.name, "version:", invokeData1.version, "method:", invokeData1.method, "parameters:", parameters, "registryName:", registryName);
                    core.getModuleManager().invokeAsync(invokeData1.name, invokeData1.version, invokeData1.method, parameters, registryName).then((response)=>{
                        console.log("invoke.response => ", response);
                    }).catch((error) => {
                        console.log("invoke.error => ", error);
                    });
                }
                break;
            default:
                console.log("unrecognized command!".toUpperCase());
        }
    }
}