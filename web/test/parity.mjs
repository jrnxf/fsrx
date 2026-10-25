// Checks the site's JavaScript port of fsrx against the real binary: every
// combination of -c, -f and -s on a fixed set of inputs must print exactly
// the same bytes.
//
//   cargo build --release
//   node web/test/parity.mjs target/release/fsrx

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { toAnsi } from "../public/js/fsrx.js";

const bin = process.argv[2];
if (!bin) {
  console.error("usage: node web/test/parity.mjs <path to fsrx binary>");
  process.exit(2);
}

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const tmp = mkdtempSync(join(tmpdir(), "fsrx-parity-"));

// Random lines mixing scripts, emoji, marks and punctuation, from a fixed seed.
const POOL = [
  ..."abcdefghijklmnopqrstuvwxyz ABCXYZ .,;:'\"!?-_/()[]{}0123456789\t",
  "é", "e\u0301", "ç", "ß", "ñ", "Ж", "д", "λ", "Ω", "日", "本", "の", "カ", "タ", "한", "글", "ก", "ำ", "ม่",
  "ب", "ع", "א", "👍", "👍🏽", "👨\u200d👩\u200d👧", "🇵🇹", "❤️", "\u200b", "\u200d", "’", "½", "²", "Ⅻ", "١", "\u2010", "\u2014", "\u2026",
  "@", "#", "$", "%", "&", "*", "+", "=", "~", "`", "\u00a0",
];
function fuzz(seed) {
  let s = seed;
  const rnd = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
  const lines = [];
  for (let i = 0; i < 400; i++) {
    let line = "";
    const n = 1 + Math.floor(rnd() * 40);
    for (let j = 0; j < n; j++) line += POOL[Math.floor(rnd() * POOL.length)];
    lines.push(line);
  }
  const path = join(tmp, `fuzz-${seed}.txt`);
  writeFileSync(path, lines.join("\n") + "\n");
  return path;
}

const inputs = [
  join(here, "fixtures", "corpus.txt"),
  join(here, "fixtures", "crlf.txt"),
  join(root, "README.md"),
  ...[7, 11, 23, 99, 1234].map(fuzz),
];

let pass = 0;
let fail = 0;
for (const file of inputs) {
  const text = readFileSync(file, "utf8");
  for (const c of [false, true])
    for (const f of "lmh")
      for (const s of "lmh") {
        const args = [...(c ? ["-c"] : []), "-f", f, "-s", s, file];
        const want = execFileSync(bin, args, { maxBuffer: 1 << 28 }).toString();
        const got = toAnsi(text, { contrast: c, fixation: f, saccade: s });
        if (got === want) {
          pass++;
          continue;
        }
        fail++;
        const w = want.split("\n");
        const g = got.split("\n");
        const i = w.findIndex((line, k) => line !== g[k]);
        console.error(`mismatch: fsrx ${args.join(" ")} (line ${i + 1})`);
        console.error(`  binary: ${JSON.stringify(w[i])}`);
        console.error(`  port:   ${JSON.stringify(g[i])}`);
      }
}
console.log(`${pass} of ${pass + fail} runs match the binary`);
process.exit(fail ? 1 : 0);
