import { exec } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";

const execAsync = promisify(exec);
const versions = ["16", "18", "20", "22"];
const results: Array<{
  requestedNode: string;
  passed: boolean;
  stdout: string;
  stderr: string;
}> = [];

function summarize(result: { stdout: string; stderr: string }): string {
  if (result.stdout) return result.stdout;
  const lines = result.stderr.split(/\r?\n/).filter(Boolean);
  return (
    lines.find((line) => line.includes("CompileError")) ??
    lines.find((line) => line.includes("Error")) ??
    lines[0] ??
    "unknown failure"
  );
}

for (const version of versions) {
  try {
    const { stdout, stderr } = await execAsync(`npx -y node@${version} repro/load-wasm.mjs`, {
      cwd: process.cwd(),
      maxBuffer: 5 * 1024 * 1024,
      windowsHide: true,
    });
    results.push({
      requestedNode: version,
      passed: true,
      stdout: stdout.trim(),
      stderr: stderr.trim(),
    });
  } catch (error) {
    const failed = error as Error & { stdout?: string; stderr?: string };
    results.push({
      requestedNode: version,
      passed: false,
      stdout: failed.stdout?.trim() ?? "",
      stderr: failed.stderr?.trim() || failed.message,
    });
  }
}

const output = {
  generatedAt: new Date().toISOString(),
  sdk: "@terminal3/t3n-sdk@3.5.2",
  advertisedNodeRange: ">=16.0.0",
  command: "npx -y node@<major> repro/load-wasm.mjs",
  results,
};

const outputPath = resolve("evidence/runtime-matrix.json");
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");

for (const result of results) {
  console.log(
    `${result.passed ? "PASS" : "FAIL"} Node ${result.requestedNode}: ${summarize(result)}`,
  );
}
console.log(`Evidence written to ${outputPath}`);

if (results.some((result) => result.requestedNode === "16" && !result.passed)) {
  process.exitCode = 1;
}
