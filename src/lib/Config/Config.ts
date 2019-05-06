import * as fs from "fs";
import * as path from "path";
import { Log } from "../Log/Log";
import { LogLevelEnum, LogCodeEnum } from "../Log/ILog";

const log = Log.getInstance();

/**
 * Configuration. Automatic search file config and load
 */
export class Config {
    private originalConfigObj: any;
    private configByKey: any;
    
    nameFolderConfig: string = "data-config";
    
    /**
     * 
     * @param fileOrObject file string or object
     */
    constructor(fileOrObject?: any, nameFolderConfig?: string) {
        this.originalConfigObj = null;
        this.configByKey = {};

        if (nameFolderConfig){
            this.nameFolderConfig = nameFolderConfig;
        }

        try {
            this.open(fileOrObject);
        }
        catch (errTry) {
            log.writeError("constructor", errTry, null, __filename);
        }
    }

    static getInstance(): Config{
        if (configInstance){
            return configInstance;
        }
        else{
            configInstance = new Config();
            return configInstance;
        }
    }

    /**
     * find folder config
     */
    private findFolderConfig = (): string | null => {
        let folderScript:string;
        let folderConfig:string;
    
        folderScript = path.dirname((<NodeModule> require.main).filename);

        folderConfig = path.join(folderScript, this.nameFolderConfig);
        if (fs.existsSync(folderConfig)){
            return folderConfig;
        }
    
        folderConfig = path.join(folderScript, "../", this.nameFolderConfig);
        if (fs.existsSync(folderConfig)){
            return folderConfig;
        }
    
        folderConfig = path.join(folderScript, "../../", this.nameFolderConfig);
        if (fs.existsSync(folderConfig)){
            return folderConfig;
        }
    
        return null;
    };

    /**
     * process object config
     */
    private processConfig = (node:any, prefix:any) => {
        let keys = Object.keys(node);

        for (var i = 0; i < keys.length; i++){
            try {
                let fullKey: string;
                let key: string;
                let item: any;
                let keyEnv: string;
                let envValue: any;

                key = keys[i];
                item = node[key];
    
                if (prefix){
                    fullKey = prefix + "." + key;
                }
                else{
                    fullKey = key;
                }
    
                if (typeof(item) === "object"){
                    this.configByKey[fullKey] = item;
                    this.processConfig(item, fullKey);
                }
                else{
                    keyEnv = fullKey.toUpperCase().replace(/\./g, "_");
                    envValue = process.env[keyEnv];
                    if (envValue !== undefined){
                        if (typeof(node[key]) === "boolean"){
                            if ((envValue === "true") || (envValue === "TRUE")){
                                envValue = true;
                            }
                            if ((envValue === "false") || (envValue === "FALSE")){
                                envValue = false;
                            }
                            if (envValue === "0"){
                                envValue = false;
                            }
                            if (envValue === "1"){
                                envValue = true;
                            }
                        }
                        else if (typeof(node[key]) === "number"){
                            envValue = parseInt(envValue);
                        }
    
                        this.configByKey[fullKey] = envValue;
                        node[key] = envValue;
                    }
                    else{
                        this.configByKey[fullKey] = item;
                    }
                }                
            }
            catch (errTry) {
                log.writeError("processConfig", errTry, null, __filename);
            }
        }
    }

    /**
     * Open config from file or object
     * @param fileOrObject file string or object
     */
    private open(fileOrObject: any): void {
        let filePath:string = "";
        let configFolderPath = this.findFolderConfig();
        
        if (fileOrObject){
            if (typeof(fileOrObject) === "object"){
                this.originalConfigObj = fileOrObject;
            }
            else{
                filePath = fileOrObject;
                if (fs.existsSync(filePath) === false){
                    if (configFolderPath){
                        if (fileOrObject.indexOf(".") === -1){
                            filePath = path.join(configFolderPath, fileOrObject + ".json");
                        }
                        else{
                            filePath = path.join(configFolderPath, fileOrObject);
                        }
                    }
                }
            }
        }
        else{
            if (configFolderPath){
                filePath = path.join(configFolderPath, "default.json");
            }
        }

        if (!this.originalConfigObj){
            if (filePath && fs.existsSync(filePath)){
                this.originalConfigObj = require(filePath);

                log.write(LogLevelEnum.INFO, "open", LogCodeEnum.OPENFILE.toString(), "config file [" + path.relative(process.cwd(), filePath) + "] loaded", null, __filename);
            }
            else{
                log.write(LogLevelEnum.INFO, "open", LogCodeEnum.OPENFILE.toString(), "config file not found [" + filePath + "]", null, __filename);
            }
        }

        if (this.originalConfigObj){
            this.processConfig(this.originalConfigObj, null);
            log.write(LogLevelEnum.INFO, "open", LogCodeEnum.PROCESS.toString(), "config object processed", null, __filename);
        }
        else{
            log.write(LogLevelEnum.INFO, "open", LogCodeEnum.PROCESS.toString(), "config object not processed", null, __filename);
        }
    }

    /**
     * Return value from key
     * @param key key value
     * @param defaultValue default value
     */
    get(key: string, defaultValue?: any) {
        let value:any = this.configByKey[key];
        if (value === undefined){
            return defaultValue || null;
        }
        else{
            return value;
        }

        return value;
    }
}

var configInstance: Config | null = null;