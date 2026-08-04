import { useCallback, useEffect, useRef, useState } from "react";
import { GoogleGenAI, Modality, type FunctionDeclaration, type LiveServerMessage, type Session } from "@google/genai";
import { arrayBufferToBase64, base64ToInt16Array, int16ToFloat32 } from "@/lib/liveInterview/audioUtils";
import type { LiveToolName } from "@/lib/liveInterview/buildLiveConfig";

// Must match app/api/interview-live-token/route.ts's LIVE_MODEL — the
// ephemeral token is locked to this model server-side.
const LIVE_MODEL = "gemini-live-2.5-flash-preview";

export interface LiveTranscriptEvent {
  speaker: "candidate" | "interviewer";
  text: string;
  isFinal: boolean;
}

export interface LiveToolCallEvent {
  id: string;
  name: LiveToolName;
  args: Record<string, unknown>;
}

export type LiveSessionStatus = "idle" | "connecting" | "connected" | "error" | "closed";

interface UseLiveInterviewSessionOptions {
  onTranscript: (e: LiveTranscriptEvent) => void;
  onToolCall: (call: LiveToolCallEvent) => void;
  onInterrupted: () => void;
  onStatusChange: (status: LiveSessionStatus) => void;
}

interface ConnectParams {
  systemInstruction: string;
  tools: FunctionDeclaration[];
  kickoffMessage: string;
}

export interface LiveInterviewSessionHandle {
  connect: (p: ConnectParams) => Promise<boolean>;
  disconnect: () => void;
  pauseMic: () => void;
  resumeMic: () => void;
  sendClientText: (text: string) => void;
  consumeCandidateBuffer: () => string;
  ackToolCall: (id: string, name: string) => void;
  isAiSpeaking: boolean;
}

