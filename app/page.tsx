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

  const [moduleCurriculum, achievements, jobs, initialStats, { data: profile }] =
    await Promise.all([
      getModuleCurriculum(),
      getAchievements(),
      getJobs(),
      getUserStats(user.id, user.email!),
      supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle(),
    ]);

  return (
    <App
      userId={user.id}
      moduleCurriculum={moduleCurriculum}
      achievements={achievements}
      jobs={jobs}
      initialStats={initialStats}
      isAdmin={profile?.is_admin ?? false}
    />
  );
}
