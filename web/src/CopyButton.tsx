import { useEffect, useRef, useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  const timer = useRef<number>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setDone(false), 1200);
    } catch {}
  }

  return <button onClick={copy}>{done ? "copied" : "copy"}</button>;
}

export function Install({ command }: { command: string }) {
  return (
    <div className="install">
      <code>{command}</code>
      <CopyButton text={command} />
    </div>
  );
}
