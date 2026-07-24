import App from "@/App";
import LandingGate from "@/components/LandingGate";
import { createClient } from "@/lib/supabase/server";
import { getModuleCurriculum, getAchievements, getJobs, getUserStats, getTestimonials } from "@/lib/content";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const testimonials = await getTestimonials();
    return <LandingGate testimonials={testimonials} />;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, membership_tier")
    .eq("id", user.id)
    .maybeSingle();

  const [moduleCurriculum, achievements, jobs, initialStats] =
    await Promise.all([
      getModuleCurriculum(profile?.membership_tier ?? "starter"),
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
      isAdmin={profile?.is_admin ?? false}
    />
  );
}
