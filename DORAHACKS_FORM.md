# DoraHacks Submission Fields

## Project name

T3 SDK Doctor

## Tagline

Reproducible compatibility and security diagnostics for the Terminal 3 SDK.

## Track

Bug Discovery Bounty

## Project URL

https://github.com/zhudaijin123/t3-sdk-doctor

## Demo URL

https://github.com/zhudaijin123/t3-sdk-doctor#run

## Short description

T3 SDK Doctor is an automated compatibility and security diagnostic agent for
Terminal 3's Agent Auth and VC SDKs. It checks package imports, runtime
declarations, direct dependency engine floors, WASM startup, BBS+ credential
issuance and verification, and known dependency vulnerabilities. It produces
human-readable output, structured JSON evidence, and a signed BBS+ health
credential.

## Full description

SDK integration failures become expensive when package metadata, actual runtime
behavior, WASM compatibility, and dependency security drift apart. T3 SDK
Doctor catches those mismatches before an agent reaches production.

The project discovered a reproducible compatibility bug in
`@terminal3/t3n-sdk@3.5.2`: the package advertises Node `>=16.0.0`, but its core
`loadWasmComponent()` path fails on Node `16.20.2` with a WebAssembly
`CompileError`. The same operation passes on Node 18, 20, and 22. The SDK also
directly depends on packages whose declared Node engine floors exceed its own,
including `canonicalize@3.0.0` (Node 18) and `@noble/curves@2.2.0` plus
`@noble/hashes@2.2.0` (Node 20.19).

T3 SDK Doctor includes a one-command runtime matrix, exact reproduction script,
structured evidence, remediation guidance, and a BBS+ signed health
attestation generated and verified with Terminal 3's VC SDK.

## How it uses Terminal 3

The doctor imports and tests six Terminal 3 packages. It starts the T3n WASM
component through `@terminal3/t3n-sdk`, then uses `@terminal3/vc_core` and
`@terminal3/bbs_vc` to issue a BBS+ health credential. The resulting credential
is verified with Terminal 3's VC verification implementation.

## Primary bug

`@terminal3/t3n-sdk@3.5.2` declares Node `>=16.0.0`, but
`loadWasmComponent()` fails reproducibly on Node `16.20.2`. Node 18, 20, and 22
pass. Full reproduction and remediation are in `BUG_REPORT.md`.

## Evidence links

- Bug report: https://github.com/zhudaijin123/t3-sdk-doctor/blob/main/BUG_REPORT.md
- Runtime matrix: https://github.com/zhudaijin123/t3-sdk-doctor/blob/main/evidence/runtime-matrix.json
- Signed health credential: https://github.com/zhudaijin123/t3-sdk-doctor/blob/main/evidence/windows-node22-attestation.json
- Structured doctor report: https://github.com/zhudaijin123/t3-sdk-doctor/blob/main/evidence/windows-node22.json

## Submission notes

- Built and tested on native Windows 10 x64.
- Node 16 failure is intentional and makes `npm run matrix` exit non-zero.
- Unit tests, TypeScript type checking, and production build pass.
- No hosted credentials or private API access are required.
