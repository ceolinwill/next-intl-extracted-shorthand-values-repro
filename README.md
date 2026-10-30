# next-intl `useExtracted` Shorthand `values` Reproduction

Minimal reproduction for `useExtracted` dropping `values` when the object form passes them as a shorthand property. `t.rich({ message, description, values })` compiles to `t.rich("vHSJFT")` with no values, so the message can't format: `t.rich` and `t.markup` render the message id and `t` renders `Hello undefined!`. The same call with `values: values` works. TypeScript accepts both, and the `object-shorthand` lint rule (ESLint, oxlint) autofixes `values: values` into the shorthand that breaks. Reported in https://github.com/amannn/next-intl/issues/2444.

## Reproduction

```sh
npm install
npm run repro
```

`npm run repro` runs `next build`, then `scripts/check.mjs` reads the prerendered `.next/server/app/index.html`. `src/app/page.tsx` calls `t`, `t.rich` and `t.markup` twice each, with `{ values }` and with `{ values: values }`. Every shorthand call loses its values, and the script exits with code 1:

```txt
FAIL t, { values }                -> "Hello undefined!"
ok   t, { values: values }        -> "Hello Jane!"
FAIL t.rich, { values }           -> "vHSJFT"
ok   t.rich, { values: values }   -> "Hello Jane!"
FAIL t.markup, { values }         -> "vHSJFT"
ok   t.markup, { values: values } -> "Hello <b>Jane</b>!"

3 of 6 calls lost their values.
```

The build log shows the compiled calls while prerendering. The shorthand call has no second argument:

```txt
Error: FORMATTING_ERROR: a is not a function
    at P (src/app/page.tsx:24:12)
  22 |     return (<>
  23 |       <li data-case="t.rich, { values }">
> 24 |         {t.rich("vHSJFT")}
     |            ^
  25 |       </li>
  26 |       <li data-case="t.rich, { values: values }">
  27 |         {t.rich("vHSJFT", values)} {
  code: 'FORMATTING_ERROR',
  originalMessage: 'a is not a function'
}
```

The same error is logged for `t.markup` at `src/app/page.tsx:39:12`. This repro uses `precompile: true`, as next-intl's `example-app-router-extracted` does. Without it, the shorthand calls render the raw message instead, such as `Hello {name}!`.

## Expected Behavior

`{ values }` compiles like `{ values: values }`, to `t.rich("vHSJFT", values)`, and all six lines render `Hello Jane!` (`Hello <b>Jane</b>!` for `t.markup`).

## Actual Behavior

`TransformVisitor::extract_message` in [`packages/swc-plugin-extractor/src/lib.rs`](https://github.com/amannn/next-intl/blob/b9fc98a814957b9c97894c7b57151215ac39afa6/packages/swc-plugin-extractor/src/lib.rs#L323-L360) reads the object argument's properties by matching only `Prop::KeyValue`. A shorthand property is a `Prop::Shorthand`, so it skips `values`, `values_node` stays `None`, and the rewrite [below it](https://github.com/amannn/next-intl/blob/b9fc98a814957b9c97894c7b57151215ac39afa6/packages/swc-plugin-extractor/src/lib.rs#L431-L451) replaces the object with the key alone. The same match skips a shorthand `formats`.

## Environment

- next-intl: `4.14.9`
- Next.js: `16.4.3` (Turbopack)
- React: `19.3.1`
- Node.js: `24.22.0`
- npm: `11.19.1`
- macOS: `27.2`
