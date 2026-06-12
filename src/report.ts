import type { DiagnosticResult, DiagnosticStatus, DoctorReport } from "./types.js";

const symbols: Record<DiagnosticStatus, string> = {
  pass: "PASS",
  warn: "WARN",
  fail: "FAIL",
};

export function createReport(results: DiagnosticResult[]): DoctorReport {
  const totals: Record<DiagnosticStatus, number> = { pass: 0, warn: 0, fail: 0 };
  for (const result of results) totals[result.status] += 1;

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    environment: {
      platform: process.platform,
      architecture: process.arch,
      node: process.version,
      cwd: process.cwd(),
    },
    totals,
    results,
  };
}

export function formatTextReport(report: DoctorReport): string {
  const lines = [
    "T3 SDK Doctor",
    `Platform: ${report.environment.platform}/${report.environment.architecture}`,
    `Node: ${report.environment.node}`,
    `Summary: ${report.totals.pass} passed, ${report.totals.warn} warnings, ${report.totals.fail} failed`,
    "",
  ];

  for (const result of report.results) {
    lines.push(`[${symbols[result.status]}] ${result.title}`);
    lines.push(`  ${result.summary}`);
    if (result.remediation) lines.push(`  Fix: ${result.remediation}`);
    if (result.evidence?.actual) lines.push(`  Actual: ${result.evidence.actual}`);
    lines.push("");
  }

  return lines.join("\n");
}
