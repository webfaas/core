"use strict";

import { SmallSemver } from "../lib/Semver/SmallSemver";

const smallSemver = new SmallSemver();

let versionsArray:Array<string> = ["1.0.0", "1.1.0", "1.1.1", "1.2.0", "1.2.1", "1.3.0", "1.0.1", "1.3.1", "1.3.1-PRERELEASE1", "1.3.1-PRERELEASE2", "2.0.0", "2.1.0", "3.5.5", "3.5.4", "3.5.3", "3.5.2", "3.5.1", "3.5.0"];

console.log(smallSemver.maxSatisfying(versionsArray, "1.2.1"));