import * as path from "path";
import * as chai from "chai";
import * as mocha from "mocha";
import { Core } from "../lib/Core";
import { ModuleManager } from "../lib/ModuleManager/ModuleManager";
import { ShellCommandManager } from "../lib/Shell/ShellCommandManager";
import { IShellCommand } from "../lib/Shell/IShellCommand";
import { PackageRegistryMock } from "./mocks/PackageRegistryMock";

const core = new Core();
core.getModuleManager().getPackageStoreManager().getPackageRegistryManager().addRegistry("REGISTRY1", "", new PackageRegistryMock.PackageRegistry1());

const shellCommandManager = new ShellCommandManager(core);

const logArray: Array<string> = new Array<string>();

shellCommandManager.printLog = function(type: string, message: any): void{
    if (typeof(message) === "object"){
        logArray.push(type + "@" + JSON.stringify(message));
    }
    else{
        logArray.push(type + "@" + message);
    }
}

class ShellCommandTest implements IShellCommand {
    core: Core | null = null;
    commandTrigger: string = "test";
    info: string = "info test";
    example: string = "example test";
    executeCommand(shellArgv: string[]): Promise<any> {
        return new Promise((resolve, reject) => {
            reject(new Error("executeCommand not implemented."));
        });
    }
}

class ShellCommandError implements IShellCommand {
    core: Core | null = null;
    commandTrigger: string = "test";
    info: string = "info test";
    example: string = "example test";
    executeCommand(shellArgv: string[]): Promise<any> {
        throw new Error("executeCommand error.");
    }
}

describe("Shell", () => {
    it("print", function(){
        shellCommandManager.printInfo();
    })

    it("execute - notfound", async function(){
        chai.expect(shellCommandManager.getShellCommand("notfound")).to.null;
        chai.expect(logArray[logArray.length -1]).to.eq("@INVOKE [MODULE] [PARAMETERS] [REGISTRYNAME]\n");
    })

    it("execute - without param", async function(){
        await shellCommandManager.executeShellCommand(["node", "app1"]);
        chai.expect(logArray[logArray.length -1]).to.eq("@INVOKE [MODULE] [PARAMETERS] [REGISTRYNAME]\n");
    })

    it("execute - notexist", async function(){
        await shellCommandManager.executeShellCommand(["node", "app1", "notexist"]);
        chai.expect(logArray[logArray.length -1]).to.eq("@INVOKE [MODULE] [PARAMETERS] [REGISTRYNAME]\n");
    })
})

describe("Shell - test", () => {
    it("should return property", async function(){
        let customShell = new ShellCommandTest();
        shellCommandManager.addShellCommand(customShell);
        chai.expect(shellCommandManager.getShellCommand("test")).to.eq(customShell);

        try {
            await shellCommandManager.executeShellCommand(["node", "app1", "test", "par1"]);    
            throw new Error("sucess");
        }
        catch (errTry) {
            chai.expect(errTry.message).to.eq("executeCommand not implemented.");
        }
    })
})

describe("Shell - error", () => {
    it("should return property", async function(){
        let customShell = new ShellCommandError();
        shellCommandManager.addShellCommand(customShell);
        
        try {
            await shellCommandManager.executeShellCommand(["node", "app1", "test", "par1"]);
            throw new Error("sucess");
        }
        catch (errTry) {
            chai.expect(errTry.message).to.eq("executeCommand error.");
        }
    })
})

describe("Shell - Invoke", () => {
    it("execute - invoke - without param", async function(){
        await shellCommandManager.executeShellCommand(["node", "app1", "invoke"]);
        chai.expect(logArray[logArray.length -1]).to.eq("RESPONSE@undefined");
    })

    it("execute - invoke - @registry1/mathsum", async function(){
        try {
            await shellCommandManager.executeShellCommand(["node", "app1", "invoke", "@registry1/mathsum"]);
            chai.expect("catch").to.null;
        }
        catch (errTry) {
            chai.expect(errTry.message).to.eq("PackageRegistryManagerItem not available");
        }
    })

    it("execute - invoke - @registry1/mathsum [5,3] registry1", async function(){
        await shellCommandManager.executeShellCommand(["node", "app1", "invoke", "@registry1/mathsum", "[5,3]", "registry1"]);
        chai.expect(logArray[logArray.length -1]).to.eq("RESPONSE@8");
    })

    it("execute - invoke - @registry1/mathsum [5,3] registry1", async function(){
        await shellCommandManager.executeShellCommand(["node", "app1", "invoke", "@registry1/mathsum", "5", "registry1"]);
        chai.expect(logArray[logArray.length -1]).to.eq("RESPONSE@5undefined");
    })

    it("execute - invoke - @registry1/mathsumasync {x:5,y:3} registry1", async function(){
        await shellCommandManager.executeShellCommand(["node", "app1", "invoke", "@registry1/mathsumasync", '{"x":5,"y":3}', "registry1"]);
        chai.expect(logArray[logArray.length -1]).to.eq("RESPONSE@{}");
    })
})