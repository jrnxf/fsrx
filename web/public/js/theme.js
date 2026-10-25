// Light and dark. The visitor's last pick wins, then the system setting.
// Load in <head> so the first paint is right.
(function () {
  const root = document.documentElement;
  let saved = null;
  try {
    saved = localStorage.getItem("fsrx-theme");
  } catch {}
  if (saved) root.dataset.theme = saved;
  const current = () =>
    root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-theme-toggle]")) return;
    const next = current() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("fsrx-theme", next);
    } catch {}
  });
})();
