import type { DiagnosticResult } from "../types.js";

export async function diagnoseEnvironment(): Promise<DiagnosticResult[]> {
  const major = Number(process.versions.node.split(".")[0]);
  const results: DiagnosticResult[] = [
    {
      id: "environment.node-version",
      title: "Supported Node.js runtime",
      category: "environment",
      status: major >= 20 ? "pass" : "fail",
      summary:
        major >= 20
          ? `Node ${process.versions.node} satisfies the diagnostic agent requirement.`
          : `Node ${process.versions.node} is older than the supported Node 20 baseline.`,
      remediation: major >= 20 ? undefined : "Install Node.js 20 or newer.",
    },
  ];

  if (process.platform === "win32") {
    results.push({
      id: "environment.windows",
      title: "Windows compatibility lane",
      category: "environment",
      status: "pass",
      summary: "Running the SDK checks on native Windows, a useful compatibility path for the challenge.",
    });
  } else {
    results.push({
      id: "environment.windows",
      title: "Windows compatibility lane",
      category: "environment",
      status: "warn",
      summary: "This run does not exercise native Windows behavior.",
      remediation: "Run the doctor on Windows before publishing a cross-platform compatibility claim.",
    });
  }

  return results;
}
