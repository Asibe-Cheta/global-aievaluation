import type { Metadata } from "next";
import PublicJobsView from "@/components/PublicJobsView";
import { getJobs } from "@/lib/content";

export const metadata: Metadata = {
  title: "AI Evaluation Jobs & Remote Contracts",
  description:
    "Curated remote AI evaluation, data annotation, and RLHF contract opportunities — free and open to everyone, no signup required.",
};

export default async function PublicJobsPage() {
  const jobs = await getJobs();
  return <PublicJobsView jobs={jobs} />;
}
