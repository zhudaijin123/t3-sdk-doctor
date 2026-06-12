import { resolvePackageManifest } from "../package-manifest.js";
import type { DiagnosticResult } from "../types.js";

const packages = [
  "@terminal3/t3n-sdk",
  "@terminal3/vc_core",
  "@terminal3/bbs_vc",
  "@terminal3/verify_vc",
  "@terminal3/verify_vp",
  "@terminal3/revoke_vc",
] as const;

export async function diagnoseImports(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];

  for (const packageName of packages) {
    try {
      const { path: manifestPath, manifest } = await resolvePackageManifest(packageName);
      const loaded = (await import(packageName)) as Record<string, unknown>;
      const exportNames = Object.keys(loaded).sort();

      results.push({
        id: `import.${packageName}`,
        title: `Import ${packageName}`,
        category: "import",
        status: exportNames.length > 0 ? "pass" : "warn",
        summary: `Imported version ${manifest.version ?? "unknown"} with ${exportNames.length} public exports.`,
        evidence: {
          details: {
            manifestPath,
            exportNames,
          },
        },
      });
    } catch (error) {
      results.push({
        id: `import.${packageName}`,
        title: `Import ${packageName}`,
        category: "import",
        status: "fail",
        summary: "The package could not be resolved and imported.",
        remediation: "Check the published package entrypoints and platform-specific dependencies.",
        evidence: { actual: error instanceof Error ? error.stack ?? error.message : String(error) },
      });
    }
  }

  return results;
}
