import { createHealthAttestation } from "../attestation.js";
import { createReport } from "../report.js";
import type { DiagnosticResult } from "../types.js";

export async function diagnoseBehavior(): Promise<DiagnosticResult[]> {
  const startedAt = performance.now();
  try {
    const { loadWasmComponent } = await import("@terminal3/t3n-sdk");
    const component = await loadWasmComponent();
    const durationMs = Math.round(performance.now() - startedAt);
    const hasExpectedSurface =
      typeof component === "object" &&
      component !== null &&
      "flow" in component &&
      "session" in component;

    const attestation = await createHealthAttestation(createReport([]));

    return [
      {
        id: "behavior.wasm-load",
        title: "Load the T3n WASM component",
        category: "behavior",
        status: hasExpectedSurface ? "pass" : "fail",
        summary: hasExpectedSurface
          ? `The WASM component loaded on ${process.platform} in ${durationMs} ms.`
          : "The WASM loader returned an unexpected component shape.",
        evidence: {
          details: {
            durationMs,
            platform: process.platform,
            topLevelKeys: Object.keys(component as object),
          },
        },
      },
      {
        id: "behavior.bbs-health-attestation",
        title: "Issue and verify a BBS+ SDK health credential",
        category: "behavior",
        status: attestation.verification.isValid ? "pass" : "fail",
        summary: attestation.verification.isValid
          ? "Issued and verified a signed BBS+ diagnostic credential with the Terminal 3 VC SDK."
          : `The generated diagnostic credential did not verify: ${attestation.verification.message}`,
        evidence: {
          details: {
            proofType: attestation.credential.proof.type,
            cryptosuite: attestation.credential.proof.cryptosuite ?? null,
            verification: attestation.verification,
          },
        },
      },
    ];
  } catch (error) {
    return [
      {
        id: "behavior.wasm-load",
        title: "Load the T3n WASM component",
        category: "behavior",
        status: "fail",
        summary: `The WASM component failed to load on ${process.platform}.`,
        remediation: "Check the published WASM assets, Node runtime floor, and platform-specific loader paths.",
        evidence: { actual: error instanceof Error ? error.stack ?? error.message : String(error) },
      },
    ];
  }
}
