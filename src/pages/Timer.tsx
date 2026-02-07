import { Pause, PlayIcon, Square, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Timer() {
  const [secondsInput, setSecondsInput] = useState('')
  const [descriptionInput, setDescriptionInput] = useState('')
  const [timers, setTimers] = useState<
    Array<{
      id: string
      seconds: number
      remainingSeconds: number
      description: string
      status: 'ready' | 'running' | 'paused' | 'finished'
    }>
  >([])

  const secondsValue = Number(secondsInput)
  const isFormValid = Number.isFinite(secondsValue) && secondsValue > 0

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTimers((prev) =>
        prev.map((timer) => {
          if (timer.status !== 'running') return timer
          const nextRemaining = timer.remainingSeconds - 1
          if (nextRemaining <= 0) {
            return { ...timer, remainingSeconds: 0, status: 'finished' }
          }
          return { ...timer, remainingSeconds: nextRemaining }
        })
      )
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [])

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const seconds = Math.floor(Number(secondsInput))
    if (!Number.isFinite(seconds) || seconds <= 0) return

    const description = descriptionInput.trim()
    const id = crypto.randomUUID()
    setTimers((prev) => [
      ...prev,
      {
        id,
        seconds,
        remainingSeconds: seconds,
        description,
        status: 'ready',
      },
    ])
    setSecondsInput('')
    setDescriptionInput('')
  }

  const handleClear = () => {
    setSecondsInput('')
    setDescriptionInput('')
  }

  const handlePlay = (id: string) => {
    setTimers((prev) =>
      prev.map((timer) =>
        timer.id === id && timer.remainingSeconds > 0
          ? { ...timer, status: 'running' }
          : timer
      )
    )
  }

  const handlePause = (id: string) => {
    setTimers((prev) =>
      prev.map((timer) =>
        timer.id === id ? { ...timer, status: 'paused' } : timer
      )
    )
  }

  const handleStop = (id: string) => {
    setTimers((prev) =>
      prev.map((timer) =>
        timer.id === id
          ? {
              ...timer,
              remainingSeconds: timer.seconds,
              status: 'ready',
            }
          : timer
      )
    )
  }

  const handleDelete = (id: string) => {
    setTimers((prev) => prev.filter((timer) => timer.id !== id))
  }

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  return (
    <div>
      <h1 className="p-0 text-2xl font-bold mb-6">Timers</h1>

      <div className="mb-6 flex justify-center">
        <div className="w-full max-w-md rounded-xl border-2 border-gray-300 bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold">Create Timer</h2>
          <form className="space-y-3" onSubmit={handleSave}>
            <label className="block">
              <span className="text-sm font-medium">Seconds</span>
              <input
                type="number"
                min={0}
                value={secondsInput}
                onChange={(event) => setSecondsInput(event.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2"
                placeholder="90"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Description</span>
              <textarea
                rows={3}
                value={descriptionInput}
                onChange={(event) => setDescriptionInput(event.target.value)}
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
                onClick={handleClear}
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>

      <hr className="my-9" />

      <div className="flex flex-wrap gap-4">
        {timers.map((timer) => (
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
                onClick={() => handlePlay(timer.id)}
                aria-label="Play"
                title="Play"
              >
                <PlayIcon className="text-white" aria-hidden="true" />
              </button>
              <button
                className="inline-flex items-center justify-center rounded-md bg-yellow-600 p-2"
                onClick={() => handlePause(timer.id)}
                aria-label="Pause"
                title="Pause"
              >
                <Pause className="text-white" aria-hidden="true" />
              </button>
              <button
                className="inline-flex items-center justify-center rounded-md bg-red-600 p-2"
                onClick={() => handleStop(timer.id)}
                aria-label="Stop"
                title="Stop"
              >
                <Square className="text-white" aria-hidden="true" />
              </button>
              <button
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white p-2"
                onClick={() => handleDelete(timer.id)}
                aria-label="Delete"
                title="Delete"
              >
                <Trash2 className="text-gray-700" aria-hidden="true" />
              </button>
            </div>
            <p className="min-h-[3rem] border border-dashed p-2 text-sm text-muted-foreground">
              {timer.description || 'No description'}
            </p>
            <p className="mt-2 text-center text-xs text-gray-500">
              Status: {timer.status}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
