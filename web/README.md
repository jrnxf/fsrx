# fsrx.jrnxf.co

The fsrx site: a single page built with Vite, React and TypeScript, served by Cloudflare Workers static assets.

- `index.html`: the page shell, with the fonts preloaded. A small inline script sets the saved light/dark theme before first paint.
- `src/style.css`: the styles.
- `src/fsrx.ts`: fsrx's styling logic from `src/main.rs`, ported to TypeScript. The hero example, Try it and
  Scrolling all run it in the browser.
- `src/*.tsx`: the page's components.
- `src/fonts/`: IM Fell English and Libre Caslon Text, hashed by the build. Their SIL Open Font Licence texts are in `public/fonts/`.
- `prerender.mjs`: runs after `vite build`. It renders the page into `dist/index.html`, so the first paint has its content, and writes `dist/_headers` (immutable caching for `/assets/*`, `Link` preload headers for early hints).
- `test/parity.mjs`: runs the port and the real `fsrx` binary on the same inputs, with every combination of `-c`,
  `-f` and `-s`, and fails if any output differs by a byte. CI runs it on every pull request.

## Test

```sh
cargo build --release
node web/test/parity.mjs target/release/fsrx
```

If `src/main.rs` changes how it styles text, change `src/fsrx.ts` the same way until this passes.

## Run locally

```sh
npm install
npm run dev
```

`npm run typecheck` checks the types; `npm run build` writes the site to `dist/`.

## Deploy

Workers Builds deploys `main` with `npx wrangler deploy` from this folder. `wrangler.jsonc` runs `npm run build` first, so the install step must run `npm install`.

One-time setup in the Cloudflare dashboard:

1. Workers & Pages, Create, Import a repository: pick `jrnxf/fsrx`.
2. Root directory `web`, build command empty (wrangler runs the build), deploy command `npx wrangler deploy`, production branch `main`.
3. Optional: build watch paths `web/*`, so changes to the Rust code do not redeploy the site.
4. The first deploy adds the `fsrx.jrnxf.co` custom domain from `wrangler.jsonc`. It needs the `jrnxf.co` zone in
   the same Cloudflare account; no DNS record is needed by hand.
