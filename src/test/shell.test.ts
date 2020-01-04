import * as path from "path";
import * as chai from "chai";
import * as mocha from "mocha";
import { Core } from "../lib/Core";
import { ModuleManager } from "../lib/ModuleManager/ModuleManager";
import { ShellCommandManager } from "../lib/Shell/ShellCommandManager";
import { IShellCommand } from "../lib/Shell/IShellCommand";

const core = new Core();
const shellCommandManager = new ShellCommandManager(core);

class ShellCommandTest implements IShellCommand {
    core: Core | null = null;
    commandTrigger: string = "test";
    info: string = "info test";
    example: string = "example test";
    executeCommand(shellArgv: string[]): void {
        throw new Error("executeCommand not implemented.");
    }
}

describe("Shell", () => {
    it("print", function(){
        shellCommandManager.printInfo();
    })

    it("should return property", function(){
        let customShell = new ShellCommandTest();
        shellCommandManager.addShellCommand(customShell);
        chai.expect(shellCommandManager.getShellCommand("test")).to.eq(customShell);
        chai.expect(shellCommandManager.getShellCommand("notfound")).to.null;
        chai.expect(() => {shellCommandManager.executeShellCommand(["node", "app1", "test", "par1"])}).to.throw("executeCommand not implemented.");
    })

    it("execute - without param", async function(){
        await shellCommandManager.executeShellCommand(["node", "app1"]);
    })

    it("execute - invoke - without param", async function(){
        await shellCommandManager.executeShellCommand(["node", "app1", "invoke"]);
    })

    it("execute - notexist", async function(){
        await shellCommandManager.executeShellCommand(["node", "app1", "notexist"]);
    })
})