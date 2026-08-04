import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

// The model the ephemeral token is locked to — must match the model
// hooks/useLiveInterviewSession.ts passes to ai.live.connect().
const LIVE_MODEL = "gemini-live-2.5-flash-preview";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      success: false,
      warning: "Gemini API Key missing — live voice unavailable.",
    });
  }

  try {
    // Ephemeral auth tokens are v1alpha-only — required here on the client
    // that MINTS the token, not just on the browser client that later
    // connects with it (per the SDK's own Tokens.create() JSDoc example).
    const ai = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: "v1alpha" } });

    const now = Date.now();
    const token = await ai.authTokens.create({
      config: {
        uses: 1,
        // Covers the 10-minute interview cap plus setup/report buffer.
        expireTime: new Date(now + 16 * 60 * 1000).toISOString(),
        newSessionExpireTime: new Date(now + 3 * 60 * 1000).toISOString(),
        liveConnectConstraints: {
          model: LIVE_MODEL,
        },
      },
    });

    return NextResponse.json({ success: true, token: token.name });
  } catch (error: any) {
    console.error("Error minting Gemini Live ephemeral token:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to create live session token",
    });
  }
}
