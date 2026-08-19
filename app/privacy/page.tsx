import type { Metadata } from "next";
import LegalPageShell from "@/components/LegalPageShell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Global Ready AIEval collects, uses, and protects your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell title="Privacy Policy" effectiveDate="[Insert launch date]">
      <p>
        This Privacy Policy explains what information Global Ready AIEval (&quot;we,&quot; &quot;us,&quot; the
        &quot;Service&quot;) collects when you use our website and platform, why we collect it, who we share it
        with, and the choices you have. It applies to visitors, registered users, and affiliates.
      </p>
      <p>
        <strong>Who we are:</strong> Global Ready AIEval is operated by{" "}
        <strong>[Insert legal entity name]</strong>, <strong>[Insert registered address]</strong>. You can reach us
        at{" "}
        <a href="mailto:contact@globalready.com">contact@globalready.com</a>.
      </p>

      <h2>1. Information We Collect</h2>
      <p>We collect the following categories of data. Every item below reflects data our platform actually stores or transmits — nothing here is generic boilerplate.</p>

      <h3>1.1 Account &amp; Authentication Data</h3>
      <ul>
        <li>Email address and password (your password is hashed by our authentication provider, Supabase Auth — we never see or store it in plain text)</li>
        <li>If you sign in with Google: your name, email address, and profile photo, as shared by Google</li>
        <li>Whether your account has administrator privileges (staff accounts only)</li>
      </ul>

      <h3>1.2 Profile Information You Provide</h3>
      <ul>
        <li>Display name, job role/title, location, timezone</li>
        <li>Profile photo/avatar you upload</li>
        <li>Notification and audio-feedback preferences, pacing mode</li>
      </ul>

      <h3>1.3 Resume / CV Data</h3>
      <ul>
        <li>If you upload a resume or CV to prefill your onboarding profile, the file content is sent to Google&apos;s Gemini AI to extract: your name, education, work experience, AI/RLHF/annotation experience, programming knowledge, languages spoken, remote-work experience, and career goals</li>
        <li>The extracted summary is saved to your profile so it persists across sessions; the original uploaded file itself is not stored on our servers</li>
      </ul>

      <h3>1.4 Learning &amp; Practice Progress</h3>
      <ul>
        <li>Lessons, simulations, and exams you&apos;ve completed</li>
        <li>Your practice-task answers/submissions (multiple-choice selections and/or written responses) and timestamps</li>
        <li>XP, rank, skill scores (prompt evaluation, response ranking, fact-checking, safety review, annotation, reasoning, instruction-following), quiz scores, and daily activity streak</li>
        <li>Your current position in the curriculum (module/lesson)</li>
      </ul>

      <h3>1.5 AI Interview Simulator Data</h3>
      <ul>
        <li>The role/platform you practice for, and full session transcripts of what you (and the AI interviewer) said or typed</li>
        <li>Computed scores, competency ratings, identified strengths and growth areas, and the AI-generated interview report</li>
        <li>Your total interview sessions started and remaining session credits</li>
        <li>
          <strong>Live voice sessions:</strong> when you use spoken (not typed) interview practice, your microphone
          audio is streamed in real time to Vapi, a third-party voice-AI platform, to power the live conversation.
          See Section 4 for how Vapi and Google (our AI providers) handle this data.
        </li>
      </ul>

      <h3>1.6 Payment &amp; Billing Data</h3>
      <ul>
        <li>Your payments are processed entirely by Stripe — we never see or store your full card number</li>
        <li>We do store: your Stripe customer ID, checkout session ID, payment intent ID, which product you purchased, the amount and currency charged, and the purchase/subscription status</li>
        <li>For recurring subscribers: subscription status and renewal date</li>
      </ul>

      <h3>1.7 Affiliate Program Data</h3>
      <ul>
        <li>If you join our affiliate program: your unique referral code and commission rate</li>
        <li>Records of sales attributed to your code — the buyer&apos;s account, sale amount, commission earned, and payout status</li>
        <li>Manual payouts (bank transfer/PayPal) happen outside the platform and may require us to collect payout details from you directly (e.g. by email)</li>
      </ul>

      <h3>1.8 Testimonials You Submit</h3>
      <ul>
        <li>If you submit a review/testimonial, its content, your name, role, star rating, and any photo you provide may be displayed publicly on our marketing pages</li>
      </ul>

      <h3>1.9 Cookies &amp; Locally Stored Data</h3>
      <ul>
        <li><strong>Authentication cookies</strong> (set by Supabase Auth): required to keep you signed in. These are essential and cannot be disabled without logging you out.</li>
        <li><strong>Referral cookie (<code>gr_ref</code>):</strong> if you arrive via someone&apos;s affiliate link, we store their referral code in a cookie for 60 days so we can credit the correct affiliate at checkout.</li>
        <li><strong>Local browser storage:</strong> we use your browser&apos;s local storage (not sent to our servers) to remember interface preferences — such as your last-viewed tab, dark/light theme, and where you left off in a lesson or practice session — purely so a page refresh returns you to the same spot.</li>
      </ul>

      <h3>1.10 Automatically Collected Technical Data</h3>
      <ul>
        <li>Our hosting provider (Vercel) and database provider (Supabase) automatically log standard web request data — IP address, browser/device user agent, request timestamps — for security, abuse prevention, and reliability, per their own privacy policies.</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To create and secure your account, and authenticate you when you sign in</li>
        <li>To deliver the core Service: track your learning progress, run practice tasks, and generate AI interview reports and feedback</li>
        <li>To process payments, grant the access tier you purchased, and manage subscriptions/renewals</li>
        <li>To operate the affiliate program and calculate/pay commissions</li>
        <li>To respond to support requests sent to <a href="mailto:contact@globalready.com">contact@globalready.com</a></li>
        <li>To display testimonials you&apos;ve consented to share publicly</li>
        <li>To maintain security, prevent fraud/abuse, and comply with legal obligations</li>
        <li>To improve the Service based on aggregate, de-identified usage patterns</li>
      </ul>
      <p>We do not sell your personal data, and we do not use your learning or interview data to train third-party advertising profiles.</p>

      <h2>3. Who We Share Data With</h2>
      <p>We share data only with the service providers necessary to operate the platform, each acting as a data processor on our behalf:</p>
      <ul>
        <li><strong>Supabase</strong> — our database, authentication, and file-storage provider. Stores nearly all account, profile, progress, and file data described above.</li>
        <li><strong>Stripe</strong> — processes all payments. Receives your email, name, and purchase details; handles and stores your payment card details directly (we never do).</li>
        <li><strong>Google (Gemini API / Google GenAI)</strong> — processes resume/CV content for parsing, generates AI interview questions, and generates AI interview reports and voice responses.</li>
        <li><strong>Google (Sign in with Google)</strong> — if you choose this sign-in method, authenticates you and shares your basic profile info with us.</li>
        <li><strong>Vapi</strong> — powers real-time spoken conversation during live-voice AI Interview Simulator sessions; receives your microphone audio for that purpose.</li>
        <li><strong>Vercel</strong> — hosts the application and processes standard web request logs.</li>
      </ul>
      <p>We may also disclose information if required by law, to enforce our Terms of Service, or to protect the rights, property, or safety of Global Ready AIEval, our users, or others.</p>

      <h2>4. Data Retention</h2>
      <p>
        We retain your account data for as long as your account is active. Interview transcripts, reports, and
        practice submissions are retained until you delete your account or specifically request their removal.
        Purchase and affiliate-commission records may be retained after account deletion where necessary for
        accounting, tax, or legal recordkeeping obligations.
      </p>

      <h2>5. Data Security</h2>
      <p>
        We rely on our infrastructure providers&apos; security controls — encrypted connections (TLS) in transit,
        encryption at rest, hashed passwords, and row-level database access rules that restrict each account to its
        own data. No method of transmission or storage is 100% secure, and we cannot guarantee absolute security.
      </p>

      <h2>6. Your Rights &amp; Choices</h2>
      <ul>
        <li><strong>Access &amp; correction:</strong> most profile fields can be viewed and edited directly in your Account Settings.</li>
        <li>
          <strong>Deletion:</strong> you can permanently delete your account at any time from Account Settings. This
          immediately and irreversibly deletes your profile, progress, practice submissions, interview history, and
          all associated data.
        </li>
        <li><strong>Portability:</strong> you may request an export of your data by emailing us.</li>
        <li>
          <strong>EU/UK/EEA residents (GDPR):</strong> you additionally have the right to restrict or object to
          processing, and to lodge a complaint with your local data protection authority.
        </li>
        <li>
          <strong>California residents (CCPA/CPRA):</strong> you have the right to know what personal information we
          collect, request deletion, and not be discriminated against for exercising these rights. We do not sell or
          share personal information for cross-context behavioral advertising.
        </li>
      </ul>
      <p>To exercise any of these rights, email <a href="mailto:contact@globalready.com">contact@globalready.com</a>.</p>

      <h2>7. International Data Transfers</h2>
      <p>
        Our service providers may process and store data in countries other than your own, including the United
        States. Where required, we rely on appropriate safeguards (such as standard contractual clauses) offered by
        those providers for cross-border transfers.
      </p>

      <h2>8. Children&apos;s Privacy</h2>
      <p>
        The Service is intended for users aged 18 and over, as it involves paid job-training content and financial
        transactions. We do not knowingly collect data from anyone under 18. If you believe a minor has provided us
        data, contact us and we will delete it.
      </p>

      <h2>9. Third-Party Links</h2>
      <p>
        Our platform links to third-party assessment platforms (e.g. Outlier, Scale AI, Alignerr, Mercor, Micro1) and
        payment/billing tools. We are not responsible for the privacy practices of those third parties — review their
        own policies before using them.
      </p>

      <h2>10. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Material changes will be reflected by updating the
        &quot;Effective&quot; date at the top of this page. Continued use of the Service after changes take effect
        constitutes acceptance of the revised policy.
      </p>

      <h2>11. Contact Us</h2>
      <p>
        Questions about this policy or your data? Email <a href="mailto:contact@globalready.com">contact@globalready.com</a>.
      </p>
    </LegalPageShell>
  );
}
