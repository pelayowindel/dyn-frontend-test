import { useCallback, useState } from "react";
import TimerCard from "../components/custom/Timer/TimerCard";
import TimerFormModal from "../components/custom/Timer/TimeFormModal";

interface Timer {
  id: string;
  seconds: number;
  remainingSeconds: number;
  description: string;
  status: "ready" | "running" | "paused" | "finished";
}

export default function Timer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [secondsInput, setSecondsInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [timers, setTimers] = useState<Timer[]>([]);

  const secondsValue = Number(secondsInput);
  const isFormValid = Number.isFinite(secondsValue) && secondsValue > 0;

  const handleSave = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const seconds = Math.floor(Number(secondsInput));
      if (!Number.isFinite(seconds) || seconds <= 0) return;

      const description = descriptionInput.trim();
      const id = crypto.randomUUID();

      setTimers((prev) => [
        ...prev,
        {
          id,
          seconds,
          remainingSeconds: seconds,
          description,
          status: "ready" as const,
        },
      ]);

      setSecondsInput("");
      setDescriptionInput("");
      setIsModalOpen(false);
    },
    [secondsInput, descriptionInput],
  );

  const handleClear = useCallback(() => {
    setSecondsInput("");
    setDescriptionInput("");
  }, []);

  const handleDelete = useCallback((id: string) => {
    setTimers((prev) => prev.filter((timer) => timer.id !== id));
  }, []);

  const formatTime = useCallback((totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Timers</h1>

      <button
        onClick={() => setIsModalOpen(true)}
        className="mb-6 rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700"
      >
        + Create Timer
      </button>

      <TimerFormModal
        isOpen={isModalOpen}
        secondsInput={secondsInput}
        descriptionInput={descriptionInput}
        isFormValid={isFormValid}
        onSecondsChange={setSecondsInput}
        onDescriptionChange={setDescriptionInput}
        onSave={handleSave}
        onClear={handleClear}
        onClose={() => setIsModalOpen(false)}
      />

      <hr className="my-9" />

      <div className="flex flex-wrap gap-4">
        {timers.map((timer) => (
          <TimerCard
            key={timer.id}
            timer={timer}
            onDelete={handleDelete}
            formatTime={formatTime}
          />
        ))}
      </div>
    </div>
  );
}
