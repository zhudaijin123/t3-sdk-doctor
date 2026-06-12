import { exec } from "node:child_process";
import { promisify } from "node:util";
import type { DiagnosticResult } from "../types.js";

const execAsync = promisify(exec);

interface AuditReport {
  metadata?: {
    vulnerabilities?: {
      low?: number;
      moderate?: number;
      high?: number;
      critical?: number;
      total?: number;
    };
  };
}

export async function diagnoseSecurity(): Promise<DiagnosticResult[]> {
  let output = "";

  try {
    const result = await execAsync("npm audit --json", {
      cwd: process.cwd(),
      maxBuffer: 10 * 1024 * 1024,
      windowsHide: true,
    });
    output = result.stdout;
  } catch (error) {
    const failed = error as Error & { stdout?: string };
    output = failed.stdout ?? "";
    if (!output) {
      return [
        {
          id: "security.npm-audit",
          title: "Terminal 3 dependency security audit",
          category: "security",
          status: "warn",
          summary: "npm audit could not produce a machine-readable report.",
          evidence: { actual: failed.stack ?? failed.message },
        },
      ];
    }
  }

  const report = JSON.parse(output) as AuditReport;
  const counts = report.metadata?.vulnerabilities ?? {};
  const severe = (counts.high ?? 0) + (counts.critical ?? 0);
  const total = counts.total ?? 0;

  return [
    {
      id: "security.npm-audit",
      title: "Terminal 3 dependency security audit",
      category: "security",
      status: severe > 0 ? "fail" : total > 0 ? "warn" : "pass",
      summary:
        total === 0
          ? "npm audit found no known dependency vulnerabilities."
          : `npm audit found ${total} dependency vulnerabilities, including ${severe} high/critical findings.`,
      remediation:
        total === 0
          ? undefined
          : "Update vulnerable direct and transitive dependencies, then publish patched SDK versions.",
      evidence: { details: counts },
    },
  ];
}
