import { Fragment } from "react";
import type { Run } from "./fsrx.ts";

// fsrx output as the page shows it: .fx for the bright start, .dm for the rest, one line per row.
export function Runs({ lines }: { lines: Run[][] }) {
  return lines.map((runs, i) => (
    <Fragment key={i}>
      {i > 0 && "\n"}
      {runs.map(({ t, k }, j) => (
        <span key={j} className={k === "fix" ? "fx" : "dm"}>
          {t}
        </span>
      ))}
    </Fragment>
  ));
}
