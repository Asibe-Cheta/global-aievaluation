import type { Metadata } from "next";
import LegalPageShell from "@/components/LegalPageShell";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Which cookies Global Ready AIEval sets and why.",
};

export default function CookiePolicyPage() {
  return (
    <LegalPageShell title="Cookie Policy" effectiveDate="01.09.2026" showDraftNotice>
      <p>
        This Cookie Policy explains which cookies and similar local-storage technologies Global Ready AIEval
        actually uses, and why. It should be read together with our Privacy Policy.
      </p>
      <p>
        Global Ready AIEval is operated by John Chiatu Bimi, Mastweg 83, 42349 Wuppertal, Germany. Email:{" "}
        <a href="mailto:contact@globalready.tech">contact@globalready.tech</a>.
      </p>

      <h2>1. Essential Cookies</h2>
      <p>These are required for the Service to function and cannot be switched off without breaking login or checkout. They are not subject to consent under § 25 TDDDG, as they fall within the statutory necessity exception.</p>
      <ul>
        <li>
          <strong>Authentication session cookies</strong> — set by our authentication provider (Supabase Auth) to
          keep you signed in between page loads. Removed when you log out or expire automatically.
        </li>
      </ul>

      <h2>2. Referral-Attribution Cookie</h2>
      <p>
        If you arrive via someone&apos;s affiliate/referral link (a URL containing a <code>?ref=</code> parameter),
        we set a cookie named <code>gr_ref</code> storing that referral code for up to 60 days, so the correct
        affiliate can be credited if you later make a purchase.
      </p>
      <p>
        This cookie is used only for commission attribution — it does not track your browsing beyond that single
        purpose, and it is not shared with advertisers. Where consent is required for this category, you will be
        able to accept or decline it via the cookie banner; declining does not prevent you from using the Service,
        it only means an affiliate referral won&apos;t be credited.
      </p>

      <h2>3. Local Storage (Not Cookies)</h2>
      <p>
        Separately from cookies, your browser&apos;s local storage is used to remember interface preferences —
        such as your last-viewed tab, dark/light theme, and where you left off in a lesson or practice session.
        This data stays in your browser, is never transmitted to our servers, and exists purely so a page refresh
        returns you to where you were.
      </p>

      <h2>4. What We Do Not Use</h2>
      <p>
        Global Ready AIEval does not currently use analytics cookies, advertising cookies, or third-party
        tracking/retargeting pixels of any kind. If that changes in the future, this page and the cookie banner
        will be updated accordingly, and consent will be requested before any such technology is activated.
      </p>

      <h2>5. Managing Your Choice</h2>
      <p>
        You can change your cookie choice at any time using the &quot;Cookie Settings&quot; link in the site
        footer. You can also block or delete cookies entirely through your browser settings, though this may log
        you out or prevent referral attribution from working.
      </p>

      <h2>6. Contact</h2>
      <p>
        Questions about this Cookie Policy can be sent to{" "}
        <a href="mailto:contact@globalready.tech">contact@globalready.tech</a>.
      </p>
    </LegalPageShell>
  );
}
