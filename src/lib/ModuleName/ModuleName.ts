import { IModuleNameData } from "./IModuleName";

/**
 * ModuleName
 */
export class ModuleName {
    constructor() {
    }

    /**
     * return parse name of module
     * @param moduleName name of module
     * @param fileName name of file
     */
    parse(moduleName: string, fileName: string): IModuleNameData{
        var responseObj = {} as IModuleNameData;
        var listToken: Array<string> = moduleName.split("/");
    
        if (fileName){
            responseObj.fullName = moduleName + "/" + fileName;
        }
        else{
            fileName = "";
            responseObj.fullName = moduleName;
        }
        
        if (moduleName.substring(0,1) === "@"){
            responseObj.scopeName = listToken[0].substring(1);
            if (listToken.length > 2){ //@my-company/module/v4
                responseObj.moduleName = listToken[0].toString() + "/" + listToken[1];
                if (fileName){
                    responseObj.fileName = listToken[2].toString() + "/" + fileName;
                }
                else{
                    responseObj.fileName = listToken[2].toString();
                }
            }
            else{ //@my-company/module
                responseObj.moduleName = moduleName;
                responseObj.fileName = fileName;
            }
            responseObj.moduleNameWhitOutScopeName = listToken[1];
        }
        else{
            responseObj.scopeName = "default";
            if (listToken.length > 1){ //module/v4
                responseObj.moduleName = listToken[0].toString();
                if (fileName){
                    responseObj.fileName = listToken[1].toString() + "/" + fileName;
                }
                else{
                    responseObj.fileName = listToken[1].toString();
                }
            }
            else{
                responseObj.moduleName = moduleName;
                responseObj.fileName = fileName;
            }
            responseObj.moduleNameWhitOutScopeName = responseObj.moduleName;
        }
    
        return responseObj;
    }
}