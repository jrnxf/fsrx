// Light and dark. The first paint is set by the script in index.html; this switches and remembers it.
export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const current = root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("fsrx-theme", next);
    } catch {}
  }
  return (
    <button className="toggle" onClick={toggle}>
      light / dark
    </button>
  );
}
