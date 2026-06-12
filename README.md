# T3 SDK Doctor

T3 SDK Doctor is a diagnostic agent for the Terminal 3 Agent Auth and VC SDKs.
It runs reproducible environment, packaging, behavior, and security checks, then
issues a signed BBS+ health credential containing the result summary.

The project targets the Terminal 3 Agent Dev Kit Bounty Challenge, especially
the Bug Discovery track. It was built and tested on native Windows because that
compatibility path is underrepresented in the existing challenge submissions.

## Confirmed finding

`@terminal3/t3n-sdk@3.5.2` declares:

```json
"engines": {
  "node": ">=16.0.0"
}
```

The advertised Node 16 path does not work:

```text
FAIL Node 16: WebAssembly.compile() ... expected table index 0, found 0
PASS Node 18: WASM component loaded
PASS Node 20: WASM component loaded
PASS Node 22: WASM component loaded
```

The same SDK also depends directly on packages with higher engine floors:

- `canonicalize@3.0.0`: Node `>=18`
- `@noble/curves@2.2.0`: Node `>=20.19.0`
- `@noble/hashes@2.2.0`: Node `>=20.19.0`

This means consumers following the published SDK engine declaration can select
an unsupported runtime and fail during the core WASM initialization path.

## What the agent checks

- Native OS, architecture, and Node runtime
- Importability and public exports of six Terminal 3 packages
- Published package support metadata
- SDK engine range against direct dependency engine ranges
- T3n WASM component startup
- BBS+ diagnostic credential issuance and verification
- Known dependency vulnerabilities through `npm audit`
- Node 16, 18, 20, and 22 WASM runtime matrix

## Run

Requires Node 20 or newer for the doctor itself.

```bash
npm install
npm run doctor -- --output evidence/windows-node22.json \
  --attestation evidence/windows-node22-attestation.json
npm run matrix
```

`npm run matrix` intentionally exits non-zero while the advertised Node 16
runtime fails. It still writes the complete evidence file.

Verification:

```bash
npm run typecheck
npm test
npm run build
```

## Outputs

- Human-readable terminal diagnosis
- Structured JSON report
- BBS+ signed and locally verified health credential
- Structured runtime matrix with the exact error output

## Design

```text
Environment + package manifests + npm audit
                    |
                    v
             diagnostic checks
                    |
                    v
           structured doctor report
                    |
                    v
 Terminal 3 BBS+ credential issue + verify
```

Every finding includes expected behavior, actual behavior, evidence, and a
remediation. The checks do not need private credentials or a hosted API.

## Challenge submission

The prepared challenge text is in [SUBMISSION.md](SUBMISSION.md). The primary
bug report is in [BUG_REPORT.md](BUG_REPORT.md).

## License

MIT
