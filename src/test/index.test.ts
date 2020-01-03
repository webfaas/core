import * as path from "path";
import * as chai from "chai";
import * as mocha from "mocha";
import { Core } from "../lib/index";
import { ModuleManager } from "../lib/ModuleManager/ModuleManager";
import { exec } from "child_process";

describe("Core", () => {
    it("constructor - default", function(){
        var core = new Core();
        chai.expect(typeof core.getModuleManager()).to.eq("object");
    })

    it("constructor - moduleManager", function(){
        var moduleManager: ModuleManager = new ModuleManager();
        var core = new Core(moduleManager);
        chai.expect(core.getModuleManager()).to.eq(moduleManager);
    })
})

describe("Core - Shell", () => {
    it("without param", function(done){
        var commandText = "node " + path.join(__dirname, "../lib/index.js");
        
        exec(commandText, (err, stdout, stderr) => {
            if (err) {
                done(err);
                return;
            }
          
            done();
        });
    })

    it("invoke - without param", function(done){
        var commandText = "node " + path.join(__dirname, "../lib/index.js") + " invoke";
        
        exec(commandText, (err, stdout, stderr) => {
            if (err) {
                done(err);
                return;
            }
          
            //console.log(`stdout: ${stdout}`);
            //console.log(`stderr: ${stderr}`);
            //chai.expect(typeof core.getModuleManager()).to.eq("object");

            done();
        });
    })

    it("invoke - @webfaaslabs/mathsum:0.0.1 5", function(done){
        var commandText = "node " + path.join(__dirname, "../lib/index.js") + " invoke @webfaaslabs/mathsum:0.0.1 5";
        
        exec(commandText, (err, stdout, stderr) => {
            if (err) {
                done(err);
                return;
            }
          
            chai.expect(stdout.toString().indexOf("5undefined") > -1).to.eq(true);

            done();
        });
    })

    it("invoke - @webfaaslabs/mathsum:0.0.1 '[2,5]' npm", function(done){
        var commandText = "node " + path.join(__dirname, "../lib/index.js") + " invoke @webfaaslabs/mathsum:0.0.1 '[2,5]'";
        
        exec(commandText, (err, stdout, stderr) => {
            if (err) {
                done(err);
                return;
            }
          
            chai.expect(stdout.toString().indexOf("invoke.response =>  7") > -1).to.eq(true);

            done();
        });
    })

    it("invoke - invoke @webfaaslabs/mathsumasync:0.0.2#sum '{\"x\":2,\"y\":5}'", function(done){
        var commandText = "node " + path.join(__dirname, "../lib/index.js") + " invoke @webfaaslabs/mathsumasync:0.0.2#sum '{\"x\":2,\"y\":5}'";
        
        exec(commandText, (err, stdout, stderr) => {
            if (err) {
                done(err);
                return;
            }

            chai.expect(stdout.toString().indexOf("invoke.response =>  {") > -1).to.eq(true);

            done();
        });
    })
})