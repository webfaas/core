import * as chai from "chai";

import * as fs from "fs";
import * as path from "path";
import * as http from "http";
import * as https from "https";
import { ClientHTTP } from "../lib/ClientHTTP/ClientHTTP";
import { IClientHTTPResponse } from "../lib/ClientHTTP/IClientHTTPResponse";
import { ClientHTTPConfig } from "../lib/ClientHTTP/ClientHTTPConfig";
import { Log } from "../lib/Log/Log";
import { LogLevelEnum } from "../lib/Log/ILog";

var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

var handleResponse = function(request: http.IncomingMessage, response: http.ServerResponse) {
    var method: string = request.method || "get";
    method = method.toUpperCase();

    if (request.url === "/timeout"){
        setTimeout(() => {
            response.writeHead(200, {"Content-Type": "text/html"});
            response.write(method + "_OK");
            response.end();
        }, 60);
    }
    else if (request.url === "/headers"){
        setTimeout(() => {
            response.writeHead(200, {"Content-Type": "text/html", "x-test": request.headers["x-test"]});
            response.write(method + "_OK");
            response.end();
        }, 60);
    }
    else if (request.url === "/destroy"){
        response.destroy();
    }
    else{
        response.writeHead(200, {"Content-Type": "text/html"});
        response.write(method + "_OK");
        response.end();
    }
}

describe("HTTP", () => {
    var serverPort = 50090;

    var clientHTTP1 = new ClientHTTP(new ClientHTTPConfig(), log);
    var config2 = new ClientHTTPConfig();
    config2.timeout = 10;
    var clientHTTP2 = new ClientHTTP(config2, log);
    var clientHTTP_destroy = new ClientHTTP(new ClientHTTPConfig(), log);
    var clientHTTP_default = new ClientHTTP();

    it("should return response on call", function(done){
        var server1: http.Server | null = null;

        server1 = http.createServer(handleResponse);
        server1.listen(serverPort, async function(){
            try {
                var resp: IClientHTTPResponse = await clientHTTP1.request("http://localhost:" + serverPort);
                chai.expect(resp.statusCode).to.eq(200);
                chai.expect(resp.data.toString()).to.eq("GET_OK");
                chai.expect(resp.headers["content-type"]).to.eq("text/html");
    
                var resp2: IClientHTTPResponse = await clientHTTP1.request("http://localhost:" + serverPort, "POST", Buffer.from("test"));
                chai.expect(resp2.statusCode).to.eq(200);
                chai.expect(resp2.data.toString()).to.eq("POST_OK");
                chai.expect(resp2.headers["content-type"]).to.eq("text/html");

                var resp3: IClientHTTPResponse = await clientHTTP1.request("http://localhost:" + serverPort + "/headers", undefined, undefined, {"x-test":"value-test"});
                chai.expect(resp3.statusCode).to.eq(200);
                chai.expect(resp3.data.toString()).to.eq("GET_OK");
                chai.expect(resp3.headers["content-type"]).to.eq("text/html");
                chai.expect(resp3.headers["x-test"]).to.eq("value-test");

                try {
                    var resp: IClientHTTPResponse = await clientHTTP_destroy.request("http://localhost:" + serverPort + "/destroy");
                    throw new Error("Sucess!");
                }
                catch (errTryDestroy) {
                    chai.expect(errTryDestroy.code).to.eq("ECONNRESET");
                }

                try {
                    let logCrash = new Log();
                    let clientHTTP_simulate_crash1 = new ClientHTTP(new ClientHTTPConfig(), logCrash);
                    logCrash.write = function(){
                        throw new Error("Crash");
                    }
                    var resp: IClientHTTPResponse = await clientHTTP_simulate_crash1.request("http://localhost:" + serverPort);
                    throw new Error("Sucess!");
                }
                catch (errTryCrash) {
                    chai.expect(errTryCrash.message).to.eq("Crash");
                }
    
                try {
                    var resp4: IClientHTTPResponse = await clientHTTP2.request("http://localhost:" + serverPort + "/timeout");
    
                    throw new Error("should error timeout");
                }
                catch (errTryTimeout) {
                    chai.expect(errTryTimeout.code).to.eq("ECONNRESET");
                }

                clientHTTP1.destroy();
                var resp5: IClientHTTPResponse = await clientHTTP1.request("http://localhost:" + serverPort);
                chai.expect(resp5.statusCode).to.eq(200);
                chai.expect(resp5.data.toString()).to.eq("GET_OK");
                chai.expect(resp5.headers["content-type"]).to.eq("text/html");

                clientHTTP1.destroy();
                clientHTTP2.destroy();
                //force destroy again
                clientHTTP1.destroy();
                clientHTTP2.destroy();
            }
            catch (errTry) {
                chai.expect(errTry).to.null;
            }
            finally{
                if (server1){
                    server1.close(function(errClose){
                        done();
                    });
                }
                else{
                    done();
                }
            }

        });
    });
})

