import { diagnoseBehavior } from "./diagnostics/behavior.js";
import { diagnoseEnvironment } from "./diagnostics/environment.js";
import { diagnoseImports } from "./diagnostics/imports.js";
import { diagnosePackaging } from "./diagnostics/packaging.js";
import { diagnoseSecurity } from "./diagnostics/security.js";
import { createReport } from "./report.js";
import type { DoctorReport } from "./types.js";

export async function runDoctor(options: { includeSecurity?: boolean } = {}): Promise<DoctorReport> {
  const checks = [
    diagnoseEnvironment(),
    diagnoseImports(),
    diagnosePackaging(),
    diagnoseBehavior(),
  ];
  if (options.includeSecurity !== false) checks.push(diagnoseSecurity());
  const groups = await Promise.all(checks);
  return createReport(groups.flat());
}
