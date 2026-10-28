// fsrx's styling logic (src/main.rs), ported to JavaScript for the site.
// web/test/parity.mjs checks it byte for byte against the binary.
//
//   style_line   -> styleLine   word boundaries, saccade counter
//   style_substr -> styleSubstr grapheme split, fixation midpoint
//
// Words are UAX #29 word segments that hold at least one alphanumeric
// character, which is what unicode-segmentation's unicode_word_indices
// returns. Graphemes are extended grapheme clusters, as in
// UnicodeSegmentation::graphemes(s, true).
//
// Output is a list of runs: { t: text, k: "fix" | "dim" }.
//   fix: the start of a word that gets a fixation. Bold with -c,
//        otherwise printed as is.
//   dim: everything else (the rest of the word, skipped words, spaces
//        and punctuation). Printed with SGR 2, dim.

export type Fixation = "l" | "m" | "h";
export type Saccade = "l" | "m" | "h";
export interface Options {
  fixation?: Fixation;
  saccade?: Saccade;
  contrast?: boolean;
}
export interface Run {
  t: string;
  k: "fix" | "dim";
}

const FIXATION: Record<Fixation, number> = { h: 0.7, m: 0.5, l: 0.3 };
const SACCADE: Record<Saccade, number> = { h: 1, m: 2, l: 3 };

const graphemes = new Intl.Segmenter(undefined, { granularity: "grapheme" });
// Rust's char::is_alphanumeric: Alphabetic or Numeric (Nd, Nl, No).
const ALNUM = /[\p{Alphabetic}\p{N}]/u;

// Grapheme clusters as unicode-segmentation 1.13 cuts them. It keeps Thai
// and Lao SARA AM (U+0E33, U+0EB3) apart from the consonant before it;
// the browser joins them.
function graphemesOf(s: string): string[] {
  const out: string[] = [];
  for (const { segment: g } of graphemes.segment(s)) {
    out.push(...g.split(/(?=[\u0E33\u0EB3])/u));
  }
  return out;
}

