#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { Command } from "commander";
import { createHealthAttestation } from "./attestation.js";
import { runDoctor } from "./doctor.js";
import { formatTextReport } from "./report.js";

const program = new Command()
  .name("t3-sdk-doctor")
  .description("Run reproducible Terminal 3 SDK environment and packaging diagnostics.")
  .option("--json", "print JSON instead of the human-readable report")
  .option("-o, --output <path>", "write the JSON report to a file")
  .option("--attestation <path>", "write a signed BBS+ health credential to a file")
  .option("--strict", "exit non-zero on warnings as well as failures")
  .parse();

const options = program.opts<{
  json?: boolean;
  output?: string;
  attestation?: string;
  strict?: boolean;
}>();
const report = await runDoctor();

if (options.output) {
  const outputPath = resolve(options.output);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

if (options.attestation) {
  const outputPath = resolve(options.attestation);
  const attestation = await createHealthAttestation(report);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(attestation, null, 2)}\n`, "utf8");
}

console.log(options.json ? JSON.stringify(report, null, 2) : formatTextReport(report));

if (report.totals.fail > 0 || (options.strict && report.totals.warn > 0)) {
  process.exitCode = 1;
}
