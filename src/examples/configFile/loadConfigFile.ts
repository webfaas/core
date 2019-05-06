"use strict";

import {Config} from "../../lib/Config/Config";

var config = new Config();
var config2 = Config.getInstance();
var config3 = Config.getInstance();

console.log("config", config.get("registry.requestTimeout"));

console.log("config", config.get("registry.listRemoteRegistry"));

console.log("config2", config2.get("registry.listRemoteRegistry"));

console.log("config3", config3.get("registry.listRemoteRegistry"));
