import { toHtml } from "./fsrx.js";
import { createFlags, bindControls, bindTester, bindCopy } from "./tester.js";
import { initReading } from "./reading.js";

const q = new URLSearchParams(location.search);
const flags = createFlags({ fixation: q.get("f") || "m", saccade: q.get("s") || "h", contrast: q.get("c") === "1" });
bindControls(document, flags);
bindCopy();

// one line of real output
document.getElementById("ex1").innerHTML = toHtml("Call me Ishmael.", {});

const src = document.getElementById("src");
src.value = document.getElementById("s-default").innerHTML.trim();
bindTester(document.getElementById("try"), flags);
initReading(flags, q);
