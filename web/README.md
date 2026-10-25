# fsrx.jrnxf.co

The fsrx site: one static page in `public/`, served by Cloudflare Workers static assets.

- `public/index.html` and `public/style.css`: the page.
- `public/js/fsrx.js`: fsrx's styling logic from `src/main.rs`, ported to JavaScript. The hero example, Try it and
  Scrolling all run it in the browser.
- `public/js/tester.js`, `reading.js`, `theme.js`, `main.js`: the controls, the scroller and the light/dark switch.
- `public/fonts/`: IM Fell English and Libre Caslon Text, each with its SIL Open Font Licence.
- `test/parity.mjs`: runs the port and the real `fsrx` binary on the same inputs, with every combination of `-c`,
  `-f` and `-s`, and fails if any output differs by a byte. CI runs it on every pull request.

## Test

```sh
cargo build --release
node web/test/parity.mjs target/release/fsrx
```

If `src/main.rs` changes how it styles text, change `public/js/fsrx.js` the same way until this passes.

## Run locally

Any static server works, for example `python3 -m http.server -d web/public`.

## Deploy

Workers Builds deploys `main` with `npx wrangler deploy` from this folder. There is no build step.

One-time setup in the Cloudflare dashboard:

1. Workers & Pages, Create, Import a repository: pick `jrnxf/fsrx`.
2. Root directory `web`, build command empty, deploy command `npx wrangler deploy`, production branch `main`.
3. Optional: build watch paths `web/*`, so changes to the Rust code do not redeploy the site.
4. The first deploy adds the `fsrx.jrnxf.co` custom domain from `wrangler.jsonc`. It needs the `jrnxf.co` zone in
   the same Cloudflare account; no DNS record is needed by hand.
