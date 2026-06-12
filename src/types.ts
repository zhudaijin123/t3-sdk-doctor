export type DiagnosticStatus = "pass" | "warn" | "fail";

export interface DiagnosticEvidence {
  command?: string;
  expected?: string;
  actual?: string;
  details?: Record<string, unknown>;
}

export interface DiagnosticResult {
  id: string;
  title: string;
  category: "environment" | "import" | "packaging" | "behavior" | "security";
  status: DiagnosticStatus;
  summary: string;
  remediation?: string;
  evidence?: DiagnosticEvidence;
}

export interface DoctorReport {
  schemaVersion: 1;
  generatedAt: string;
  environment: {
    platform: NodeJS.Platform;
    architecture: string;
    node: string;
    cwd: string;
  };
  totals: Record<DiagnosticStatus, number>;
  results: DiagnosticResult[];
}
