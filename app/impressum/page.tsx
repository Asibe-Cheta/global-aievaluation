import type { Metadata } from "next";
import LegalPageShell from "@/components/LegalPageShell";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Legal notice pursuant to § 5 Digitale-Dienste-Gesetz (DDG).",
};

export default function ImpressumPage() {
  return (
    <LegalPageShell title="Impressum / Legal Notice" effectiveDate="01.09.2026">
      <p>Information pursuant to § 5 Digitale-Dienste-Gesetz (DDG)</p>

      <h2>Service Provider</h2>
      <p>
        John Chiatu Bimi
        <br />
        Operating under the business name Global Ready AIEval
        <br />
        Mastweg 83
        <br />
        42349 Wuppertal
        <br />
        Germany
        <br />
        Email: <a href="mailto:contact@globalready.tech">contact@globalready.tech</a>
      </p>

      <h2>Responsible for Content</h2>
      <p>Responsible for the content of this website, where applicable:</p>
      <p>
        John Chiatu Bimi
        <br />
        Mastweg 83
        <br />
        42349 Wuppertal
        <br />
        Germany
      </p>

      <h2>Consumer Dispute Resolution</h2>
      <p>
        We are not obliged and do not currently undertake to participate in dispute-resolution proceedings before
        a consumer arbitration board, unless participation is required by applicable law.
      </p>

      <h2>Contact</h2>
      <p>
        For business, legal or general enquiries: <a href="mailto:contact@globalready.tech">contact@globalready.tech</a>
      </p>

      <h2>Independent Training Provider</h2>
      <p>Global Ready AIEval is an independent AI training and career-preparation service.</p>
      <p>
        Global Ready AIEval is not affiliated with, endorsed by, sponsored by, or acting on behalf of third-party
        AI evaluation, recruitment or work platforms referenced through the Service unless expressly stated
        otherwise.
      </p>
      <p>Third-party company names and trademarks remain the property of their respective owners.</p>
    </LegalPageShell>
  );
}
