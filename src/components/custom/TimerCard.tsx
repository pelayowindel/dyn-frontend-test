import { Pause, PlayIcon, Square, Trash2 } from "lucide-react";
import { memo } from "react";

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
    onPlay,
    onPause,
    onStop,
    onDelete,
    formatTime,
  }: {
    timer: Timer;
    onPlay: (id: string) => void;
    onPause: (id: string) => void;
    onStop: (id: string) => void;
    onDelete: (id: string) => void;
    formatTime: (seconds: number) => string;
  }) => (
    <div
      key={timer.id}
      className="w-64 rounded-xl border-4 border-gray-300 bg-white p-6 shadow-lg"
    >
      <h1 className="mb-3 text-4xl font-bold text-center">
        {formatTime(timer.remainingSeconds)}
      </h1>
      <div className="mb-4 flex items-center justify-center gap-2">
        <button
          className="inline-flex items-center justify-center rounded-md bg-green-950 p-2"
          onClick={() => onPlay(timer.id)}
          aria-label="Play"
          title="Play"
        >
          <PlayIcon className="text-white" aria-hidden="true" />
        </button>
        <button
          className="inline-flex items-center justify-center rounded-md bg-yellow-600 p-2"
          onClick={() => onPause(timer.id)}
          aria-label="Pause"
          title="Pause"
        >
          <Pause className="text-white" aria-hidden="true" />
        </button>
        <button
          className="inline-flex items-center justify-center rounded-md bg-red-600 p-2"
          onClick={() => onStop(timer.id)}
          aria-label="Stop"
          title="Stop"
        >
          <Square className="text-white" aria-hidden="true" />
        </button>
        <button
          className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white p-2"
          onClick={() => onDelete(timer.id)}
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
        Status: {timer.status}
      </p>
    </div>
  ),
);

export default TimerCard;
