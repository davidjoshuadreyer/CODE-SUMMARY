# FSRS browser dependency

`ts-fsrs.js` is the unmodified UMD build of `ts-fsrs` 5.4.2 (FSRS-6).
Upstream: https://github.com/open-spaced-repetition/ts-fsrs
MIT license: `ts-fsrs.LICENSE`.

After `npm ci`, refresh the committed browser assets with:

```sh
cp node_modules/ts-fsrs/dist/index.umd.js assets/workspace/vendor/ts-fsrs.js
cp node_modules/ts-fsrs/LICENSE assets/workspace/vendor/ts-fsrs.LICENSE
```

The static site needs no runtime npm installation or external scheduler CDN.
