import * as path from "path";
import * as chai from "chai";
import * as mocha from "mocha";
import { Core } from "../lib/Core";
import { ModuleManager } from "../lib/ModuleManager/ModuleManager";
import { exec } from "child_process";

describe("Server - Shell", () => {
    it("without param", function(done){
        var commandText = "node " + path.join(__dirname, "../lib/server.js");
        
        exec(commandText, (err, stdout, stderr) => {
            if (err) {
                done(err);
                return;
            }
          
            done();
        });
    })

    it("invoke - without param", function(done){
        var commandText = "node " + path.join(__dirname, "../lib/server.js") + " invoke";
        
        exec(commandText, (err, stdout, stderr) => {
            if (err) {
                done(err);
                return;
            }
          
            //console.log(`stdout: ${stdout}`);
            //console.log(`stderr: ${stderr}`);
            chai.expect(stdout.toString().indexOf("PROCESS")).to.gt(-1);
            
            done();
        });
    })

    /*
    it("invoke - @webfaaslabs/mathsum:0.0.1", function(done){
        var commandText = "node " + path.join(__dirname, "../lib/server.js") + " invoke @webfaaslabs/mathsum:0.0.1 5";
        
        exec(commandText, (err, stdout, stderr) => {
            if (err) {
                done(err);
                return;
            }
          
            chai.expect(stdout.toString().indexOf("PackageRegistryManager not configured")).to.gt(-1);

            done();
        });
    })
    */
})