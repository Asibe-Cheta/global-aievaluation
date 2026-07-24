"use client";

import { useRouter } from "next/navigation";
import LandingView from "@/components/LandingView";
import type { Testimonial } from "@/types";

export default function LandingGate({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const router = useRouter();

  return (
    <LandingView
      testimonials={testimonials}
      onEnterPlatform={() => router.push("/signup")}
      onLogin={() => router.push("/login")}
    />
  );
}
