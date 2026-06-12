# T3 SDK Doctor - Challenge Submission

## Track

Bug Discovery, with a supporting Agent Auth / VC SDK developer tool.

## One-line description

An automated compatibility and security diagnostic agent that finds
reproducible Terminal 3 SDK integration failures and signs each health summary
as a verifiable BBS+ credential.

## Problem

SDK integration failures are expensive when package metadata, runtime support,
WASM behavior, and dependency security drift apart. A developer should not need
to discover those mismatches manually after building an agent.

## What I built

T3 SDK Doctor checks six Terminal 3 packages, compares runtime declarations
with direct dependencies, starts the T3n WASM component, runs a Node runtime
matrix, performs a dependency audit, and uses the Terminal 3 VC SDK to issue
and verify a BBS+ health credential.

The output is both human-readable and machine-verifiable. Every failed check
includes evidence and a remediation.

## Primary discovery

`@terminal3/t3n-sdk@3.5.2` advertises Node `>=16.0.0`, but its core
`loadWasmComponent()` path fails reproducibly on Node `16.20.2` with a
WebAssembly `CompileError`. Node 18, 20, and 22 pass.

The SDK also directly depends on packages whose declared runtime floors exceed
its own: `canonicalize@3.0.0` requires Node 18, while
`@noble/curves@2.2.0` and `@noble/hashes@2.2.0` require Node 20.19.

## Why it matters

The published engine range tells developers and CI systems that Node 16 is
supported. Installation can complete, but the essential WASM path then fails
at runtime. This is exactly the kind of onboarding failure an SDK compatibility
agent should catch before production.

## Reproduce

```bash
npm install
npm run doctor -- --output evidence/windows-node22.json \
  --attestation evidence/windows-node22-attestation.json
npm run matrix
npm test
```

See `BUG_REPORT.md` and `evidence/runtime-matrix.json` for the complete result.
