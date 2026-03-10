import { useCallback, useEffect, useState } from "react";
import TimerCard from "../components/custom/TimerCard";
import TimerFormModal from "../components/custom/TimeFormModal";

export default function Timer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [secondsInput, setSecondsInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [timers, setTimers] = useState<
    Array<{
      id: string;
      seconds: number;
      remainingSeconds: number;
      description: string;
      status: "ready" | "running" | "paused" | "finished";
    }>
  >([]);

  const secondsValue = Number(secondsInput);
  const isFormValid = Number.isFinite(secondsValue) && secondsValue > 0;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTimers((prev) =>
        prev.map((timer) => {
          if (timer.status !== "running") return timer;
          const nextRemaining = timer.remainingSeconds - 1;
          if (nextRemaining <= 0) {
            return { ...timer, remainingSeconds: 0, status: "finished" };
          }
          return { ...timer, remainingSeconds: nextRemaining };
        }),
      );
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

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
          status: "ready",
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

  const handlePlay = useCallback((id: string) => {
    setTimers((prev) =>
      prev.map((timer) =>
        timer.id === id && timer.remainingSeconds > 0
          ? { ...timer, status: "running" }
          : timer,
      ),
    );
  }, []);

  const handlePause = useCallback((id: string) => {
    setTimers((prev) =>
      prev.map((timer) =>
        timer.id === id ? { ...timer, status: "paused" } : timer,
      ),
    );
  }, []);

  const handleStop = useCallback((id: string) => {
    setTimers((prev) =>
      prev.map((timer) =>
        timer.id === id
          ? {
              ...timer,
              remainingSeconds: timer.seconds,
              status: "ready",
            }
          : timer,
      ),
    );
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
    <div>
      <h1 className="p-0 text-2xl font-bold mb-6">Timers</h1>
      <button
        onClick={() => setIsModalOpen(true)}
        className="mb-6 rounded-md bg-blue-600 px-4 py-2 text-white font-medium"
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
            onPlay={handlePlay}
            onPause={handlePause}
            onStop={handleStop}
            onDelete={handleDelete}
            formatTime={formatTime}
          />
        ))}
      </div>
    </div>
  );
}
