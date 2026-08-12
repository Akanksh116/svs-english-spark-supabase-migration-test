import { useEffect } from "react";
import {
  AlertTriangle,
  Copy,
  Mic,
  MicOff,
  Pause,
  Play,
  RotateCcw,
  Send,
  Square,
  Trash2,
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
  const recording = rec.status === "recording";
  const paused = rec.status === "paused";
  const stopped = rec.status === "stopped";
  const text = [rec.transcript, rec.interim].filter(Boolean).join(" ").trim();

  useEffect(() => {
    onConfidence?.(rec.confidence);
  }, [rec.confidence, onConfidence]);

  const handleSend = () => {
    const value = rec.transcript.trim();
    if (!value) {
      toast.error("Nothing was recorded. Please record again.");
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

  return (
    <div className="rounded-xl border bg-muted/30 p-3">
      <div className="flex flex-wrap items-center gap-2">
        {rec.status === "idle" || stopped ? (
          <Button
            type="button"
            size="sm"
            variant={stopped ? "outline" : "default"}
            className="gap-1.5"
            disabled={disabled || !rec.recordingSupported}
            onClick={() => void rec.start()}
          >
            <Mic className="h-4 w-4" />
            {stopped ? "Record again" : "Start recording"}
          </Button>
        ) : null}

        {recording ? (
          <>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-destructive" />
              Recording
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={rec.pause}
            >
              <Pause className="h-4 w-4" /> Pause
            </Button>
          </>
        ) : null}

        {paused ? (
          <>
            <Badge variant="secondary" className="text-[10px]">
              Paused
            </Badge>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={rec.resume}
            >
              <Play className="h-4 w-4" /> Resume
            </Button>
          </>
        ) : null}

        {recording || paused ? (
          <Button type="button" size="sm" className="gap-1.5" onClick={rec.stop}>
            <Square className="h-4 w-4" /> Stop
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
          <Badge variant="outline" className="gap-1 text-accent border-accent/30">
            <Mic className="h-3 w-3" /> Mic ready
          </Badge>
        ) : null}

        {rec.confidence != null ? (
          <Badge variant="secondary" className="text-[10px]">
            Pronunciation (estimated): {rec.confidence}%
          </Badge>
        ) : null}
      </div>

      {!rec.recordingSupported ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Voice recording is not supported in this browser. Please type your reply below.
        </p>
      ) : !rec.speechSupported ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Live speech-to-text is not available in this browser (try Chrome or Edge). You can still
          record and type your reply below.
        </p>
      ) : null}

      {rec.error ? (
        <p className="mt-2 flex items-center gap-2 text-xs text-destructive">
          <AlertTriangle className="h-3.5 w-3.5" />
          {rec.error}
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

      {stopped ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            className="gap-1.5"
            disabled={disabled}
            onClick={handleSend}
          >
            <Send className="h-4 w-4" /> Send to coach
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => void rec.start()}
          >
            <RotateCcw className="h-4 w-4" /> Retry
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={handleCopy}
            disabled={!text}
          >
            <Copy className="h-4 w-4" /> Copy
          </Button>
          <Button type="button" size="sm" variant="ghost" className="gap-1.5" onClick={rec.reset}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
          {rec.audioUrl ? <audio className="h-8 max-w-full" controls src={rec.audioUrl} /> : null}
        </div>
      ) : null}
    </div>
  );
}
