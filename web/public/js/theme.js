// Light and dark. ?theme=dark|light wins, then the visitor's last pick,
// then the system setting. Load in <head> so the first paint is right.
(function () {
  const root = document.documentElement;
  const q = new URLSearchParams(location.search).get("theme");
  let saved = null;
  try {
    saved = localStorage.getItem("fsrx-theme");
  } catch {}
  const pick = q === "dark" || q === "light" ? q : saved;
  if (pick) root.dataset.theme = pick;
  const current = () =>
    root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  window.fsrxTheme = {
    current,
    toggle() {
      const next = current() === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try {
        localStorage.setItem("fsrx-theme", next);
      } catch {}
      document.dispatchEvent(new CustomEvent("themechange", { detail: next }));
    },
  };
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-theme-toggle]")) window.fsrxTheme.toggle();
  });
})();
