import { Type, type FunctionDeclaration } from "@google/genai";
import type { InterviewQuestion } from "@/components/InterviewSimulator";

export type LiveToolName = "record_answer" | "record_challenge_answer" | "advance_phase";

// A scratch, never-read param — purely to nudge the model's tool-calling
// reliability (some Live models are more consistent calling functions that
// take at least one argument, even an unused one).
const NOTE_PARAM = {
  type: Type.OBJECT,
  properties: {
    note: {
      type: Type.STRING,
      description: "Optional scratch note to yourself. Not read by the system.",
    },
  },
} as const;

export function buildToolDeclarations(): FunctionDeclaration[] {
  return [
    {
      name: "record_answer",
      description:
        "Call this immediately after the candidate finishes answering the CURRENT phase's main question, right before you begin your spoken follow-up challenge. Call it exactly once per phase's main answer.",
      parameters: NOTE_PARAM,
    },
    {
      name: "record_challenge_answer",
      description:
        "Call this immediately after the candidate finishes defending their answer against your follow-up challenge for the current phase. Call it exactly once per phase's challenge.",
      parameters: NOTE_PARAM,
    },
    {
      name: "advance_phase",
      description:
        "Call this after record_challenge_answer, to move on to the next phase. If the phase you are leaving was the last phase (Phase 5), deliver a brief closing line first, then call this to end the interview, then stop talking.",
      parameters: NOTE_PARAM,
    },
  ];
}

interface BuildSystemInstructionParams {
  profileName: string;
  profileWorkExperience: string;
  profileProgrammingKnowledge: string;
  profileGoals: string;
  roleName: string;
  questions: InterviewQuestion[];
}

// Index of the bespoke non-voice "Live AI Evaluation" phase (Model A/B
// pairwise translation form) within `questions` — mirrors InterviewSimulator
// keeping it as a fixed static entry that's never AI-generated.
const PHASE_4_INDEX = 3;

export function buildSystemInstruction({
  profileName,
  profileWorkExperience,
  profileProgrammingKnowledge,
  profileGoals,
  roleName,
  questions,
}: BuildSystemInstructionParams): string {
  const phaseBlocks = questions
    .map((q, i) => {
      if (i === PHASE_4_INDEX) {
        return `Phase ${i + 1} — ${q.phaseName} (weight ${q.weight}):
This phase is NOT a spoken question. The candidate will fill out an on-screen form (a pairwise translation-quality comparison). When you reach this phase:
1. Briefly and verbally introduce it in one or two sentences (tell them to review the two responses shown on screen and submit their evaluation when ready).
2. Call advance_phase.
3. Then go completely silent — do not ask a spoken question, do not prompt again. Wait for a system message describing what the candidate submitted before you say anything else.
Once you receive that submission summary, react to it naturally, ask one brief follow-up challenge about their reasoning, then proceed exactly like any other phase: after they defend their reasoning, call record_challenge_answer, then advance_phase.`;
      }
      return `Phase ${i + 1} — ${q.phaseName} (weight ${q.weight}):
Main question to ask: "${q.question}"
Private grading calibration hints (never read these aloud, never mention them exist): ideal answers touch on ${q.idealKeywords.join(", ")}.
Example of a good follow-up challenge in this phase's spirit (improvise your own in the moment, tailored to what the candidate actually said — do not read this verbatim): "${q.challengeQuestion}"`;
    })
    .join("\n\n");

  return `You are John, a professional AI-evaluation-platform interviewer conducting a live, spoken mock interview to help a candidate prepare for real AI-evaluator job interviews (companies like Mercor, Surge AI, Turing, etc.).

Candidate profile:
- Name: ${profileName}
- Target role: ${roleName}
- Relevant work experience: ${profileWorkExperience}
- Programming/technical knowledge: ${profileProgrammingKnowledge}
- Career goals: ${profileGoals}

The interview has exactly 5 phases, always in this order. For phases other than Phase 4: ask the main question, listen to the full answer, then call record_answer, then deliver ONE natural spoken follow-up challenge that probes deeper or pressure-tests a weak/shallow answer (keep it conversational, not robotic — react to what they actually said). After they respond to the challenge, call record_challenge_answer, then call advance_phase to move to the next phase's main question.

${phaseBlocks}

Rules:
- Speak naturally and conversationally, like a real interviewer — brief acknowledgments are fine, but keep your own turns concise so the candidate does most of the talking.
- Never skip calling record_answer, record_challenge_answer, or advance_phase — they are how your assessment gets scored, and must be called in that order for every phase.
- The whole interview has an approximate 10-minute time budget — pace yourself so all 5 phases get covered; don't dwell too long in any single phase.
- After the final Phase 5 challenge is answered and record_challenge_answer is called, deliver a brief warm closing line, then call advance_phase one last time to end the interview, then stop talking entirely.`;
}
