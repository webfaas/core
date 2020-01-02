import * as fs from "fs";
import * as path from "path";
import { Log } from "../Log/Log";
import { LogLevelEnum, LogCodeEnum } from "../Log/ILog";

const valueEnvironmentRegex = /\${[a-zA-Z0-9_:]*}/g

/**
 * Configuration. Automatic search file config and load
 */
export class Config {
    private originalConfigObj: any;
    private configByKey: any;
    private log: Log;

    /**
     * 
     * @param fileOrObject file string or object
     */
    constructor(fileOrObject?: any, log?: Log) {
        this.originalConfigObj = null;
        this.configByKey = {};
        this.log = log || Log.getInstance();

        this.open(fileOrObject);
        /*
        try {
            this.open(fileOrObject);
        }
        catch (errTry) {
            this.log.writeError("constructor", errTry, null, __filename);
        }
        */
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
     * parse value. ex: environment variables
     */
    private parseValue(value: any){
        if (typeof(value) === "object"){
            return value;
        }
        else if (typeof(value) === "string"){
            let valueText: string = value.toString();
            let selfLog = this.log;

            let valueTextParsed: string = valueText.replace(valueEnvironmentRegex, function(matchText: string, ...args: any[]) {
                let keyEnvArray = matchText.substring(2, matchText.length - 1).split(":");
                let keyEnv: string = keyEnvArray[0];
                let keyEnvDefaultValue = keyEnvArray[1] || "";

                let envValue: any = process.env[keyEnv];
                if (envValue){
                    selfLog.write(LogLevelEnum.DEBUG, "parseValue", LogCodeEnum.PROCESS.toString(), "keyEnv: " + keyEnv + ", envValue: " + envValue, null, __filename);
                    return envValue;
                }
                else{
                    return keyEnvDefaultValue;
                }
            });
            
            return valueTextParsed;
        }
        else{
            return value;
        }
    }

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
                item = this.parseValue(node[key]);
                node[key] = item;
    
                if (prefix){
                    fullKey = prefix + "." + key;
                }
                else{
                    fullKey = key;
                }

                this.configByKey[fullKey] = item;
    
                if (typeof(item) === "object"){
                    this.processConfig(item, fullKey);
                }
                else if (typeof(item) === "string"){
                    
                }
                else{
                    this.configByKey[fullKey] = item;
                }                
            }
            catch (errTry) {
                this.log.writeError("processConfig", errTry, null, __filename);
            }
        }
    }

    /**
     * Open config from file or object
     * @param fileOrObject file string or object
     */
    private open(fileOrObject: any): void {
        if (!fileOrObject){
            fileOrObject = path.join(path.dirname((<NodeModule> require.main).filename), "data-config");
        }

        if (typeof(fileOrObject) === "object"){
            this.originalConfigObj = fileOrObject;
        }
        else{
            let filePath:string = fileOrObject;
            try {
                let stats: fs.Stats = fs.statSync(filePath);

                if (stats.isDirectory()){
                    filePath = path.join(filePath, "default.json");
                }

                this.originalConfigObj = require(filePath);

                this.log.write(LogLevelEnum.INFO, "open", LogCodeEnum.OPENFILE.toString(), "config file [" + filePath + "] loaded", null, __filename);
            }
            catch (errTry) {
                if (errTry.code === "ENOENT"){
                    this.log.write(LogLevelEnum.INFO, "open", LogCodeEnum.OPENFILE.toString(), "config file not found [" + filePath + "]", null, __filename);
                }
                else{
                    this.log.writeError("open", errTry, null, __filename);
                }
            }
        }

        if (this.originalConfigObj){
            this.processConfig(this.originalConfigObj, null);
            this.log.write(LogLevelEnum.INFO, "open", LogCodeEnum.PROCESS.toString(), "config object processed", null, __filename);
        }
        else{
            this.log.write(LogLevelEnum.INFO, "open", LogCodeEnum.PROCESS.toString(), "config object not processed", null, __filename);
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
    }
}

var configInstance: Config | null = null;