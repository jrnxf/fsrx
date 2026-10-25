import { toHtml } from "./fsrx.js";
import { createFlags, bindControls, bindTester, bindCopy } from "./tester.js";
import { initReading } from "./reading.js";

const flags = createFlags();
bindControls(document, flags);
bindCopy();

// one line of real output
document.getElementById("ex1").innerHTML = toHtml("Call me Ishmael.", {});

const src = document.getElementById("src");
src.value = document.getElementById("s-default").innerHTML.trim();
bindTester(document.getElementById("try"), flags);
initReading(flags);
