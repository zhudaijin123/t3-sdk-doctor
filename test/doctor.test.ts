import { describe, expect, it } from "vitest";
import { runDoctor } from "../src/doctor.js";
import { formatTextReport } from "../src/report.js";

describe("T3 SDK Doctor", () => {
  it("returns a stable report shape", async () => {
    const report = await runDoctor({ includeSecurity: false });

    expect(report.schemaVersion).toBe(1);
    expect(report.results.length).toBeGreaterThanOrEqual(12);
    expect(report.results.every((result) => result.id && result.title)).toBe(true);
    expect(report.totals.pass + report.totals.warn + report.totals.fail).toBe(report.results.length);
  });

  it("formats an actionable text report", async () => {
    const output = formatTextReport(await runDoctor({ includeSecurity: false }));

    expect(output).toContain("T3 SDK Doctor");
    expect(output).toContain("Summary:");
    expect(output).toMatch(/\[(PASS|WARN|FAIL)\]/);
  });
});
