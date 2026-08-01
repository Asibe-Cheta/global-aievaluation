import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Modality } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

// Gemini TTS returns raw 16-bit PCM at 24kHz, mono — not directly playable
// by a browser <audio> element, so we wrap it in a minimal WAV header.
function pcmToWav(pcmBase64: string, sampleRate = 24000, channels = 1, bitsPerSample = 16): Buffer {
  const pcmData = Buffer.from(pcmBase64, "base64");
  const blockAlign = (channels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const header = Buffer.alloc(44);

  header.write("RIFF", 0, "ascii");
  header.writeUInt32LE(36 + pcmData.length, 4);
  header.write("WAVE", 8, "ascii");
  header.write("fmt ", 12, "ascii");
  header.writeUInt32LE(16, 16); // fmt chunk size
  header.writeUInt16LE(1, 20); // PCM format
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36, "ascii");
  header.writeUInt32LE(pcmData.length, 40);

  return Buffer.concat([header, pcmData]);
}

const INTERVIEWER_VOICE = "Charon"; // Gemini prebuilt voice — informative/authoritative tone

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }

  const { text } = await req.json();

  if (!text || typeof text !== "string") {
    return NextResponse.json(
      { success: false, error: "Missing required parameter: text." },
      { status: 400 },
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      success: false,
      warning: "Gemini API Key missing — falling back to browser voice.",
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: INTERVIEWER_VOICE },
          },
        },
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    const pcmBase64 = part?.inlineData?.data;

    if (!pcmBase64) {
      throw new Error("Gemini returned no audio data.");
    }

    const wavBuffer = pcmToWav(pcmBase64);

    return NextResponse.json({
      success: true,
      audioBase64: wavBuffer.toString("base64"),
    });
  } catch (error: any) {
    console.error("Error generating interview voice with Gemini:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to generate speech",
    });
  }
}
