"use strict";

import {Log} from "../../lib/Log/Log";
import { LogLevelEnum } from "../../lib//Log/ILog";

var log = new Log();
var log2 = Log.getInstance();

log.changeCurrentLevel(LogLevelEnum.ERROR);
log.write(LogLevelEnum.INFO, __filename, "teste1", "message1");
log2.write(LogLevelEnum.INFO, __filename, "teste2", "message2");
log2.write(LogLevelEnum.ERROR, __filename, "teste2", "message3");

