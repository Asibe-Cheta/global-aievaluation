import App from "@/App";
import LandingGate from "@/components/LandingGate";
import { createClient } from "@/lib/supabase/server";
import { getModuleCurriculum, getAchievements, getJobs, getUserStats } from "@/lib/content";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <LandingGate />;
  }

  const [moduleCurriculum, achievements, jobs, initialStats] = await Promise.all([
    getModuleCurriculum(),
    getAchievements(),
    getJobs(),
    getUserStats(user.id, user.email!),
  ]);

  return (
    <App
      userId={user.id}
      moduleCurriculum={moduleCurriculum}
      achievements={achievements}
      jobs={jobs}
      initialStats={initialStats}
    />
  );
}
