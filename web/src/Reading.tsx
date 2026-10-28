import { useEffect, useMemo, useRef, useState } from "react";
import { Runs } from "./Runs.tsx";
import { Seg } from "./Seg.tsx";
import { fsrx, type Options } from "./fsrx.ts";

const SPEEDS = { slow: 18, medium: 30, fast: 48 };
type Speed = keyof typeof SPEEDS;
type Mode = "fsrx" | "plain";

const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// The Try it text, scrolling up past a fixed reading line.
export function Reading({ text, flags }: { text: string; flags: Options }) {
  const [speed, setSpeed] = useState<Speed>("medium");
  const [mode, setMode] = useState<Mode>("fsrx");
  const slip = useRef<HTMLDivElement>(null);
  const roll = useRef<HTMLDivElement>(null);
  const txt = useRef<HTMLParagraphElement>(null);
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const lines = useMemo(() => (mode === "fsrx" ? fsrx(text, flags) : []), [mode, text, flags]);

  useEffect(() => {
    const still = reduceMotion();
    let offset = 0;
    let last = 0;
    let id = 0;
    function frame(now: number) {
      const dt = last ? Math.min(now - last, 64) / 1000 : 0;
      last = now;
      const max = Math.max(1, txt.current!.offsetHeight - slip.current!.clientHeight);
      if (!still) offset = (offset + dt * SPEEDS[speedRef.current]) % max;
      roll.current!.style.transform = `translateY(${-offset}px)`;
      id = requestAnimationFrame(frame);
    }
    id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="rl-wrap">
      <figure className="rl">
        <div className="slip" ref={slip}>
          <span className="hand l" aria-hidden="true"></span>
          <span className="hand r" aria-hidden="true"></span>
          <div className="roll" ref={roll}>
            <p className={mode === "fsrx" && flags.contrast ? "rtxt contrast" : "rtxt"} ref={txt} aria-live="off">
              {mode === "fsrx" ? <Runs lines={lines} /> : text}
            </p>
          </div>
        </div>
      </figure>
      <div className="panel">
        <span className="k">Speed</span>
        <Seg options={["slow", "medium", "fast"] as const} value={speed} onChange={setSpeed} />
        <span className="k">Text</span>
        <Seg options={["fsrx", "plain"] as const} value={mode} onChange={setMode} />
      </div>
    </div>
  );
}
