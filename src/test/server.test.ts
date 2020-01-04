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

            done();
        });
    })

    it("invoke - @webfaaslabs/mathsum:0.0.1 5", function(done){
        var commandText = "node " + path.join(__dirname, "../lib/server.js") + " invoke @webfaaslabs/mathsum:0.0.1 5";
        
        exec(commandText, (err, stdout, stderr) => {
            if (err) {
                done(err);
                return;
            }
          
            chai.expect(stdout.toString().indexOf("5undefined")).to.gt(-1);

            done();
        });
    })

    it("invoke - @webfaaslabs/mathsum:0.0.1", function(done){
        var commandText = "node " + path.join(__dirname, "../lib/server.js") + " invoke @webfaaslabs/mathsum:0.0.1";
        
        exec(commandText, (err, stdout, stderr) => {
            if (err) {
                done(err);
                return;
            }
          
            chai.expect(stdout.toString().indexOf("NaN")).to.gt(-1);

            done();
        });
    })

    it("invoke - @webfaaslabs/mathsum:0.0.1 '[2,5]' npm", function(done){
        var commandText = "node " + path.join(__dirname, "../lib/server.js") + " invoke @webfaaslabs/mathsum:0.0.1 '[2,5]'";
        
        exec(commandText, (err, stdout, stderr) => {
            if (err) {
                done(err);
                return;
            }
          
            chai.expect(stdout.toString().indexOf("invoke.response =>  7")).to.gt(-1);

            done();
        });
    })

    it("invoke - @webfaaslabs/mathsumasync:0.0.2#sum '{\"x\":2,\"y\":5}'", function(done){
        var commandText = "node " + path.join(__dirname, "../lib/server.js") + " invoke @webfaaslabs/mathsumasync:0.0.2#sum '{\"x\":2,\"y\":5}'";
        
        exec(commandText, (err, stdout, stderr) => {
            if (err) {
                done(err);
                return;
            }

            chai.expect(stdout.toString().indexOf("invoke.response =>  {")).to.gt(-1);

            done();
        });
    })

    it("invoke - error - @webfaaslabs/simulateerror", function(done){
        var commandText = "node " + path.join(__dirname, "../lib/server.js") + " invoke @webfaaslabs/simulateerror:0.0.3 '[\"file2\"]'";
        
        exec(commandText, (err, stdout, stderr) => {
            if (err) {
                done(err);
                return;
            }

            //console.log(`stdout: ${stdout}`);
            //console.log(`stderr: ${stderr}`);

            chai.expect(stdout.toString().indexOf("SyntaxError")).to.gt(-1);

            done();
        });
    })
})