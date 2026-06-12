import semver from "semver";
import { resolveDependencyManifest, resolvePackageManifest } from "../package-manifest.js";
import type { DiagnosticResult } from "../types.js";

export async function diagnosePackaging(): Promise<DiagnosticResult[]> {
  const packageName = "@terminal3/t3n-sdk";
  const { path: manifestPath, manifest } = await resolvePackageManifest(packageName);
  const missing: string[] = [];

  if (!manifest.homepage) missing.push("homepage");
  if (!manifest.bugs) missing.push("bugs");
  if (!manifest.repository) missing.push("repository");
  if (!manifest.engines?.node) missing.push("engines.node");

  const results: DiagnosticResult[] = [
    {
      id: "packaging.t3n-sdk-metadata",
      title: "Published SDK support metadata",
      category: "packaging",
      status: missing.length === 0 ? "pass" : "warn",
      summary:
        missing.length === 0
          ? "The published SDK exposes repository, support, homepage, and Node runtime metadata."
          : `The published SDK is missing discoverability/runtime metadata: ${missing.join(", ")}.`,
      remediation:
        missing.length === 0
          ? undefined
          : "Add the missing fields to the published package manifest so users can find support and runtime requirements.",
      evidence: {
        details: {
          packageName,
          version: manifest.version ?? null,
          manifestPath,
          missing,
        },
      },
    },
  ];

  const declaredNodeRange = manifest.engines?.node;
  const declaredMinimum = declaredNodeRange ? semver.minVersion(declaredNodeRange) : null;
  const incompatibleDependencies: Array<{
    name: string;
    version: string | null;
    node: string;
  }> = [];

  for (const dependencyName of Object.keys(manifest.dependencies ?? {})) {
    const dependency = await resolveDependencyManifest(manifestPath, dependencyName);
    const nodeRange = dependency.manifest.engines?.node;
    const dependencyMinimum = nodeRange ? semver.minVersion(nodeRange) : null;
    if (
      declaredMinimum &&
      dependencyMinimum &&
      semver.gt(dependencyMinimum, declaredMinimum)
    ) {
      incompatibleDependencies.push({
        name: dependencyName,
        version: dependency.manifest.version ?? null,
        node: nodeRange!,
      });
    }
  }

  results.push({
    id: "packaging.t3n-sdk-engine-floor",
    title: "SDK Node.js engine floor matches direct dependencies",
    category: "packaging",
    status: incompatibleDependencies.length === 0 ? "pass" : "fail",
    summary:
      incompatibleDependencies.length === 0
        ? `The SDK's declared Node range (${declaredNodeRange ?? "unspecified"}) is compatible with its direct dependencies.`
        : `The SDK declares Node ${declaredNodeRange}, but ${incompatibleDependencies.length} direct dependencies require a newer runtime.`,
    remediation:
      incompatibleDependencies.length === 0
        ? undefined
        : "Raise @terminal3/t3n-sdk engines.node to the highest direct-dependency floor or pin dependencies compatible with the advertised runtime.",
    evidence: {
      expected: `Every direct dependency supports ${declaredNodeRange}.`,
      actual: incompatibleDependencies
        .map((dependency) => `${dependency.name}@${dependency.version} requires Node ${dependency.node}`)
        .join("; "),
      details: {
        sdkVersion: manifest.version ?? null,
        declaredNodeRange: declaredNodeRange ?? null,
        incompatibleDependencies,
      },
    },
  });

  return results;
}
