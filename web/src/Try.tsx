import { useMemo } from "react";
import { Runs } from "./Runs.tsx";
import { Seg } from "./Seg.tsx";
import { command, fsrx, type Fixation, type Options, type Saccade } from "./fsrx.ts";

const LMH = ["l", "m", "h"] as const;

type Flags = Required<Options>;

export function Try({
  text,
  onText,
  flags,
  onFlags,
}: {
  text: string;
  onText: (next: string) => void;
  flags: Flags;
  onFlags: (patch: Partial<Flags>) => void;
}) {
  const lines = useMemo(() => fsrx(text, flags), [text, flags]);
  return (
    <section className="block" id="try">
      <h2>Try it</h2>
      <div className="try">
        <div className="panel">
          <label htmlFor="src">Text</label>
          <textarea id="src" spellCheck={false} value={text} onChange={(e) => onText(e.target.value)}></textarea>
          <span className="k">Fixation, -f</span>
          <Seg<Fixation> options={LMH} value={flags.fixation} onChange={(fixation) => onFlags({ fixation })} />
          <span className="k">Saccade, -s</span>
          <Seg<Saccade> options={LMH} value={flags.saccade} onChange={(saccade) => onFlags({ saccade })} />
          <span className="k">Contrast, -c</span>
          <span className="seg">
            <button aria-pressed={flags.contrast} onClick={() => onFlags({ contrast: !flags.contrast })}>
              bold
            </button>
          </span>
        </div>
        <div>
          <p className="cmd">
            <span className="pr">$</span> <code>{command(flags)}</code>
          </p>
          <p className={flags.contrast ? "tryout contrast" : "tryout"} aria-live="polite">
            <Runs lines={lines} />
          </p>
        </div>
      </div>
    </section>
  );
}
