import { toHtml } from "./fsrx.js";

// The Try it text, scrolling up past a fixed reading line.
export function initReading(flags) {
  const src = document.getElementById("src");
  const slip = document.getElementById("slip");
  const roll = document.getElementById("roll");
  const txt = document.getElementById("roll-txt");
  const SPEEDS = { slow: 18, medium: 30, fast: 48 };
  let speed = "medium";
  let mode = "fsrx";
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let offset = 0;
  let last = 0;

  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
  function render() {
    const f = flags.get();
    txt.classList.toggle("contrast", f.contrast && mode === "fsrx");
    txt.innerHTML = mode === "fsrx" ? toHtml(src.value, f) : esc(src.value);
    document.querySelectorAll("[data-rl-mode]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.rlMode === mode)));
    document.querySelectorAll("[data-rl-speed]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.rlSpeed === speed)));
  }
  document.querySelectorAll("[data-rl-mode]").forEach((b) => b.addEventListener("click", () => ((mode = b.dataset.rlMode), render())));
  document.querySelectorAll("[data-rl-speed]").forEach((b) => b.addEventListener("click", () => ((speed = b.dataset.rlSpeed), render())));
  src.addEventListener("input", render);
  flags.on(render);

  function frame(now) {
    const dt = last ? Math.min(now - last, 64) / 1000 : 0;
    last = now;
    const max = Math.max(1, txt.offsetHeight - slip.clientHeight);
    if (!still) offset = (offset + dt * SPEEDS[speed]) % max;
    roll.style.transform = `translateY(${-offset}px)`;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