// Word boundaries: the UAX #29 rules that unicode-segmentation implements.
// Not Intl.Segmenter, whose dictionaries join Chinese, Japanese and Thai
// characters into words that fsrx keeps apart.
const WB: [string, RegExp][] = [
  ["CR", /\r/u],
  ["LF", /\n/u],
  ["NL", /[\v\f\x85\u2028\u2029]/u],
  ["ZWJ", /\u200D/u],
  ["Extend", /[\p{Grapheme_Extend}\p{Mc}\p{Emoji_Modifier}]/u],
  ["RI", /[\u{1F1E6}-\u{1F1FF}]/u],
  ["Format", /(?![\u200B-\u200D\u0600-\u0605\u06DD\u070F\u0890\u0891\u08E2\u{110BD}\u{110CD}])\p{Cf}/u],
  ["Katakana", /[\p{Script=Katakana}\u3031-\u3035\u309B\u309C\u30A0\u30FC\uFF70]/u],
  ["Hebrew", /(?=\p{Script=Hebrew})\p{Lo}/u],
  ["SQ", /'/u],
  ["DQ", /"/u],
  ["MidNumLet", /[.\u2018\u2019\u2024\uFE52\uFF07\uFF0E]/u],
  ["MidLetter", /[:\u00B7\u0387\u055F\u05F4\u2027\uFE13\uFE55\uFF1A]/u],
  ["MidNum", /[,;\u037E\u0589\u060C\u060D\u066C\u07F8\u2044\uFE10\uFE14\uFE50\uFE54\uFF0C\uFF1B]/u],
  ["Numeric", /[\p{Nd}\u066B]/u],
  ["ExtendNumLet", /[\p{Pc}\u202F]/u],
  ["WSeg", /[ \u1680\u2000-\u2006\u2008-\u200A\u205F\u3000]/u],
  // Not ALetter: ideographs, Hiragana, and the scripts line breaking
  // treats as complex context (Thai, Lao, Myanmar, Khmer and kin).
  ["Other", /[\p{Ideographic}\p{Script=Hiragana}\p{Script=Thai}\p{Script=Lao}\p{Script=Myanmar}\p{Script=Khmer}\p{Script=Tai_Le}\p{Script=New_Tai_Lue}\p{Script=Tai_Tham}\p{Script=Tai_Viet}\p{Script=Ahom}]/u],
  ["ALetter", /[\p{Alphabetic}\u02C2-\u02C5\u02D2-\u02D7\u02DE\u02DF\u02E5-\u02EB\u02ED\u02EF-\u02FF\u055A-\u055C\u055E\u058A\u05F3\uA720\uA721\uA789\uA78A\uAB5B\uAB6A\uAB6B]/u],
];
const wbCache = new Map<string, string>();
function wb(c: string): string {
  let p = wbCache.get(c);
  if (p === undefined) {
    p = "Other";
    for (const [name, re] of WB) if (re.test(c)) { p = name; break; }
    wbCache.set(c, p);
  }
  return p;
}
const PICT = /\p{Extended_Pictographic}/u;
const EFZ = (p: string) => p === "Extend" || p === "Format" || p === "ZWJ";
const AH = (p: string) => p === "ALetter" || p === "Hebrew";
const MIDL = (p: string) => p === "MidLetter" || p === "MidNumLet" || p === "SQ";
const MIDN = (p: string) => p === "MidNum" || p === "MidNumLet" || p === "SQ";
const NLS = (p: string) => p === "CR" || p === "LF" || p === "NL";

function isBoundary(cs: string[], ps: string[], i: number): boolean {
  const a = ps[i - 1], b = ps[i];
  if (a === "CR" && b === "LF") return false; // WB3
  if (NLS(a) || NLS(b)) return true; // WB3a, WB3b
  if (a === "ZWJ" && PICT.test(cs[i])) return false; // WB3c
  if (a === "WSeg" && b === "WSeg") return false; // WB3d
  if (EFZ(b)) return false; // WB4
  // WB4: look through Extend, Format and ZWJ to the character they attach to.
  const back = (j: number) => {
    while (j > 0 && EFZ(ps[j])) j--;
    return EFZ(ps[j]) || NLS(ps[j]) ? -1 : j;
  };
  const fwd = (j: number) => {
    while (j < ps.length && EFZ(ps[j])) j++;
    return j;
  };
  const pi = back(i - 1);
  const L = pi < 0 ? "Other" : ps[pi];
  const pp = pi > 0 ? back(pi - 1) : -1;
  const LL = pp < 0 ? "Other" : ps[pp];
  const RR = ps[fwd(i + 1)];
  if (AH(L) && AH(b)) return false; // WB5
  if (AH(L) && MIDL(b) && AH(RR)) return false; // WB6
  if (AH(LL) && MIDL(L) && AH(b)) return false; // WB7
  if (L === "Hebrew" && b === "SQ") return false; // WB7a
  if (L === "Hebrew" && b === "DQ" && RR === "Hebrew") return false; // WB7b
  if (LL === "Hebrew" && L === "DQ" && b === "Hebrew") return false; // WB7c
  if (L === "Numeric" && b === "Numeric") return false; // WB8
  if (AH(L) && b === "Numeric") return false; // WB9
  if (L === "Numeric" && AH(b)) return false; // WB10
  if (LL === "Numeric" && MIDN(L) && b === "Numeric") return false; // WB11
  if (L === "Numeric" && MIDN(b) && RR === "Numeric") return false; // WB12
  if (L === "Katakana" && b === "Katakana") return false; // WB13
  if ((AH(L) || L === "Numeric" || L === "Katakana" || L === "ExtendNumLet") && b === "ExtendNumLet") return false; // WB13a
  if (L === "ExtendNumLet" && (AH(b) || b === "Numeric" || b === "Katakana")) return false; // WB13b
  if (L === "RI" && b === "RI") {
    // WB15, WB16: regional indicators pair up.
    let n = 0;
    for (let j = pi; j >= 0 && (ps[j] === "RI" || EFZ(ps[j])); j--) if (ps[j] === "RI") n++;
    return n % 2 === 0;
  }
  return true; // WB999
}

// Every word-boundary segment of a line, words and gaps alike, in order.
function* segments(line: string): Generator<string> {
  const cs = Array.from(line);
  const ps = cs.map(wb);
  let seg = cs[0] ?? "";
  for (let i = 1; i < cs.length; i++) {
    if (isBoundary(cs, ps, i)) {
      yield seg;
      seg = "";
    }
    seg += cs[i];
  }
  if (seg) yield seg;
}

function push(runs: Run[], t: string, k: Run["k"]) {
  if (!t) return;
  const last = runs[runs.length - 1];
  if (last && last.k === k) last.t += t;
  else runs.push({ t, k });
}

function styleSubstr(runs: Run[], substr: string, fixation: Fixation, isWord: boolean, saccadeHit: boolean) {
  const gs = graphemesOf(substr);
  const mid = Math.ceil(Math.fround(gs.length * Math.fround(FIXATION[fixation])));
  gs.forEach((g, i) => push(runs, g, i < mid && saccadeHit && isWord ? "fix" : "dim"));
}

// Mirrors Rust's str::lines(): split on \n, drop one trailing empty line,
// strip a \r before each \n.
export function lines(text: string): string[] {
  const out = text.split("\n");
  if (out[out.length - 1] === "") out.pop();
  return out.map((l) => (l.endsWith("\r") ? l.slice(0, -1) : l));
}

// state.iter carries the saccade counter across lines, like saccade_iter.
export function styleLine(line: string, opts: Options, state: { iter: number }): Run[] {
  const fixation = opts.fixation || "m";
  const mode = SACCADE[opts.saccade || "h"];
  const runs: Run[] = [];
  for (const seg of segments(line)) {
    const isWord = ALNUM.test(seg);
    let hit = false;
    if (isWord) {
      state.iter += 1;
      hit = state.iter % mode === 0;
    }
    styleSubstr(runs, seg, fixation, isWord, hit);
  }
  return runs;
}

// The whole input: one array of runs per output line.
export function fsrx(text: string, opts: Options = {}): Run[][] {
  const state = { iter: -1 };
  return lines(text).map((line) => styleLine(line, opts, state));
}

// Byte-for-byte what the binary prints: one escape pair per grapheme.
export function toAnsi(text: string, opts: Options = {}): string {
  const contrast = !!opts.contrast;
  return fsrx(text, opts)
    .map((runs) =>
      runs
        .map(({ t, k }) =>
          graphemesOf(t)
            .map((g) => (k === "dim" ? `\x1b[2m${g}\x1b[0m` : contrast ? `\x1b[1m${g}\x1b[0m` : g))
            .join(""),
        )
        .join("") + "\n",
    )
    .join("");
}

// The command line that matches a set of options.
export function command(opts: Options): string {
  const parts = ["fsrx"];
  if (opts.contrast) parts.push("-c");
  if (opts.fixation && opts.fixation !== "m") parts.push(`-f${opts.fixation}`);
  if (opts.saccade && opts.saccade !== "h") parts.push(`-s${opts.saccade}`);
  return parts.join(" ");
}
