"use strict";

import * as http from "http";


var handleResponse = function(request: http.IncomingMessage, response: http.ServerResponse) {
    console.log(request.method + " " + request.url);
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write("ok");
    response.end();
}

const server1 = http.createServer(handleResponse);
const server2 = http.createServer(handleResponse);

server1.listen(8080);
server2.listen(8081);

console.log("listen in 8080 and 8081");