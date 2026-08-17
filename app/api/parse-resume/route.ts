import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import mammoth from "mammoth";

const DOCX_MIME_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export async function POST(req: NextRequest) {
  const { base64Data, mimeType, fileName } = await req.json();

  if (!base64Data || !mimeType) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing required parameters: base64Data and mimeType are required.",
      },
      { status: 400 },
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY environment variable is missing.");
    return NextResponse.json({
      success: false,
      error: "Resume parsing is temporarily unavailable. Please fill in your profile manually.",
    });
  }

  try {
    // Initialize the official Google GenAI client
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    console.log(`Starting Gemini resume parsing for ${fileName} (${mimeType})...`);

    // Gemini's document understanding (inlineData) only accepts PDFs,
    // images and plain text — NOT Word docs. .docx is the single most
    // common resume format, so extract its text ourselves first and send
    // that as a plain text part instead of the raw file.
    const documentPart =
      mimeType === DOCX_MIME_TYPE
        ? { text: (await mammoth.extractRawText({ buffer: Buffer.from(base64Data, "base64") })).value }
        : { inlineData: { data: base64Data, mimeType } };

    // Let's call gemini-3.5-flash (the best basic text and multimodal task model)
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        documentPart,
        {
          text: 'You are an expert resume parsing agent. Analyze this resume/CV document and extract candidate profile details to populate an onboarding questionnaire. Return a JSON object matching this schema exactly:\n{\n  "name": "Full name of candidate",\n  "education": "Brief degree/school details",\n  "workExperience": "Brief work history",\n  "aiExperience": "Brief AI/RLHF/prompting/annotation details",\n  "programmingKnowledge": "Brief coding proficiency summary",\n  "languages": "Languages spoken",\n  "remoteExperience": "Brief remote work experience details",\n  "goals": "Brief career/contract objectives"\n}\nDo not add any markup, tags or comments around the JSON.',
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            education: { type: Type.STRING },
            workExperience: { type: Type.STRING },
            aiExperience: { type: Type.STRING },
            programmingKnowledge: { type: Type.STRING },
            languages: { type: Type.STRING },
            remoteExperience: { type: Type.STRING },
            goals: { type: Type.STRING },
          },
          required: [
            "name",
            "education",
            "workExperience",
            "aiExperience",
            "programmingKnowledge",
            "languages",
            "remoteExperience",
            "goals",
          ],
        },
      },
    });

    const textContent = response.text;
    if (!textContent) {
      throw new Error("Empty response from Gemini API");
    }

    const parsedProfile = JSON.parse(textContent);
    console.log("Successfully parsed CV with Gemini:", parsedProfile.name);

    return NextResponse.json({
      success: true,
      profile: parsedProfile,
    });
  } catch (error: any) {
    console.error("Error parsing resume with Gemini:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to parse document. Please fill in your profile manually.",
    });
  }
}