function isLiveSessionSupported(): boolean {
  if (typeof window === "undefined") return false;
  if (!window.isSecureContext) return false;
  if (!("AudioContext" in window)) return false;
  if (!navigator.mediaDevices?.getUserMedia) return false;
  return true;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Live session connect timed out")), ms);
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

export function useLiveInterviewSession(options: UseLiveInterviewSessionOptions): LiveInterviewSessionHandle {
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  const sessionRef = useRef<Session | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micPausedRef = useRef(false);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const playbackSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextPlaybackTimeRef = useRef(0);
  const candidateBufferRef = useRef("");
  const interviewerBufferRef = useRef("");

  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  const flushPlaybackQueue = useCallback(() => {
    for (const source of playbackSourcesRef.current) {
      try {
        source.onended = null;
        source.stop();
      } catch {
        // Already stopped/ended — fine to ignore.
      }
    }
    playbackSourcesRef.current = [];
    nextPlaybackTimeRef.current = outputAudioCtxRef.current?.currentTime ?? 0;
    setIsAiSpeaking(false);
  }, []);

  const schedulePlayback = useCallback((base64Data: string) => {
    const outputCtx = outputAudioCtxRef.current;
    if (!outputCtx) return;

    const int16 = base64ToInt16Array(base64Data);
    const float32 = int16ToFloat32(int16);
    const buffer = outputCtx.createBuffer(1, float32.length, 24000);
    buffer.copyToChannel(float32, 0);

    const source = outputCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(outputCtx.destination);

    const startAt = Math.max(nextPlaybackTimeRef.current, outputCtx.currentTime);
    source.start(startAt);
    nextPlaybackTimeRef.current = startAt + buffer.duration;

    playbackSourcesRef.current.push(source);
    setIsAiSpeaking(true);
    source.onended = () => {
      playbackSourcesRef.current = playbackSourcesRef.current.filter((s) => s !== source);
      if (playbackSourcesRef.current.length === 0) {
        setIsAiSpeaking(false);
      }
    };
  }, []);

  const handleMessage = useCallback(
    (msg: LiveServerMessage) => {
      const functionCalls = msg.toolCall?.functionCalls;
      if (functionCalls) {
        for (const call of functionCalls) {
          if (!call.id || !call.name) continue;
          optionsRef.current.onToolCall({
            id: call.id,
            name: call.name as LiveToolName,
            args: call.args ?? {},
          });
        }
      }

      const content = msg.serverContent;
      if (!content) return;

      if (content.interrupted) {
        flushPlaybackQueue();
        optionsRef.current.onInterrupted();
      }

      if (content.inputTranscription?.text) {
        candidateBufferRef.current += content.inputTranscription.text;
        optionsRef.current.onTranscript({
          speaker: "candidate",
          text: candidateBufferRef.current,
          isFinal: !!content.inputTranscription.finished,
        });
      }

      if (content.outputTranscription?.text) {
        interviewerBufferRef.current += content.outputTranscription.text;
      }

      const parts = content.modelTurn?.parts;
      if (parts) {
        for (const part of parts) {
          const inline = part.inlineData;
          if (inline?.data && inline.mimeType?.startsWith("audio/")) {
            schedulePlayback(inline.data);
          }
        }
      }

      if (content.turnComplete && interviewerBufferRef.current) {
        optionsRef.current.onTranscript({
          speaker: "interviewer",
          text: interviewerBufferRef.current,
          isFinal: true,
        });
        interviewerBufferRef.current = "";
      }
    },
    [flushPlaybackQueue, schedulePlayback],
  );

  const cleanup = useCallback(() => {
    if (workletNodeRef.current) {
      try {
        workletNodeRef.current.port.close();
        workletNodeRef.current.disconnect();
      } catch {
        // Ignore — node may already be torn down.
      }
      workletNodeRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }

    flushPlaybackQueue();
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close().catch(() => {});
      outputAudioCtxRef.current = null;
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }

    if (sessionRef.current) {
      try {
        sessionRef.current.close();
      } catch {
        // Ignore — socket may already be closed.
      }
      sessionRef.current = null;
    }

    candidateBufferRef.current = "";
    interviewerBufferRef.current = "";
    micPausedRef.current = false;
  }, [flushPlaybackQueue]);

  useEffect(() => cleanup, [cleanup]);

  const connect = useCallback(
    async ({ systemInstruction, tools, kickoffMessage }: ConnectParams): Promise<boolean> => {
      if (!isLiveSessionSupported()) return false;

      optionsRef.current.onStatusChange("connecting");

      try {
        const tokenRes = await fetch("/api/interview-live-token", { method: "POST" });
        const tokenData = await tokenRes.json();
        if (!tokenData.success || !tokenData.token) {
          optionsRef.current.onStatusChange("error");
          return false;
        }

        const micStream = await navigator.mediaDevices.getUserMedia({
          audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
        });
        micStreamRef.current = micStream;

        const ai = new GoogleGenAI({
          apiKey: tokenData.token,
          httpOptions: { apiVersion: "v1alpha" },
        });

        const session = await withTimeout(
          ai.live.connect({
            model: LIVE_MODEL,
            config: {
              responseModalities: [Modality.AUDIO],
              systemInstruction,
              tools: [{ functionDeclarations: tools }],
              inputAudioTranscription: {},
              outputAudioTranscription: {},
            },
            callbacks: {
              onmessage: handleMessage,
              onerror: (e) => {
                console.error("Live interview session error:", e);
              },
              onclose: () => {
                optionsRef.current.onStatusChange("closed");
              },
            },
          }),
          8000,
        );
        sessionRef.current = session;

        const inputCtx = new AudioContext({ sampleRate: 16000 });
        inputAudioCtxRef.current = inputCtx;
        if (!inputCtx.audioWorklet) {
          throw new Error("AudioWorklet not supported in this browser");
        }
        await inputCtx.audioWorklet.addModule("/worklets/pcm-recorder-worklet.js");

        const sourceNode = inputCtx.createMediaStreamSource(micStream);
        const workletNode = new AudioWorkletNode(inputCtx, "pcm-recorder-processor");
        workletNode.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
          if (micPausedRef.current) return;
          const activeSession = sessionRef.current;
          if (!activeSession) return;
          activeSession.sendRealtimeInput({
            audio: {
              data: arrayBufferToBase64(e.data),
              mimeType: `audio/pcm;rate=${inputCtx.sampleRate}`,
            },
          });
        };
        sourceNode.connect(workletNode);
        workletNodeRef.current = workletNode;

        outputAudioCtxRef.current = new AudioContext();
        nextPlaybackTimeRef.current = 0;

        session.sendClientContent({
          turns: [{ role: "user", parts: [{ text: kickoffMessage }] }],
          turnComplete: true,
        });

        optionsRef.current.onStatusChange("connected");
        return true;
      } catch (err) {
        console.error("Failed to connect live interview session:", err);
        cleanup();
        optionsRef.current.onStatusChange("error");
        return false;
      }
    },
    [handleMessage, cleanup],
  );

  const disconnect = useCallback(() => {
    cleanup();
    optionsRef.current.onStatusChange("closed");
  }, [cleanup]);

  const pauseMic = useCallback(() => {
    micPausedRef.current = true;
    micStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = false;
    });
    inputAudioCtxRef.current?.suspend().catch(() => {});
  }, []);

  const resumeMic = useCallback(() => {
    micPausedRef.current = false;
    micStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = true;
    });
    inputAudioCtxRef.current?.resume().catch(() => {});
  }, []);

  const sendClientText = useCallback((text: string) => {
    sessionRef.current?.sendClientContent({
      turns: [{ role: "user", parts: [{ text }] }],
      turnComplete: true,
    });
  }, []);

  const consumeCandidateBuffer = useCallback((): string => {
    const text = candidateBufferRef.current.trim();
    candidateBufferRef.current = "";
    return text;
  }, []);

  const ackToolCall = useCallback((id: string, name: string) => {
    sessionRef.current?.sendToolResponse({
      functionResponses: { id, name, response: { output: "ok" } },
    });
  }, []);

  return {
    connect,
    disconnect,
    pauseMic,
    resumeMic,
    sendClientText,
    consumeCandidateBuffer,
    ackToolCall,
    isAiSpeaking,
  };
}
