import type { Metadata } from "next";
import LegalPageShell from "@/components/LegalPageShell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of Global Ready AIEval.",
};

export default function TermsOfServicePage() {
  return (
    <LegalPageShell title="Terms of Service" effectiveDate="[Insert launch date]">
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use of Global Ready AIEval (the
        &quot;Service&quot;), operated by <strong>[Insert legal entity name]</strong>. By creating an account or
        using the Service, you agree to these Terms. If you don&apos;t agree, don&apos;t use the Service.
      </p>

      <h2>1. Description of Service</h2>
      <p>
        Global Ready AIEval is an online training platform that teaches AI data annotation, evaluation, and RLHF
        skills through lessons, realistic practice tasks, and an AI-powered interview simulator, to help members
        qualify for remote AI evaluation work on third-party platforms.
      </p>

      <h2>2. Not Affiliated With Third-Party Platforms</h2>
      <p>
        Global Ready AIEval is an independent training provider. We are <strong>not affiliated with, endorsed by, or
        acting on behalf of</strong> Outlier, Scale AI, Alignerr, Mercor, Micro1, DataAnnotation.tech, Prolific, or
        any other assessment/hiring platform referenced on this site. Any brand names are used solely to describe
        the type of assessments our content helps you prepare for.
      </p>

      <h2>3. Eligibility &amp; Account Registration</h2>
      <ul>
        <li>You must be at least 18 years old to create an account or make a purchase.</li>
        <li>You must provide accurate information and keep your login credentials confidential.</li>
        <li>You are responsible for all activity that occurs under your account.</li>
        <li>Accounts are personal to you and may not be shared, transferred, or resold.</li>
      </ul>

      <h2>4. Subscriptions, Payments &amp; Refunds</h2>
      <ul>
        <li>Membership tiers (Starter, Professional, Career Accelerator) are one-time purchases that grant permanent access to that tier&apos;s content, unless otherwise stated at checkout.</li>
        <li>AI Interview credit top-up packs are one-time purchases and do not expire.</li>
        <li>The 1-to-1 Coaching add-on is billed separately and, per its own listing, comes with a satisfaction guarantee: a full refund if the session doesn&apos;t help you make sense of your task.</li>
        <li>All payments are processed by Stripe. We do not store your card details.</li>
        <li>
          Except where a specific guarantee is stated (such as the Coaching add-on above), purchases granting digital
          access are <strong>non-refundable once access has been delivered</strong>, except where required by
          applicable law. <em>[Confirm and adjust this refund policy to match your actual practice before publishing.]</em>
        </li>
        <li>Where a plan involves a recurring subscription, you may cancel anytime via Manage Billing; cancellation stops future renewals but does not refund the current billing period.</li>
      </ul>

      <h2>5. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service for any unlawful purpose or in violation of any third-party platform&apos;s own terms;</li>
        <li>Attempt to reverse-engineer, scrape, or extract our lesson content, practice tasks, or underlying systems;</li>
        <li>Share, resell, or provide account access to anyone else;</li>
        <li>Upload content you don&apos;t have the right to share (including someone else&apos;s resume/CV or personal data), or submit false/misleading testimonials;</li>
        <li>Interfere with or disrupt the Service&apos;s security or availability;</li>
        <li>Use the affiliate program to refer yourself or engage in fraudulent referral activity.</li>
      </ul>
      <p>We may suspend or terminate accounts that violate these rules.</p>

      <h2>6. Affiliate Program</h2>
      <ul>
        <li>Affiliates earn a commission on the first payment of any sale attributed to their referral code, at the rate shown in their affiliate dashboard.</li>
        <li>Self-referrals and referrals obtained through spam, misleading claims, or paid search bidding on our brand terms are not eligible for commission and may result in removal from the program.</li>
        <li>Payouts are issued manually (e.g. bank transfer or PayPal) and require accurate payout information from you.</li>
        <li>We may adjust commission rates or disable an affiliate account for abuse, at our discretion.</li>
      </ul>

      <h2>7. AI-Generated Content Disclaimer</h2>
      <p>
        Interview reports, scores, feedback, and practice-task guidance are generated in part by AI (Google Gemini).
        AI output can be inaccurate or incomplete. This content is for skills training and self-assessment purposes
        only — it is not professional career, legal, financial, or psychological advice, and it does not guarantee
        that you will pass any third-party platform&apos;s qualification exam or be hired.
      </p>

      <h2>8. Intellectual Property</h2>
      <p>
        All lessons, practice tasks, interview questions, and other content on the Service are owned by Global Ready
        AIEval or its licensors. We grant you a limited, non-exclusive, non-transferable license to access this
        content for your personal learning use. You may not copy, redistribute, or create derivative works from our
        content without written permission.
      </p>

      <h2>9. Disclaimers</h2>
      <p>
        The Service is provided &quot;as is&quot; and &quot;as available,&quot; without warranties of any kind,
        express or implied. We do not guarantee uninterrupted or error-free operation, that AI-generated feedback
        will be accurate, or any specific employment or income outcome from using the Service.
      </p>

      <h2>10. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, Global Ready AIEval will not be liable for any indirect, incidental,
        special, or consequential damages arising from your use of the Service. Our total liability for any claim
        will not exceed the amount you paid us in the 12 months before the claim arose.
      </p>

      <h2>11. Termination</h2>
      <p>
        You may stop using the Service and delete your account at any time from Account Settings. We may suspend or
        terminate your access if you violate these Terms, engage in fraudulent activity, or if required by law.
      </p>

      <h2>12. Governing Law</h2>
      <p>
        These Terms are governed by the laws of <strong>[Insert governing jurisdiction]</strong>, without regard to
        conflict-of-law principles. Any disputes will be resolved in the courts of <strong>[Insert jurisdiction]</strong>,
        unless applicable consumer-protection law gives you the right to a different venue.
      </p>

      <h2>13. Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. Material changes will be reflected by updating the
        &quot;Effective&quot; date at the top of this page. Continued use of the Service after changes take effect
        constitutes acceptance of the revised Terms.
      </p>

      <h2>14. Contact Us</h2>
      <p>
        Questions about these Terms? Email <a href="mailto:contact@globalready.com">contact@globalready.com</a>.
      </p>
    </LegalPageShell>
  );
}
