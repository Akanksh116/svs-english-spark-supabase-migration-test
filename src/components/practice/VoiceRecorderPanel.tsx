import { useEffect } from "react";
import {
  AlertTriangle,
  Copy,
  Keyboard,
  Mic,
  MicOff,
  Pause,
  Play,
  Send,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useVoiceRecorder } from "@/lib/use-voice-recorder";
import { toast } from "sonner";

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

interface Props {
  disabled?: boolean;
  /** Send the spoken transcript to the AI coach as the user's reply. */
  onSend: (text: string) => void;
  /** Bubbles the recognition-confidence estimate up for the session summary. */
  onConfidence?: (value: number | null) => void;
}

export function VoiceRecorderPanel({ disabled, onSend, onConfidence }: Props) {
  const rec = useVoiceRecorder();
  const listening = rec.status === "recording";
  const paused = rec.status === "paused";
  const stopped = rec.status === "stopped";
  const text = [rec.transcript, rec.interim].filter(Boolean).join(" ").trim();

  useEffect(() => {
    onConfidence?.(rec.confidence);
  }, [rec.confidence, onConfidence]);

  const handleSend = () => {
    const value = rec.transcript.trim();
    if (!value) {
      toast.error("Nothing was captured yet. Please speak again.");
      return;
    }
    onSend(value);
    rec.reset();
  };

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Transcript copied");
    } catch {
      toast.error("Could not copy the transcript.");
    }
  };

  // No speech engine on this device/browser: show the keyboard-mic fallback only,
  // never a misleading "start speaking" control.
  if (!rec.speechSupported) {
    return (
      <div className="rounded-xl border bg-muted/30 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Keyboard className="h-4 w-4 text-primary" /> Voice typing is not available in this
          browser
        </p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Tap the text box below and use the microphone 🎤 on your phone keyboard to speak your
          answer. Your words become text and you can send them to the coach.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-muted/30 p-3">
      <p className="mb-2 text-xs text-muted-foreground">
        Speak your answer — your phone converts speech to text. No audio is saved.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {!listening && !paused ? (
          <Button
            type="button"
            className="h-11 min-w-[11rem] gap-2 text-base"
            disabled={disabled}
            onClick={() => void rec.start()}
          >
            <Mic className="h-5 w-5" />
            {stopped || rec.transcript ? "Speak again" : "Start speaking"}
          </Button>
        ) : null}

        {listening ? (
          <>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-destructive" />
              Listening
            </span>
            <Button type="button" variant="outline" className="h-11 gap-2" onClick={rec.pause}>
              <Pause className="h-5 w-5" /> Pause
            </Button>
          </>
        ) : null}

        {paused ? (
          <>
            <Badge variant="secondary" className="text-[10px]">
              Paused
            </Badge>
            <Button type="button" variant="outline" className="h-11 gap-2" onClick={rec.resume}>
              <Play className="h-5 w-5" /> Resume
            </Button>
          </>
        ) : null}

        {listening || paused ? (
          <Button type="button" className="h-11 gap-2" onClick={rec.stop}>
            <Square className="h-5 w-5" /> Stop
          </Button>
        ) : null}

        {rec.status !== "idle" ? (
          <Badge variant="outline" className="tabular-nums">
            {formatTime(rec.seconds)}
          </Badge>
        ) : null}

        {rec.permission === "denied" || rec.permission === "unavailable" ? (
          <Badge variant="outline" className="gap-1 border-destructive/30 text-destructive">
            <MicOff className="h-3 w-3" /> Mic{" "}
            {rec.permission === "denied" ? "blocked" : "unavailable"}
          </Badge>
        ) : rec.permission === "granted" ? (
          <Badge variant="outline" className="gap-1 border-accent/30 text-accent">
            <Mic className="h-3 w-3" /> Mic ready
          </Badge>
        ) : null}

        {rec.confidence != null ? (
          <Badge variant="secondary" className="text-[10px]">
            Pronunciation (estimated): {rec.confidence}%
          </Badge>
        ) : null}
      </div>

      {rec.error ? (
        <p className="mt-2 flex items-start gap-2 text-xs text-destructive">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            {rec.error} You can also tap the text box below and use the microphone 🎤 on your phone
            keyboard.
          </span>
        </p>
      ) : null}

      {text ? (
        <div className="mt-3 rounded-lg border bg-background p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Transcript
          </p>
          <p className="mt-1 text-sm leading-relaxed">
            {rec.transcript}
            {rec.interim ? <span className="text-muted-foreground"> {rec.interim}</span> : null}
          </p>
        </div>
      ) : null}

      {rec.transcript && !listening ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            className="h-11 gap-2 text-base"
            disabled={disabled}
            onClick={handleSend}
          >
            <Send className="h-5 w-5" /> Send to coach
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 gap-2"
            onClick={handleCopy}
            disabled={!text}
          >
            <Copy className="h-5 w-5" /> Copy
          </Button>
          <Button type="button" variant="ghost" className="h-11" onClick={rec.reset}>
            Clear
          </Button>
        </div>
      ) : null}
    </div>
  );
}
