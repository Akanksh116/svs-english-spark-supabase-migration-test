import { useCallback, useEffect, useRef, useState } from "react";

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
};

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as
    | (new () => SpeechRecognitionLike)
    | null;
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
  audioUrl: string | null;
  speechSupported: boolean;
  recordingSupported: boolean;
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
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const wantRecognitionRef = useRef(false);
  const confRef = useRef<{ sum: number; count: number }>({ sum: 0, count: 0 });

  const [speechSupported, setSpeechSupported] = useState(true);
  const [recordingSupported, setRecordingSupported] = useState(true);

  useEffect(() => {
    setSpeechSupported(Boolean(getRecognitionCtor()));
    setRecordingSupported(
      typeof window !== "undefined" &&
        typeof navigator !== "undefined" &&
        Boolean(navigator.mediaDevices?.getUserMedia) &&
        typeof MediaRecorder !== "undefined",
    );
  }, []);

  useEffect(() => {
    if (status !== "recording") return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const stopRecognition = useCallback(() => {
    wantRecognitionRef.current = false;
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
    recognitionRef.current = null;
  }, []);

  useEffect(
    () => () => {
      stopRecognition();
      cleanupStream();
      try {
        if (recorderRef.current && recorderRef.current.state !== "inactive") {
          recorderRef.current.stop();
        }
      } catch {
        /* ignore */
      }
    },
    [cleanupStream, stopRecognition],
  );

  const startRecognition = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
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
      if (code === "no-speech" || code === "aborted") return;
      if (code === "not-allowed" || code === "service-not-allowed") {
        setPermission("denied");
        setError("Microphone access was blocked. Allow it in your browser settings and try again.");
        return;
      }
      if (code === "network") {
        setError("Speech recognition lost the network connection. Check your internet and retry.");
        return;
      }
      setError("Speech recognition had a problem. You can keep typing instead.");
    };
    recognition.onend = () => {
      if (wantRecognitionRef.current) {
        try {
          recognition.start();
        } catch {
          /* ignore restart race */
        }
      }
    };
    recognitionRef.current = recognition;
    wantRecognitionRef.current = true;
    try {
      recognition.start();
    } catch {
      /* already started */
    }
  }, [lang]);

  const start = useCallback(async () => {
    setError(null);
    setTranscript("");
    setInterim("");
    setConfidence(null);
    confRef.current = { sum: 0, count: 0 };
    setSeconds(0);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setPermission("unavailable");
      setError("Recording is not supported in this browser. Please type your reply instead.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setPermission("granted");

      if (typeof MediaRecorder !== "undefined") {
        chunksRef.current = [];
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
          if (chunksRef.current.length) {
            const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
            setAudioUrl(URL.createObjectURL(blob));
          }
        };
        recorderRef.current = recorder;
        recorder.start();
      }

      startRecognition();
      setStatus("recording");
    } catch (err) {
      const name = (err as { name?: string })?.name ?? "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        setPermission("denied");
        setError("Microphone permission denied. Allow microphone access to record.");
      } else if (name === "NotFoundError" || name === "OverconstrainedError") {
        setPermission("unavailable");
        setError("No microphone detected. Connect a microphone and try again.");
      } else {
        setPermission("unavailable");
        setError("Could not start recording. Please try again or type your reply.");
      }
      cleanupStream();
    }
  }, [audioUrl, cleanupStream, startRecognition]);

  const pause = useCallback(() => {
    if (status !== "recording") return;
    try {
      if (recorderRef.current?.state === "recording") recorderRef.current.pause();
    } catch {
      /* ignore */
    }
    stopRecognition();
    setInterim("");
    setStatus("paused");
  }, [status, stopRecognition]);

  const resume = useCallback(() => {
    if (status !== "paused") return;
    try {
      if (recorderRef.current?.state === "paused") recorderRef.current.resume();
    } catch {
      /* ignore */
    }
    startRecognition();
    setStatus("recording");
  }, [startRecognition, status]);

  const stop = useCallback(() => {
    stopRecognition();
    setInterim("");
    try {
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      }
    } catch {
      /* ignore */
    }
    cleanupStream();
    setStatus("stopped");
  }, [cleanupStream, stopRecognition]);

  const reset = useCallback(() => {
    stopRecognition();
    try {
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      }
    } catch {
      /* ignore */
    }
    cleanupStream();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setTranscript("");
    setInterim("");
    setConfidence(null);
    confRef.current = { sum: 0, count: 0 };
    setSeconds(0);
    setError(null);
    setStatus("idle");
  }, [audioUrl, cleanupStream, stopRecognition]);

  return {
    status,
    seconds,
    permission,
    error,
    transcript,
    interim,
    confidence,
    audioUrl,
    speechSupported,
    recordingSupported,
    start,
    pause,
    resume,
    stop,
    reset,
    setTranscript,
  };
}
