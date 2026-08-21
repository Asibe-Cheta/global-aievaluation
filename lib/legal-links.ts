// Single source of truth for the site's legal/compliance page links —
// reused by the public footer, the authenticated account-settings page,
// and the "Related Legal Information" block every legal page itself links
// out to (see public/legal/*.MD's own "Related Legal Information" sections).
export const LEGAL_LINKS = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/refunds", label: "Refunds & Withdrawal" },
  { href: "/ai-transparency", label: "AI Transparency & Disclaimer" },
  { href: "/third-party-disclosure", label: "Third-Party Platforms Disclaimer" },
  { href: "/cookies", label: "Cookie Policy" },
  { href: "/impressum", label: "Impressum" },
] as const;
