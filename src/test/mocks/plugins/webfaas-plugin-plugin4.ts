import { IPlugin } from "../../../lib/PluginManager/IPlugin";
import { Core } from "../../../lib/Core";

class CustomPlugin4 implements IPlugin {
    name: string = "CustomPlugin3"
    state: string = ""

    startPlugin(core: Core): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.state = "started";
            resolve();
        });
    }
    
    stopPlugin(core: Core): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.state = "stoped";
            resolve();
        });
    }
}

export default function factory(){
    return new CustomPlugin4;
}