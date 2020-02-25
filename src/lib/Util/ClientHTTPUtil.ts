import * as fs from "fs";
import * as path from "path";

import { ClientHTTPConfig } from "../Core";

export class ClientHTTPUtil  {
    /**
     * parse path name. Ex: ./cert.pem
     * @param name 
     */
    public static parsePathName(name: string){
        if (name.substring(0,2) === "./"){
            return path.join(process.cwd(), name);
        }
        else{
            return name;
        }
    }

    /**
     * return ClientHTTPConfig
     * @param itemConfig object
     */
    public static parseClientHTTPConfig(itemConfig: any): ClientHTTPConfig {
        let newHttpConfig: ClientHTTPConfig = new ClientHTTPConfig();
    
        if (itemConfig.keepAlive === "false"){
            newHttpConfig.keepAlive = false;    
        }

        if (itemConfig.timeout){
            newHttpConfig.timeout = parseInt(itemConfig.timeout);
        }

        if (itemConfig.rejectUnauthorized === "false"){
            newHttpConfig.rejectUnauthorized = false;
        }

        if (itemConfig.maxSockets){
            newHttpConfig.maxSockets = parseInt(itemConfig.maxSockets);
        }

        if (itemConfig.key){
            newHttpConfig.key = fs.readFileSync(ClientHTTPUtil.parsePathName(itemConfig.key));
        }

        if (itemConfig.cert){
            newHttpConfig.cert = fs.readFileSync(ClientHTTPUtil.parsePathName(itemConfig.cert));
        }

        if (itemConfig.pfx){
            newHttpConfig.pfx = fs.readFileSync(ClientHTTPUtil.parsePathName(itemConfig.pfx));
        }

        if (itemConfig.ca){
            newHttpConfig.ca = fs.readFileSync(ClientHTTPUtil.parsePathName(itemConfig.ca));
        }
        
        return newHttpConfig;
    };
}