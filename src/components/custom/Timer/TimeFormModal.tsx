import { memo } from "react";
import { X } from "lucide-react";

const TimerFormModal = memo(
  ({
    isOpen,
    secondsInput,
    descriptionInput,
    isFormValid,
    onSecondsChange,
    onDescriptionChange,
    onSave,
    onClear,
    onClose,
  }: {
    isOpen: boolean;
    secondsInput: string;
    descriptionInput: string;
    isFormValid: boolean;
    onSecondsChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onSave: (e: React.FormEvent<HTMLFormElement>) => void;
    onClear: () => void;
    onClose: () => void;
  }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="w-full max-w-md rounded-xl border-2 border-gray-300 bg-white p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Create Timer</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>

          <form className="space-y-3" onSubmit={onSave}>
            <label className="block">
              <span className="text-sm font-medium">Seconds</span>
              <input
                type="number"
                min={0}
                value={secondsInput}
                onChange={(event) => onSecondsChange(event.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2"
                placeholder="90"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Description</span>
              <textarea
                rows={3}
                value={descriptionInput}
                onChange={(event) => onDescriptionChange(event.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2"
                placeholder="Focus session"
              />
            </label>
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!isFormValid}
              >
                Save
              </button>
              <button
                type="button"
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium"
                onClick={onClear}
              >
                Clear
              </button>
              <button
                type="button"
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ml-auto"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  },
);

export default TimerFormModal;
