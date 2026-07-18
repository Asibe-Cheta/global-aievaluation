"use client";

import { useRouter } from "next/navigation";
import LandingView from "@/components/LandingView";

export default function LandingGate() {
  const router = useRouter();

  return <LandingView onEnterPlatform={() => router.push("/signup")} />;
}
