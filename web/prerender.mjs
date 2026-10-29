// After `vite build`: renders the page into dist/index.html so the first paint already has its content (no layout
// shift on load), and writes dist/_headers so Cloudflare caches the hashed assets for good and can send early hints
// for the stylesheet and fonts.
import { readFileSync, writeFileSync } from "node:fs";
import { createServer } from "vite";

const vite = await createServer({ appType: "custom", server: { middlewareMode: true }, logLevel: "error" });
const { render } = await vite.ssrLoadModule("/src/entry-server.tsx");
await vite.close();

const file = "dist/index.html";
let html = readFileSync(file, "utf8");
if (!html.includes('<div id="root"></div>')) throw new Error("prerender: root element not found in dist/index.html");
html = html.replace('<div id="root"></div>', `<div id="root">${render()}</div>`);
writeFileSync(file, html);

const preloads = [...html.matchAll(/<link rel="(?:stylesheet|preload)"[^>]*>/g)].map(([tag]) => {
  const href = tag.match(/href="([^"]+)"/)[1];
  return tag.includes('as="font"')
    ? `<${href}>; rel=preload; as=font; type=font/woff2; crossorigin`
    : // Vite marks the stylesheet crossorigin, and a preload must match or the browser fetches it twice.
      `<${href}>; rel=preload; as=style${tag.includes("crossorigin") ? "; crossorigin" : ""}`;
});
writeFileSync(
  "dist/_headers",
  ["/assets/*", "  Cache-Control: public, max-age=31536000, immutable", "/", ...preloads.map((l) => `  Link: ${l}`), ""].join("\n"),
);
