# Bug Report: SDK advertises Node 16 support but core WASM initialization fails

## Summary

`@terminal3/t3n-sdk@3.5.2` declares Node `>=16.0.0`, but its core
`loadWasmComponent()` path fails on Node `16.20.2`. The SDK's direct dependency
engine ranges also contradict the advertised floor.

## Environment

- OS: Windows 10 x64
- Package: `@terminal3/t3n-sdk@3.5.2`
- Failing runtime: Node `16.20.2`
- Passing runtimes: Node `18.20.8`, Node 20, Node 22

## Reproduction

Install dependencies:

```bash
npm install
```

Run the advertised minimum major version:

```bash
npx -y node@16 repro/load-wasm.mjs
```

Run the full matrix:

```bash
npm run matrix
```

## Expected

Because the published package declares Node `>=16.0.0`,
`loadWasmComponent()` should initialize successfully on Node 16.

## Actual

Node `16.20.2` imports the package, then fails during core WASM initialization:

```text
CompileError: WebAssembly.compile(): Compiling function
#11:"_ZN102_$LT$time..error..invalid_format_descript..."
failed: expected table index 0, found 0 @+4011
```

Node 18, 20, and 22 load the same WASM component successfully.

## Additional packaging evidence

The SDK declares Node `>=16.0.0`, while these direct dependencies require a
newer runtime:

| Direct dependency | Installed version | Declared Node engine |
| --- | --- | --- |
| `canonicalize` | `3.0.0` | `>=18` |
| `@noble/curves` | `2.2.0` | `>=20.19.0` |
| `@noble/hashes` | `2.2.0` | `>=20.19.0` |

## Impact

Developers and CI systems can select Node 16 based on the SDK's published
metadata, install the package, and only discover the incompatibility when the
essential WASM component is initialized.

## Suggested fix

1. Raise `@terminal3/t3n-sdk`'s `engines.node` to the minimum runtime actually
   supported by the shipped WASM and direct dependencies.
2. Add a CI runtime matrix that imports the package and calls
   `loadWasmComponent()` on every advertised Node major version.
3. If Node 16/18 support is intended, pin/build dependencies and WASM output
   compatible with those runtimes.

## Secondary finding

On June 12, 2026, a clean install and `npm audit --json` reported 23 known
dependency vulnerabilities, including 8 high-severity findings. T3 SDK Doctor
captures the current counts in its structured report so this can be tracked
across releases.
