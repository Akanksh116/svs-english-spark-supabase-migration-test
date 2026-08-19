import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Speech-to-text only. No audio is recorded, stored or uploaded anywhere —
 * the browser's SpeechRecognition engine converts speech to text in place and
 * we keep the transcript in React state until the user sends it to the coach.
 */

export type RecorderStatus = "idle" | "recording" | "paused" | "stopped";
export type MicPermission = "unknown" | "granted" | "denied" | "unavailable";

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  [index: number]: { transcript?: string; confidence?: number } | undefined;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: { length: number; [index: number]: SpeechRecognitionResultLike };
};

type SpeechRecognitionErrorEventLike = { error?: string };

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  onstart?: (() => void) | null;
};

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as
    | (new () => SpeechRecognitionLike)
    | null;
}

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(pointer: coarse)").matches ?? false;
}

export interface VoiceRecorderState {
  status: RecorderStatus;
  seconds: number;
  permission: MicPermission;
  error: string | null;
  transcript: string;
  interim: string;
  /** Average recognition confidence (0-100) or null when the browser gives none. */
  confidence: number | null;
  /** True when this browser exposes a usable SpeechRecognition engine. */
  speechSupported: boolean;
  /** Separate capability: whether the device exposes a microphone stream at all. */
  micSupported: boolean;
  start: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
  setTranscript: (text: string) => void;
}

export function useVoiceRecorder(lang = "en-US"): VoiceRecorderState {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [seconds, setSeconds] = useState(0);
  const [permission, setPermission] = useState<MicPermission>("unknown");
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [confidence, setConfidence] = useState<number | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const wantRecognitionRef = useRef(false);
  const confRef = useRef<{ sum: number; count: number }>({ sum: 0, count: 0 });
  const restartsRef = useRef(0);

  // Capability detection happens after mount so SSR output stays stable.
  const [speechSupported, setSpeechSupported] = useState(true);
  const [micSupported, setMicSupported] = useState(true);

  useEffect(() => {
    setSpeechSupported(Boolean(getRecognitionCtor()));
    setMicSupported(
      typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia),
    );
  }, []);

  useEffect(() => {
    if (status !== "recording") return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  const stopRecognition = useCallback(() => {
    wantRecognitionRef.current = false;
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (!recognition) return;
    recognition.onend = null;
    recognition.onerror = null;
    recognition.onresult = null;
    try {
      recognition.stop();
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => () => stopRecognition(), [stopRecognition]);

  const startRecognition = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setError(
        "Speech-to-text isn't supported in this browser. Use the microphone on your phone keyboard to type your answer.",
      );
      return false;
    }
    const recognition = new Ctor();
    recognition.lang = lang;
    // Mobile engines (Android Chrome, iOS Safari) stop after each utterance and
    // often misbehave with continuous mode, so we restart them from onend instead.
    recognition.continuous = !isTouchDevice();
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setPermission("granted");
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let live = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const alt = result[0];
        if (result.isFinal) {
          const text = String(alt?.transcript ?? "").trim();
          if (text) setTranscript((prev) => (prev ? `${prev} ${text}` : text));
          const c = Number(alt?.confidence);
          if (Number.isFinite(c) && c > 0) {
            confRef.current.sum += c;
            confRef.current.count += 1;
            setConfidence(Math.round((confRef.current.sum / confRef.current.count) * 100));
          }
        } else {
          live += alt?.transcript ?? "";
        }
      }
      setInterim(live.trim());
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      const code = String(event?.error ?? "");
      // Never clear the transcript on a recoverable error.
      if (code === "no-speech" || code === "aborted") return;
      if (code === "not-allowed" || code === "service-not-allowed") {
        wantRecognitionRef.current = false;
        setPermission("denied");
        setStatus("stopped");
        setError(
          "Microphone access is blocked. Allow microphone access in your browser settings and try again.",
        );
        return;
      }
      if (code === "audio-capture") {
        wantRecognitionRef.current = false;
        setPermission("unavailable");
        setStatus("stopped");
        setError("No microphone was found. Connect or enable a microphone and try again.");
        return;
      }
      if (code === "network") {
        setError("Speech-to-text lost the network connection. Check your internet and try again.");
        return;
      }
      setError("Speech-to-text stopped unexpectedly. Tap “Start speaking” to continue.");
    };

    recognition.onend = () => {
      if (recognitionRef.current !== recognition) return;
      setInterim("");
      if (!wantRecognitionRef.current) return;
      // Mobile engines end after every phrase — restart so the user keeps talking.
      restartsRef.current += 1;
      if (restartsRef.current > 200) {
        wantRecognitionRef.current = false;
        setStatus("stopped");
        return;
      }
      setTimeout(() => {
        if (!wantRecognitionRef.current || recognitionRef.current !== recognition) return;
        try {
          recognition.start();
        } catch {
          /* already started / restart race */
        }
      }, 250);
    };

    recognitionRef.current = recognition;
    wantRecognitionRef.current = true;
    try {
      recognition.start();
      return true;
    } catch {
      // Chrome throws if start() is called twice; the session is already live.
      return true;
    }
  }, [lang]);

  const start = useCallback(async () => {
    setError(null);
    setInterim("");
    restartsRef.current = 0;

    if (!getRecognitionCtor()) {
      setSpeechSupported(false);
      setError(
        "Speech-to-text isn't supported in this browser. Use the microphone on your phone keyboard to type your answer.",
      );
      return;
    }

    // Ask for permission explicitly first: on Android Chrome the prompt is much
    // more reliable through getUserMedia, and we release the stream immediately
    // so the speech engine can own the microphone (nothing is recorded).
    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
        setPermission("granted");
      } catch (err) {
        const name = (err as { name?: string })?.name ?? "";
        if (name === "NotAllowedError" || name === "SecurityError") {
          setPermission("denied");
          setError(
            "Microphone access is blocked. Allow microphone access in your browser settings and try again.",
          );
          return;
        }
        if (name === "NotFoundError" || name === "OverconstrainedError") {
          setPermission("unavailable");
          setError("No microphone was found. Connect or enable a microphone and try again.");
          return;
        }
        // Other errors: let SpeechRecognition try anyway.
      }
    }

    // Fresh utterance session, but keep any transcript the user already has.
    setSeconds(0);
    setConfidence(null);
    confRef.current = { sum: 0, count: 0 };
    if (startRecognition()) setStatus("recording");
  }, [startRecognition]);

  const pause = useCallback(() => {
    if (status !== "recording") return;
    stopRecognition();
    setInterim("");
    setStatus("paused");
  }, [status, stopRecognition]);

  const resume = useCallback(() => {
    if (status !== "paused") return;
    restartsRef.current = 0;
    if (startRecognition()) setStatus("recording");
  }, [startRecognition, status]);

  const stop = useCallback(() => {
    stopRecognition();
    setInterim("");
    setStatus("stopped");
  }, [stopRecognition]);

  const reset = useCallback(() => {
    stopRecognition();
    setTranscript("");
    setInterim("");
    setConfidence(null);
    confRef.current = { sum: 0, count: 0 };
    setSeconds(0);
    setError(null);
    setStatus("idle");
  }, [stopRecognition]);

  return {
    status,
    seconds,
    permission,
    error,
    transcript,
    interim,
    confidence,
    speechSupported,
    micSupported,
    start,
    pause,
    resume,
    stop,
    reset,
    setTranscript,
  };
}
