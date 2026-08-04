// AudioWorkletProcessor that converts mic input (mono Float32 frames) into
// 16-bit PCM and posts ~200ms chunks back to the main thread as zero-copy
// transferable ArrayBuffers, for streaming to Gemini Live via
// session.sendRealtimeInput({ audio: { data, mimeType: "audio/pcm;rate=16000" } }).
//
// Assumes the AudioContext was constructed with sampleRate: 16000 — the
// caller (hooks/useLiveInterviewSession.ts) is responsible for verifying
// that request was actually honored by the browser before relying on this.
class PcmRecorderProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._chunks = [];
    this._chunkSamples = 0;
    // ~200ms @ 16kHz mono.
    this._targetSamples = 3200;
  }

  process(inputs) {
    const input = inputs[0];
    const channel = input && input[0];
    if (channel && channel.length > 0) {
      const int16 = new Int16Array(channel.length);
      for (let i = 0; i < channel.length; i++) {
        const s = Math.max(-1, Math.min(1, channel[i]));
        int16[i] = s < 0 ? s * 32768 : s * 32767;
      }
      this._chunks.push(int16);
      this._chunkSamples += int16.length;

      if (this._chunkSamples >= this._targetSamples) {
        const merged = new Int16Array(this._chunkSamples);
        let offset = 0;
        for (const c of this._chunks) {
          merged.set(c, offset);
          offset += c.length;
        }
        this._chunks = [];
        this._chunkSamples = 0;
        this.port.postMessage(merged.buffer, [merged.buffer]);
      }
    }
    return true;
  }
}

registerProcessor("pcm-recorder-processor", PcmRecorderProcessor);
