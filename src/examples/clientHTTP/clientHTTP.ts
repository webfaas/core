"use strict";

import {ClientHTTP} from "../../lib/ClientHTTP/ClientHTTP";
import { IClientHTTPResponse } from "../../lib/ClientHTTP/IClientHTTPResponse";

var clientHTTP = ClientHTTP.getInstance();

async function requestHTTP(){
    try {
        var resp: IClientHTTPResponse = await clientHTTP.request("http://localhost:8080");
        var resp2: IClientHTTPResponse = await clientHTTP.request("http://localhost:8081");
        console.log(resp, resp2);
    }
    catch (errTry) {
        console.log("err http", errTry);
    }
}

(async function(){
    for (var i = 0; i < 50; i++){
        requestHTTP();
    }
})();