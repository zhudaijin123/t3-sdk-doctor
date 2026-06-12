import { BbsDID, createBbsCredential, verifyBbsVc } from "@terminal3/bbs_vc";
import { DID, randomKeyBls } from "@terminal3/vc_core";
import type { DoctorReport } from "./types.js";

export async function createHealthAttestation(report: DoctorReport) {
  const issuer = new BbsDID(randomKeyBls());
  const holder = new DID("t3-sdk-doctor", crypto.randomUUID());
  const credential = await createBbsCredential(
    issuer,
    holder,
    {
      generatedAt: report.generatedAt,
      platform: `${report.environment.platform}/${report.environment.architecture}`,
      node: report.environment.node,
      passedChecks: report.totals.pass,
      warningChecks: report.totals.warn,
      failedChecks: report.totals.fail,
    },
    ["T3SdkHealthCredential"],
  );
  const verification = await verifyBbsVc(credential);
  return { credential, verification };
}
