// Wires a page's controls to the fsrx port.
//
// Markup it looks for under `root`:
//   [data-input]           textarea with the text to style
//   [data-out]             where the styled text goes
//   [data-f=l|m|h]         fixation buttons
//   [data-s=l|m|h]         saccade buttons
//   [data-c]               contrast toggle
//   [data-cmd]             filled with the matching fsrx command
//
// Several roots can share one flags object, so one set of controls can
// drive many outputs. Listeners get the flags on every change.

import { toHtml, command } from "./fsrx.js";

export function createFlags() {
  const flags = { fixation: "m", saccade: "h", contrast: false };
  const listeners = new Set();
  return {
    get: () => ({ ...flags }),
    set(patch) {
      Object.assign(flags, patch);
      listeners.forEach((fn) => fn({ ...flags }));
    },
    on(fn) {
      listeners.add(fn);
      fn({ ...flags });
      return () => listeners.delete(fn);
    },
  };
}

export function bindControls(root, flags) {
  root.querySelectorAll("[data-f]").forEach((b) =>
    b.addEventListener("click", () => flags.set({ fixation: b.dataset.f })),
  );
  root.querySelectorAll("[data-s]").forEach((b) =>
    b.addEventListener("click", () => flags.set({ saccade: b.dataset.s })),
  );
  root.querySelectorAll("[data-c]").forEach((b) =>
    b.addEventListener("click", () => flags.set({ contrast: !flags.get().contrast })),
  );
  flags.on((f) => {
    root.querySelectorAll("[data-f]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.f === f.fixation)));
    root.querySelectorAll("[data-s]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.s === f.saccade)));
    root.querySelectorAll("[data-c]").forEach((b) => b.setAttribute("aria-pressed", String(f.contrast)));
    root.querySelectorAll("[data-cmd]").forEach((el) => (el.textContent = command(f)));
  });
}

export function bindTester(root, flags) {
  const input = root.querySelector("[data-input]");
  const out = root.querySelector("[data-out]");
  const render = () => {
    const f = flags.get();
    out.classList.toggle("contrast", f.contrast);
    out.innerHTML = toHtml(input.value, f);
  };
  input.addEventListener("input", render);
  flags.on(render);
  return render;
}

// Copy buttons: [data-copy="text"].
export function bindCopy(root = document) {
  root.querySelectorAll("[data-copy]").forEach((b) =>
    b.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(b.dataset.copy);
        const was = b.textContent;
        b.textContent = b.dataset.done || "copied";
        setTimeout(() => (b.textContent = was), 1200);
      } catch {}
    }),
  );
}
