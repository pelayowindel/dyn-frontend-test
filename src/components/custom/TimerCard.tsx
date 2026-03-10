import { Pause, PlayIcon, Square, Trash2 } from "lucide-react";
import { memo, useCallback, useEffect, useState } from "react";

interface Timer {
  id: string;
  seconds: number;
  remainingSeconds: number;
  description: string;
  status: "ready" | "running" | "paused" | "finished";
}

const TimerCard = memo(
  ({
    timer,
    onDelete,
    formatTime,
  }: {
    timer: Timer;
    onDelete: (id: string) => void;
    formatTime: (seconds: number) => string;
  }) => {
    const [remainingSeconds, setRemainingSeconds] = useState(
      timer.remainingSeconds,
    );
    const [status, setStatus] = useState(timer.status);

    // Timer interval - only for this card
    useEffect(() => {
      if (status !== "running") return;

      const intervalId = setInterval(() => {
        setRemainingSeconds((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            setStatus("finished");
            return 0;
          }
          return next;
        });
      }, 1000);

      return () => clearInterval(intervalId);
    }, [status]);

    // Sync with parent when timer changes
    useEffect(() => {
      setRemainingSeconds(timer.remainingSeconds);
      setStatus(timer.status);
    }, [timer]);

    // ✅ Memoized callbacks
    const handlePlay = useCallback(() => {
      if (remainingSeconds > 0) {
        setStatus("running");
      }
    }, [remainingSeconds]);

    const handlePause = useCallback(() => {
      setStatus("paused");
    }, []);

    const handleStop = useCallback(() => {
      setStatus("ready");
      setRemainingSeconds(timer.seconds);
    }, [timer.seconds]);

    const handleDelete = useCallback(() => {
      onDelete(timer.id);
    }, [timer.id, onDelete]);

    return (
      <div
        key={timer.id}
        className="w-64 rounded-xl border-4 border-gray-300 bg-white p-6 shadow-lg"
      >
        <h1 className="mb-3 text-4xl font-bold text-center">
          {formatTime(remainingSeconds)}
        </h1>
        <div className="mb-4 flex items-center justify-center gap-2">
          <button
            className="inline-flex items-center justify-center rounded-md bg-green-950 p-2"
            onClick={handlePlay}
            aria-label="Play"
            title="Play"
          >
            <PlayIcon className="text-white" aria-hidden="true" />
          </button>
          <button
            className="inline-flex items-center justify-center rounded-md bg-yellow-600 p-2"
            onClick={handlePause}
            aria-label="Pause"
            title="Pause"
          >
            <Pause className="text-white" aria-hidden="true" />
          </button>
          <button
            className="inline-flex items-center justify-center rounded-md bg-red-600 p-2"
            onClick={handleStop}
            aria-label="Stop"
            title="Stop"
          >
            <Square className="text-white" aria-hidden="true" />
          </button>
          <button
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white p-2"
            onClick={handleDelete}
            aria-label="Delete"
            title="Delete"
          >
            <Trash2 className="text-gray-700" aria-hidden="true" />
          </button>
        </div>
        <p className="min-h-[3rem] border border-dashed p-2 text-sm text-muted-foreground">
          {timer.description || "No description"}
        </p>
        <p className="mt-2 text-center text-xs text-gray-500">
          Status: {status}
        </p>
      </div>
    );
  },
);

export default TimerCard;