describe("HTTPS IGNORE", () => {
    var serverPort = 50092;

    var serverOptionsHTTPS = {
        key: fs.readFileSync(path.join(__dirname, "./data/crt/key.pem")),
        cert: fs.readFileSync(path.join(__dirname, "./data/crt/cert.pem"))
    };

    var config1 = new ClientHTTPConfig();
    config1.rejectUnauthorized = false;
    var clientHTTP1 = new ClientHTTP(config1, log);
    
    var config2 = new ClientHTTPConfig();
    config2.timeout = 10;
    config2.rejectUnauthorized = false;
    var clientHTTP2 = new ClientHTTP(config2, log);

    it("should return response on call", function(done){
        var server1: https.Server | null = null;

        server1 = https.createServer(serverOptionsHTTPS, handleResponse);
        server1.listen(serverPort, async function(){
            try {
                var resp: IClientHTTPResponse = await clientHTTP1.request("https://localhost:" + serverPort);
                chai.expect(resp.statusCode).to.eq(200);
                chai.expect(resp.data.toString()).to.eq("GET_OK");
                chai.expect(resp.headers["content-type"]).to.eq("text/html");
    
                var resp2: IClientHTTPResponse = await clientHTTP1.request("https://localhost:" + serverPort, "POST", Buffer.from("test"));
                chai.expect(resp2.statusCode).to.eq(200);
                chai.expect(resp2.data.toString()).to.eq("POST_OK");
                chai.expect(resp2.headers["content-type"]).to.eq("text/html");

                var resp3: IClientHTTPResponse = await clientHTTP1.request("https://localhost:" + serverPort + "/headers", undefined, undefined, {"x-test":"value-test"});
                chai.expect(resp3.statusCode).to.eq(200);
                chai.expect(resp3.data.toString()).to.eq("GET_OK");
                chai.expect(resp3.headers["content-type"]).to.eq("text/html");
                chai.expect(resp3.headers["x-test"]).to.eq("value-test");
    
                try {
                    var resp4: IClientHTTPResponse = await clientHTTP2.request("https://localhost:" + serverPort + "/timeout");
    
                    throw new Error("should error timeout");
                }
                catch (errTryTimeout) {
                    chai.expect(errTryTimeout.code).to.eq("ECONNRESET");
                }

                clientHTTP1.destroy();
                var resp5: IClientHTTPResponse = await clientHTTP1.request("https://localhost:" + serverPort);
                chai.expect(resp5.statusCode).to.eq(200);
                chai.expect(resp5.data.toString()).to.eq("GET_OK");
                chai.expect(resp5.headers["content-type"]).to.eq("text/html");

                clientHTTP1.destroy();
                clientHTTP2.destroy();
            }
            catch (errTry) {
                chai.expect(errTry).to.null;
            }
            finally{
                if (server1){
                    server1.close(function(errClose){
                        done();
                    });
                }
                else{
                    done();
                }
            }

        });
    });
})

