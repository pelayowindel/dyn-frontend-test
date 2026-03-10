import { useEffect, useRef, useState, type RefObject } from "react";
import { listRecordingsMock, type Recording } from "../api/recordings.mock";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Small helpers
function formatBytes(n?: number) {
  if (n == null) return "-";
  const units = ["B", "KB", "MB", "GB"];
  let v = n;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatTime(sec: number) {
  if (!Number.isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

type RecordingsRowProps = {
  recording: Recording;
  isActive: boolean;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  onTogglePlay: (id: string) => void;
  onSeek: (time: number) => void;
  audioRef: RefObject<HTMLAudioElement | null>;
};

function RecordingsRow({
  recording,
  isActive,
  isPlaying,
  duration,
  currentTime,
  onTogglePlay,
  onSeek,
  audioRef,
}: RecordingsRowProps) {
  const displayDuration = isActive
    ? duration
    : (recording.durationMs ?? 0) / 1000;

  return (
    <>
      <tr className={isActive ? "bg-gray-50" : ""}>
        <td className="px-4 py-3">
          <div className="min-w-0">
            <div className="font-semibold truncate">{recording.title}</div>
            <div className="text-sm text-gray-500 truncate">
              {recording.agent ?? "-"} -{" "}
              {new Date(recording.createdAt).toLocaleString()}
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
          {formatBytes(recording.sizeBytes)}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
          {formatTime(displayDuration)}
        </td>
        <td className="px-4 py-3">
          <button
            className="px-3 py-2 rounded-md border hover:bg-gray-50"
            onClick={() => onTogglePlay(recording.id)}
          >
            {isActive && isPlaying ? "Pause" : "Play"}
          </button>
        </td>
      </tr>

      {isActive && (
        <tr>
          <td className="px-4 pb-4" colSpan={4}>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            <input
              type="range"
              className="w-full"
              min={0}
              max={duration || 0}
              step={0.1}
              value={Math.min(currentTime, duration || 0)}
              onChange={(e) => {
                const audio = audioRef.current;
                if (!audio) return;
                const t = Number(e.target.value);
                audio.currentTime = t;
                onSeek(t);
              }}
              disabled={!duration}
            />

            {!!recording.tags?.length && (
              <div className="mt-3 flex flex-wrap gap-2">
                {recording.tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2 py-1 rounded-full border bg-gray-50"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

export default function Recordings() {
  const [allItems, setAllItems] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);

  // single global player
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const activeItem = allItems.find((x) => x.id === activeId) ?? null;

  async function loadData(nextQuery?: string) {
    setLoading(true);
    try {
      const res = await listRecordingsMock({
        limit: 999,
        q: nextQuery ?? query,
      });
      setAllItems(res.items);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!activeItem) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    audio.src = activeItem.sourceUrl;
    audio.load();

    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, [activeItem]);

  // Wire audio events once
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  function togglePlay(id: string) {
    const audio = audioRef.current;
    if (!audio) return;

    if (activeId !== id) {
      setActiveId(id);
      return;
    }

    if (audio.paused) audio.play();
    else audio.pause();
  }

  function stopPlayback() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  }

  // Pagination logic
  const totalItems = allItems.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalItems);
  const items = allItems.slice(startIdx, endIdx);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <section className="p-4">
      <audio ref={audioRef} preload="metadata" />

      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="p-0 text-2xl font-bold">Recordings</h1>
          <p className="text-sm text-gray-500">
            {loading
              ? "..."
              : `Showing ${startIdx + 1}-${endIdx} of ${totalItems} items`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="px-3 py-2 rounded-md border hover:bg-gray-50"
            onClick={() => loadData()}
            disabled={loading}
          >
            Refresh
          </button>

          <button
            className="px-3 py-2 rounded-md border hover:bg-gray-50"
            onClick={stopPlayback}
            disabled={!activeId}
            title="Stop current playback"
          >
            Stop
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-6">
        <input
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Search title/agent/tags..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") loadData(e.currentTarget.value);
          }}
        />
        <button
          className="px-3 py-2 rounded-md border hover:bg-gray-50"
          onClick={() => loadData(query)}
          disabled={loading}
        >
          Search
        </button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">Size</th>
              <th className="px-4 py-3 font-semibold">Duration</th>
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3">
                      <div className="h-5 w-2/3 bg-gray-200 rounded mb-2" />
                      <div className="h-4 w-1/2 bg-gray-200 rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-16 bg-gray-200 rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-16 bg-gray-200 rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-9 w-24 bg-gray-200 rounded" />
                    </td>
                  </tr>
                ))
              : items.map((r) => {
                  const isActive = r.id === activeId;
                  return (
                    <RecordingsRow
                      key={r.id}
                      recording={r}
                      isActive={isActive}
                      isPlaying={isPlaying}
                      duration={duration}
                      currentTime={currentTime}
                      onTogglePlay={togglePlay}
                      onSeek={setCurrentTime}
                      audioRef={audioRef}
                    />
                  );
                })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Page size:</label>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="px-3 py-2 border rounded-md"
            disabled={loading}
          >
            <option value={15}>15</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1 || loading}
            className="p-2 rounded-md border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Previous page"
          >
            <ChevronLeft size={20} />
          </button>

          <span className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages || loading}
            className="p-2 rounded-md border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Next page"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
