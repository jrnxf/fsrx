import { Install } from "./CopyButton.tsx";

export function How() {
  return (
    <section className="block" id="how">
      <h2>How it works</h2>
      <div className="how">
        <div className="cell">
          <h3>Options</h3>
          <p>Reads a file, or standard input.</p>
          <dl className="man">
            <dt><code>-f l|m|h</code></dt><dd>bright part of each word: 30, 50 or 70%. Default&nbsp;m.</dd>
            <dt><code>-s l|m|h</code></dt><dd>bright start on every 3rd, 2nd or every word. Default&nbsp;h.</dd>
            <dt><code>-c</code></dt><dd>bold the bright part.</dd>
            <dt><code>[PATH]</code></dt><dd>file to read; stdin if left out.</dd>
          </dl>
        </div>
        <div className="cell">
          <h3>Install</h3>
          <Install command="brew install jrnxf/tap/fsrx" />
          <Install command="cargo install fsrx" />
          <p className="small">Also in the AUR and NetBSD (<code>textproc/fsrx</code>).</p>
        </div>
        <div className="cell">
          <h3>Reading speed</h3>
          <p className="small">Studies found no reading-speed gain (<a href="https://research.vu.nl/en/publications/no-bionic-reading-does-not-work/">Snell, 2024</a>). It does shift where the eye first lands in long words (<a href="https://doi.org/10.1098/rsos.250177">Parker et al., 2026</a>).</p>
        </div>
        <div className="cell">
          <h3>Credit</h3>
          <p className="small">Inspired by, but not affiliated with, Renato Casutt's Bionic Reading.</p>
        </div>
      </div>
    </section>
  );
}
