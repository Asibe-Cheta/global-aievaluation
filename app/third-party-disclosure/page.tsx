import type { Metadata } from "next";
import LegalPageShell from "@/components/LegalPageShell";

export const metadata: Metadata = {
  title: "Third-Party Platforms Disclaimer",
  description: "Our job board, referral links, and independence from the platforms we help you prepare for.",
};

export default function ThirdPartyDisclosurePage() {
  return (
    <LegalPageShell title="Third-Party Platforms & Career Disclaimer" effectiveDate="01.09.2026">
      <p>
        Global Ready AIEval is operated by John Chiatu Bimi, Mastweg 83, 42349 Wuppertal, Germany. Email:{" "}
        <a href="mailto:contact@globalready.tech">contact@globalready.tech</a>. This notice should be read together
        with our Terms of Service, which addresses our independence from third-party platforms more broadly.
      </p>

      <h2>Job Board, Opportunity Listings and Referral Links</h2>
      <p>
        Global Ready AIEval may curate and display links to jobs, freelance opportunities, projects, talent
        networks and other opportunities offered by third-party companies.
      </p>
      <p>Unless expressly stated otherwise:</p>
      <ul>
        <li>Global Ready AIEval is not the employer;</li>
        <li>Global Ready AIEval is not the recruiter responsible for the opportunity;</li>
        <li>Applications are submitted to the relevant third-party platform or company;</li>
        <li>The third party controls its own hiring, assessments, eligibility requirements, project allocation and compensation.</li>
      </ul>

      <h2>Referral Links</h2>
      <p>Some links displayed through the Global Ready AIEval job board may be referral or affiliate links.</p>
      <p>This means Global Ready AIEval may receive a referral payment, commission, credit or other benefit if a user:</p>
      <ul>
        <li>Clicks a referral link;</li>
        <li>Creates an account;</li>
        <li>Applies;</li>
        <li>Is accepted;</li>
        <li>Completes another qualifying action;</li>
      </ul>
      <p>depending on the terms of the relevant third-party referral programme.</p>
      <p>Where a link is a referral or affiliate link, Global Ready AIEval will identify the commercial relationship clearly where reasonably practical.</p>
      <p>Using a referral link should not increase the price paid by the user unless clearly disclosed otherwise.</p>

      <h2>Referral Relationships Do Not Mean Affiliation</h2>
      <p>A referral programme does not necessarily mean that Global Ready AIEval is:</p>
      <ul>
        <li>An official partner of the third-party platform;</li>
        <li>An authorised recruiter;</li>
        <li>An employee or agent of the platform;</li>
        <li>Endorsed by the platform; or</li>
        <li>Authorised to make hiring decisions for the platform.</li>
      </ul>
      <p>
        Participation in a referral programme should not be interpreted as a broader partnership unless Global
        Ready AIEval expressly states that such a relationship exists and is authorised.
      </p>

      <h2>Referral Compensation Does Not Guarantee Outcomes</h2>
      <p>Global Ready AIEval does not guarantee that using a referral link will result in:</p>
      <ul>
        <li>Priority consideration;</li>
        <li>An interview;</li>
        <li>Assessment success;</li>
        <li>Platform acceptance;</li>
        <li>Project allocation;</li>
        <li>Employment;</li>
        <li>A particular rate of pay; or</li>
        <li>Particular earnings.</li>
      </ul>
      <p>Third-party companies make their own recruitment and project decisions.</p>

      <h2>Curated Opportunities</h2>
      <p>Global Ready AIEval may select or highlight opportunities that we believe may be relevant to users. The presence of a listing does not constitute a guarantee regarding:</p>
      <ul>
        <li>Availability;</li>
        <li>Legitimacy;</li>
        <li>Compensation;</li>
        <li>Suitability;</li>
        <li>Hiring outcome; or</li>
        <li>Continued project availability.</li>
      </ul>
      <p>Users should verify important information directly with the relevant third-party company before submitting sensitive personal information or entering into an agreement.</p>
      <p>Where Global Ready AIEval receives a referral benefit in connection with a listing, that commercial relationship will be disclosed.</p>
    </LegalPageShell>
  );
}
