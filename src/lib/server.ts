import { Core } from "./Core";
import { ShellCommandManager } from "./Shell/ShellCommandManager";

(async function(){
    let core = new Core();
    let shellCommandManager = new ShellCommandManager(core);
    await core.start();
    shellCommandManager.executeShellCommand(process.argv);
})();