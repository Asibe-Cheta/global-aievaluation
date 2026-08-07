import { useCallback, useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import type { VapiAssistantConfig } from "@/lib/liveInterview/buildLiveConfig";

export interface VapiTranscriptEvent {
  speaker: "candidate" | "interviewer";
  text: string;
  isFinal: boolean;
}

export type VapiSessionStatus = "idle" | "connecting" | "connected" | "error" | "closed";

interface UseVapiInterviewSessionOptions {
  onTranscript: (e: VapiTranscriptEvent) => void;
  onStatusChange: (status: VapiSessionStatus) => void;
}

export interface VapiInterviewSessionHandle {
  connect: (assistantConfig: VapiAssistantConfig) => Promise<boolean>;
  disconnect: () => void;
  // Injects a message into the conversation without the candidate having
  // spoken it — used for the Phase 4 form's submission summary. Vapi
  // reads this as if it were said and (with triggerResponse) replies to it.
  sendSystemMessage: (text: string, triggerResponse?: boolean) => void;
  isAiSpeaking: boolean;
}

interface VapiTranscriptMessage {
  type: string;
  transcriptType?: "partial" | "final";
  role?: "user" | "assistant" | "system";
  transcript?: string;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Vapi call connect timed out")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

export function useVapiInterviewSession(options: UseVapiInterviewSessionOptions): VapiInterviewSessionHandle {
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  const vapiRef = useRef<Vapi | null>(null);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  const getVapi = useCallback((): Vapi | null => {
    if (vapiRef.current) return vapiRef.current;
    const token = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;
    if (!token) {
      console.error("NEXT_PUBLIC_VAPI_WEB_TOKEN is not set — live interview voice is unavailable.");
      return null;
    }
    vapiRef.current = new Vapi(token);
    return vapiRef.current;
  }, []);

  const cleanup = useCallback(() => {
    vapiRef.current?.stop();
    setIsAiSpeaking(false);
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const connect = useCallback(
    async (assistantConfig: VapiAssistantConfig): Promise<boolean> => {
      const vapi = getVapi();
      if (!vapi) {
        optionsRef.current.onStatusChange("error");
        return false;
      }

      optionsRef.current.onStatusChange("connecting");

      vapi.removeAllListeners();

      vapi.on("speech-start", () => setIsAiSpeaking(true));
      vapi.on("speech-end", () => setIsAiSpeaking(false));

      vapi.on("message", (message: VapiTranscriptMessage) => {
        if (message.type !== "transcript" || message.transcriptType !== "final" || !message.transcript) return;
        optionsRef.current.onTranscript({
          speaker: message.role === "assistant" ? "interviewer" : "candidate",
          text: message.transcript,
          isFinal: true,
        });
      });

      vapi.on("call-end", () => {
        setIsAiSpeaking(false);
        optionsRef.current.onStatusChange("closed");
      });

      vapi.on("error", (err) => {
        console.error("Vapi call error:", err);
      });

      try {
        await withTimeout(
          new Promise<void>((resolve, reject) => {
            vapi.once("call-start", () => resolve());
            vapi.once("call-start-failed", (e) => reject(new Error(e?.error || "Vapi call failed to start")));
            vapi.start(assistantConfig as any).catch(reject);
          }),
          15000,
        );
      } catch (err) {
        console.error("Failed to connect Vapi interview session:", err);
        cleanup();
        optionsRef.current.onStatusChange("error");
        return false;
      }

      optionsRef.current.onStatusChange("connected");
      return true;
    },
    [getVapi, cleanup],
  );

  const disconnect = useCallback(() => {
    cleanup();
    optionsRef.current.onStatusChange("closed");
  }, [cleanup]);

  const sendSystemMessage = useCallback((text: string, triggerResponse = true) => {
    vapiRef.current?.send({
      type: "add-message",
      message: { role: "system", content: text },
      triggerResponseEnabled: triggerResponse,
    });
  }, []);

  return { connect, disconnect, sendSystemMessage, isAiSpeaking };
}
