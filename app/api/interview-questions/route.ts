import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

interface GeneratedQuestion {
  question: string;
  idealKeywords: string[];
  sampleExcellentAnswer: string;
  challengeQuestion: string;
  challengeKeywords: string[];
  sampleExcellentChallengeAnswer: string;
}

const PHASE_BRIEFS = [
  {
    phaseName: "Resume & Experience Validation",
    brief:
      "Ask the candidate to walk through which of their background/experiences best prepares them for this specific role and platform. The challenge follow-up should pressure-test a domain-specific edge case that arises in that role's daily work.",
  },
  {
    phaseName: "AI Knowledge Assessment",
    brief:
      "Ask a technical question testing the AI/RLHF/evaluation knowledge specifically relevant to this role and platform (not generic RLHF trivia — tie it to what this role actually audits/produces). The challenge follow-up should probe a subtle failure mode or edge case in that same technical area.",
  },
  {
    phaseName: "Scenario-Based Interview",
    brief:
      "Present a realistic work scenario this role would face on this platform, with a genuine trade-off the candidate must navigate and justify. The challenge follow-up should introduce a conflicting directive that could flip their decision, and ask them to defend their revised call.",
  },
  {
    phaseName: "Behavioural & Work Style",
    brief:
      "Ask about sustaining quality/focus over long repetitive shifts specific to this role's actual daily tasks. The challenge follow-up should be a short closing remark transitioning to the final report (challengeQuestion can be a brief wrap-up line, challengeKeywords and sampleExcellentChallengeAnswer can be empty).",
  },
];

export async function POST(req: NextRequest) {
  const { platformName, platformStyle, roleName, roleDescription } = await req.json();

  if (!roleName || !platformName) {
    return NextResponse.json(
      { success: false, error: "Missing platformName or roleName." },
      { status: 400 },
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn(
      "GEMINI_API_KEY environment variable is missing. Falling back to the static interview question bank.",
    );
    return NextResponse.json({ success: false, warning: "Gemini API Key missing" });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });

    const phaseInstructions = PHASE_BRIEFS.map(
      (p, i) => `Phase ${i + 1} — "${p.phaseName}": ${p.brief}`,
    ).join("\n\n");

    const prompt = `You are designing a mock job interview for an AI training/evaluation platform's hiring screen.

Candidate is interviewing for the role of "${roleName}" (${roleDescription || "no extra description"}) on a platform styled like "${platformName}" (${platformStyle || "general AI evaluation platform"}).

Generate exactly 4 interview phases, each tailored specifically to this role and platform's domain — not generic AI trivia. Each phase needs a main question plus a "challenge" follow-up that pushes back on a strong answer to the main question.

${phaseInstructions}

For each phase provide:
- question: the interviewer's main question (2-4 sentences, in a professional but conversational interviewer voice)
- idealKeywords: 6-9 lowercase keywords/phrases an excellent answer would contain
- sampleExcellentAnswer: a model answer a strong candidate might give (3-5 sentences)
- challengeQuestion: the pushback/follow-up question testing if they can defend or adapt their answer
- challengeKeywords: 5-8 lowercase keywords/phrases an excellent challenge-response would contain
- sampleExcellentChallengeAnswer: a model answer to the challenge (3-5 sentences). For phase 4 this may be a short transition line instead, with empty challengeKeywords.

Return strictly the 4 phases in order.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ text: prompt }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              idealKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              sampleExcellentAnswer: { type: Type.STRING },
              challengeQuestion: { type: Type.STRING },
              challengeKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              sampleExcellentChallengeAnswer: { type: Type.STRING },
            },
            required: [
              "question",
              "idealKeywords",
              "sampleExcellentAnswer",
              "challengeQuestion",
              "challengeKeywords",
              "sampleExcellentChallengeAnswer",
            ],
          },
        },
      },
    });

    const textContent = response.text;
    if (!textContent) throw new Error("Empty response from Gemini API");

    const questions: GeneratedQuestion[] = JSON.parse(textContent);
    if (!Array.isArray(questions) || questions.length !== 4) {
      throw new Error("Gemini did not return exactly 4 phases");
    }

    return NextResponse.json({ success: true, questions });
  } catch (error: any) {
    console.error("Error generating interview questions with Gemini:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to generate interview questions",
    });
  }
}