describe("HTTPS CERTIFICATE", () => {
    var serverPort = 50094;

    var serverOptionsHTTPS = {
        key: fs.readFileSync(path.join(__dirname, "./data/crt/key.pem")),
        cert: fs.readFileSync(path.join(__dirname, "./data/crt/cert.pem"))
    };

    var ca = fs.readFileSync(path.join(__dirname, "./data/crt/cert.pem"));

    var config1 = new ClientHTTPConfig();
    config1.rejectUnauthorized = true;
    config1.ca = ca;

    var clientHTTP1 = new ClientHTTP(config1, log);
    
    var config2 = new ClientHTTPConfig();
    config2.timeout = 10;
    config2.rejectUnauthorized = true;
    config2.ca = ca;
    var clientHTTP2 = new ClientHTTP(config2, log);

    var config3 = new ClientHTTPConfig();
    config3.rejectUnauthorized = true;
    var clientHTTP3 = new ClientHTTP(config3, log);
    
    it("should return response on call", function(done){
        var server1: https.Server | null = null;

        server1 = https.createServer(serverOptionsHTTPS, handleResponse);
        server1.listen(serverPort, async function(){
            try {
                var resp: IClientHTTPResponse = await clientHTTP1.request("https://localhost:" + serverPort);
                chai.expect(resp.statusCode).to.eq(200);
                chai.expect(resp.data.toString()).to.eq("GET_OK");
                chai.expect(resp.headers["content-type"]).to.eq("text/html");
    
                var resp2: IClientHTTPResponse = await clientHTTP1.request("https://localhost:" + serverPort, "POST", Buffer.from("test"));
                chai.expect(resp2.statusCode).to.eq(200);
                chai.expect(resp2.data.toString()).to.eq("POST_OK");
                chai.expect(resp2.headers["content-type"]).to.eq("text/html");

                var resp3: IClientHTTPResponse = await clientHTTP1.request("https://localhost:" + serverPort + "/headers", undefined, undefined, {"x-test":"value-test"});
                chai.expect(resp3.statusCode).to.eq(200);
                chai.expect(resp3.data.toString()).to.eq("GET_OK");
                chai.expect(resp3.headers["content-type"]).to.eq("text/html");
                chai.expect(resp3.headers["x-test"]).to.eq("value-test");
                
                try {
                    var resp4: IClientHTTPResponse = await clientHTTP2.request("https://localhost:" + serverPort + "/timeout");
    
                    throw new Error("should error timeout");
                }
                catch (errTryTimeout) {
                    chai.expect(errTryTimeout.code).to.eq("ECONNRESET");
                }

                clientHTTP1.destroy();
                var resp5: IClientHTTPResponse = await clientHTTP1.request("https://localhost:" + serverPort);
                chai.expect(resp5.statusCode).to.eq(200);
                chai.expect(resp5.data.toString()).to.eq("GET_OK");
                chai.expect(resp5.headers["content-type"]).to.eq("text/html");

                try {
                    var resp6: IClientHTTPResponse = await clientHTTP3.request("https://localhost:" + serverPort);

                    throw new Error("should error certificate");
                }
                catch (errTryCertificate) {
                    chai.expect(errTryCertificate.code).to.eq("DEPTH_ZERO_SELF_SIGNED_CERT");
                }

                clientHTTP1.destroy();
                clientHTTP2.destroy();
                clientHTTP3.destroy();
            }
            catch (errTry) {
                chai.expect(errTry).to.null;
            }
            finally{
                if (server1){
                    server1.close(function(errClose){
                        done();
                    });
                }
                else{
                    done();
                }
            }

        });
    });
})

describe("HTTP - Force Error In Response", () => {
    var serverPort = 50096;
    var log = new Log();
    var clientHTTP1 = new ClientHTTP(new ClientHTTPConfig(), log);
    log.write = function(level:LogLevelEnum, method:string, code:string, message:string, detail?:any, filename?:string, invokeContext?:any){
        if (method === "request" && code === "PROCESS" && message === "reponse"){
            throw new Error("Error in response");
        }
    }

    it("should return error in response on call", function(done){
        var server1: http.Server | null = null;

        server1 = http.createServer(handleResponse);
        server1.listen(serverPort, async function(){
            try {
                var resp: IClientHTTPResponse = await clientHTTP1.request("http://localhost:" + serverPort);
                chai.expect(resp).to.eq(null);
                
                clientHTTP1.destroy();
            }
            catch (errTry) {
                chai.expect(errTry.message).to.eq("Error in response");
                clientHTTP1.destroy();
            }
            finally{
                if (server1){
                    server1.close(function(errClose){
                        done();
                    });
                }
                else{
                    done();
                }
            }
        });
    });

    it("should return error in request HTTP", function(done){
        var server1: http.Server | null = null;

        server1 = http.createServer(handleResponse);
        server1.listen(serverPort, async function(){
            try {
                var resp: IClientHTTPResponse = await clientHTTP1.request("http://:" + serverPort);
                chai.expect(resp).to.eq(null);
                
                clientHTTP1.destroy();
            }
            catch (errTry) {
                chai.expect(errTry.code).to.eq("ENOTFOUND");
                clientHTTP1.destroy();
            }
            finally{
                if (server1){
                    server1.close(function(errClose){
                        done();
                    });
                }
                else{
                    done();
                }
            }
        });
    });

    it("should return error in request HTTPS", function(done){
        var server1: http.Server | null = null;

        server1 = http.createServer(handleResponse);
        server1.listen(serverPort, async function(){
            try {
                var resp: IClientHTTPResponse = await clientHTTP1.request("https://:" + serverPort);
                chai.expect(resp).to.eq(null);
                
                clientHTTP1.destroy();
            }
            catch (errTry) {
                chai.expect(errTry.code).to.eq("ENOTFOUND");
                clientHTTP1.destroy();
            }
            finally{
                if (server1){
                    server1.close(function(errClose){
                        done();
                    });
                }
                else{
                    done();
                }
            }
        });
    });
})