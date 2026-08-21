// Exact checkbox wording required by legal-source/DEVELOPER_COMPLIANCE.MD
// §6 (digital content) and §14 (coaching/onboarding). Used by both the
// checkout consent UI (components/CheckoutConsentModal.tsx) and the server
// action that records what was actually agreed to (lib/actions/billing.ts).
export const CONSENT_VERSION = "2026-09-01";

export const TERMS_CONSENT_TEXT =
  "I have read and agree to the Terms of Service and acknowledge the Privacy Policy and Refund, Cancellation & Withdrawal Policy.";

export const IMMEDIATE_DIGITAL_ACCESS_CONSENT_TEXT =
  "I expressly agree that Global Ready AIEval may provide me with immediate access to the purchased digital content before the end of the 14-day withdrawal period. I understand that once delivery of the digital content begins, I lose my statutory right of withdrawal.";

export const EARLY_SERVICE_START_CONSENT_TEXT =
  "I expressly request that Global Ready AIEval begin providing my onboarding/coaching service before the end of the 14-day withdrawal period. I understand that if I validly withdraw after the service has begun, I may be required to pay for the proportion already provided, and that the withdrawal right may expire once the service has been fully performed where the legal requirements are satisfied.";

// Coaching is a scheduled personal service, not delivered digital content —
// everything else currently sold is immediate digital access.
export function getSecondConsentText(product: "coaching" | (string & {})): string {
  return product === "coaching" ? EARLY_SERVICE_START_CONSENT_TEXT : IMMEDIATE_DIGITAL_ACCESS_CONSENT_TEXT;
}

export function getSecondConsentType(product: "coaching" | (string & {})): "immediate_digital_access" | "early_service_start" {
  return product === "coaching" ? "early_service_start" : "immediate_digital_access";
}
