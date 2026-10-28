import { useState } from "react";
import { Install } from "./CopyButton.tsx";
import { DEFAULT_TEXT } from "./default-text.ts";
import { Eye } from "./Eye.tsx";
import { How } from "./How.tsx";
import { fsrx, type Options } from "./fsrx.ts";
import { Reading } from "./Reading.tsx";
import { Runs } from "./Runs.tsx";
import { ThemeToggle } from "./ThemeToggle.tsx";
import { Try } from "./Try.tsx";

type Flags = Required<Options>;

const HERO = fsrx("Call me Ishmael.");

export function App() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [flags, setFlags] = useState<Flags>({ fixation: "m", saccade: "h", contrast: false });
  const patch = (next: Partial<Flags>) => setFlags((f) => ({ ...f, ...next }));

  return (
    <div className="wrap">
      <header className="top">
        <a className="wm" href="#">
          <span className="fx">fs</span>
          <span className="dm">rx</span>
        </a>
        <nav>
          <a href="#try">try it</a>
          <a href="#scroll" className="wide">scrolling</a>
          <a href="#how" className="wide">how it works</a>
          <a href="https://github.com/jrnxf/fsrx" className="wide">source</a>
          <ThemeToggle />
        </nav>
      </header>
      <div className="rule2"></div>

      <section className="plate">
        <figure className="eye">
          <Eye />
          <figcaption>
            Fig. 1. The fovea, where sight is sharpest, spans about 6 to 8 letters at reading distance (
            <a href="https://doi.org/10.1037/0033-2909.124.3.372">Rayner, 1998</a>).
          </figcaption>
        </figure>
        <div>
          <p className="sc" style={{ color: "var(--soft)", margin: "0 0 10px" }}>Flow state reading in the terminal</p>
          <h1>fsrx dims the end of each word.</h1>
          <p className="lede">
            Give it a file or pipe text in. It prints each word with the first part at full strength and the rest dimmed. Add <code>-c</code> and the first part is bold.
          </p>
          <div className="term" aria-label="Example output">
            <div><span className="pr">$</span> echo "Call me Ishmael." | fsrx</div>
            <div className="out"><Runs lines={HERO} /></div>
          </div>
          <Install command="brew install jrnxf/tap/fsrx" />
        </div>
      </section>

      <Try text={text} onText={setText} flags={flags} onFlags={patch} />

      <section className="block" id="scroll">
        <h2>Scrolling</h2>
        <p className="intro">
          The text from Try it, scrolling past a fixed line. In a terminal you scroll it yourself with <code>fsrx notes.txt | less -R</code>.
        </p>
        <Reading text={text} flags={flags} />
      </section>

      <How />

      <footer>
        <p>
          fsrx by Colby Thomas, MIT licence. <a href="https://github.com/jrnxf/fsrx">Source</a>, <a href="https://crates.io/crates/fsrx">crates.io</a>.
        </p>
        <p>
          Set in IM Fell English and Libre Caslon Text, under the SIL Open Font Licence (<a href="/fonts/IMFellEnglish-OFL.txt">IM Fell</a>, <a href="/fonts/LibreCaslonText-OFL.txt">Libre Caslon</a>). The examples run a JavaScript port of fsrx whose output matches the binary byte for byte.
        </p>
      </footer>
    </div>
  );
}
