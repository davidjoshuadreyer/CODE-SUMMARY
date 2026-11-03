# Local MP3 decoder dependency

`mpg123-decoder-1.0.3.min.mjs` is the **unmodified** official
`mpg123-decoder@1.0.3` npm distribution bundle, renamed from `.js` to `.mjs`
so browsers and Node can load it as a side-effect ES module. Its inline WASM
requires no additional network requests. The app uses its synchronous decoder
inside the app's own worker, not the bundled worker wrapper.

- npm archive: https://registry.npmjs.org/mpg123-decoder/-/mpg123-decoder-1.0.3.tgz
- npm SHA-1: `35ba32103053ba0f2005f81a808d268212c05f99`
- Exact wrapper source: https://github.com/eshaz/wasm-audio-decoders/tree/8f2428c1cd96b54dab74836c8471ff75fe35cbee
- Exact codec source: https://github.com/madebr/mpg123/tree/08247b317163175e62035893af3ff9e71a5dfefd
- Build instructions and dependency attribution: `wasm-audio-decoders-README.md`.

Original wrapper code is MIT; see `wasm-audio-decoders-MIT.txt` and the
upstream project's licensing declaration. The compiled mpg123 codec is
**LGPL v2.1**, copyright (c) 1995–2020 Michael Hipp and others; its complete
COPYING notice and AUTHORS are included. The embedded puff decompressor's
original source and copyright/license header are included. The simple-yenc
license is also included. These component licenses remain applicable; the
bundle is not solely MIT-licensed.

For modification/relinking, use the exact source revisions above with the
upstream Makefile/build instructions and replace this separable decoder
module; the application does not prohibit modification or reverse engineering
for debugging modifications to LGPL components. No user recordings are part
of this dependency or its source.

The official minifier changes the public `errors` property to `V` in this
bundle. `decode.js` checks both keys and aborts on reported decode errors so
missing frames cannot silently change the analysis timeline.
