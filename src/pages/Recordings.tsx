import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type RefObject,
  memo,
} from "react";
import { listRecordingsMock, type Recording } from "../api/recordings.mock";
import {
  setAllItems,
  setLoading,
  setQuery,
  setCurrentPage,
  setPageSize,
  setActiveId,
  setIsPlaying,
  resetPlayer,
} from "../store/recordingsSlice";
import {
  selectLoading,
  selectQuery,
  selectCurrentPage,
  selectPageSize,
  selectActiveId,
  selectIsPlaying,
  selectPaginatedItems,
  selectTotalItems,
  selectTotalPages,
  selectStartIdx,
  selectEndIdx,
  selectActiveItem,
} from "../store/recordingsSelectors";
import { useAppDispatch, useAppSelector } from "../store/hooks/hooks";
import SearchBar from "../components/custom/Recordings/SearchBar";
import Pagination from "../components/custom/Recordings/Pagination";

// Small helpers
const formatBytes = (n?: number) => {
  if (n == null) return "-";
  const units = ["B", "KB", "MB", "GB"];
  let v = n;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

const formatTime = (sec: number) => {
  if (!Number.isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

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

const RecordingsRow = memo(
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

    const handlePlayClick = useCallback(() => {
      onTogglePlay(recording.id);
    }, [recording.id, onTogglePlay]);

    const handleSliderChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;
        const t = Number(e.target.value);
        audio.currentTime = t;
        onSeek(t);
      },
      [audioRef, onSeek],
    );

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
              onClick={handlePlayClick}
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
                onChange={handleSliderChange}
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
  },
  (prevProps, nextProps) => {
    return (
      prevProps.recording.id === nextProps.recording.id &&
      prevProps.isActive === nextProps.isActive &&
      prevProps.isPlaying === nextProps.isPlaying &&
      prevProps.duration === nextProps.duration &&
      prevProps.currentTime === nextProps.currentTime &&
      prevProps.audioRef === nextProps.audioRef &&
      prevProps.onTogglePlay === nextProps.onTogglePlay &&
      prevProps.onSeek === nextProps.onSeek
    );
  },
);

RecordingsRow.displayName = "RecordingsRow";

export default function Recordings() {
  const dispatch = useAppDispatch();
  const [localCurrentTime, setLocalCurrentTime] = useState(0);
  const [localDuration, setLocalDuration] = useState(0);

  // Redux selectors
  const loading = useAppSelector(selectLoading);
  const query = useAppSelector(selectQuery);
  const currentPage = useAppSelector(selectCurrentPage);
  const pageSize = useAppSelector(selectPageSize);
  const activeId = useAppSelector(selectActiveId);
  const isPlaying = useAppSelector(selectIsPlaying);

  const items = useAppSelector(selectPaginatedItems);
  const totalItems = useAppSelector(selectTotalItems);
  const totalPages = useAppSelector(selectTotalPages);
  const startIdx = useAppSelector(selectStartIdx);
  const endIdx = useAppSelector(selectEndIdx);
  const activeItem = useAppSelector(selectActiveItem);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastTimeUpdateRef = useRef(0);

  const loadData = useCallback(
    async (nextQuery?: string) => {
      dispatch(setLoading(true));
      try {
        const res = await listRecordingsMock({
          limit: 100,
          q: nextQuery ?? query,
        });
        dispatch(setAllItems(res.items));
        dispatch(setCurrentPage(1));
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, query],
  );

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadData(query);
  }, [query]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!activeItem) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      dispatch(setIsPlaying(false));
      setLocalCurrentTime(0);
      setLocalDuration(0);
      return;
    }

    audio.src = activeItem.sourceUrl;
    audio.load();

    audio
      .play()
      .then(() => dispatch(setIsPlaying(true)))
      .catch(() => dispatch(setIsPlaying(false)));
  }, [activeItem, dispatch]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      const now = Date.now();
      if (now - lastTimeUpdateRef.current > 100) {
        setLocalCurrentTime(audio.currentTime);
        lastTimeUpdateRef.current = now;
      }
    };

    const onMeta = () => setLocalDuration(audio.duration || 0);
    const onPlay = () => dispatch(setIsPlaying(true));
    const onPause = () => dispatch(setIsPlaying(false));
    const onEnded = () => dispatch(setIsPlaying(false));

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
  }, [dispatch]);

  const togglePlay = useCallback(
    (id: string) => {
      const audio = audioRef.current;
      if (!audio) return;

      if (activeId !== id) {
        dispatch(setActiveId(id));
        return;
      }

      if (audio.paused) audio.play();
      else audio.pause();
    },
    [activeId, dispatch],
  );

  const stopPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    dispatch(resetPlayer());
  }, [dispatch]);

  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      dispatch(setPageSize(newSize));
      dispatch(setCurrentPage(1));
    },
    [dispatch],
  );

  const handleFirstPage = useCallback(() => {
    dispatch(setCurrentPage(1));
  }, [dispatch]);

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      dispatch(setCurrentPage(currentPage - 1));
    }
  }, [currentPage, dispatch]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      dispatch(setCurrentPage(currentPage + 1));
    }
  }, [currentPage, totalPages, dispatch]);

  const handleLastPage = useCallback(() => {
    dispatch(setCurrentPage(totalPages));
  }, [totalPages, dispatch]);

  const handleGoToPage = useCallback(
    (pageNum: number) => {
      if (pageNum >= 1 && pageNum <= totalPages) {
        dispatch(setCurrentPage(pageNum));
      }
    },
    [totalPages, dispatch],
  );

  const handleSearch = useCallback(
    (searchQuery: string) => {
      dispatch(setQuery(searchQuery));
    },
    [dispatch],
  );

  const handleSeek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio) audio.currentTime = time;
    setLocalCurrentTime(time);
  }, []);

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

      <SearchBar onSearch={handleSearch} disabled={loading} />

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
                      duration={isActive ? localDuration : 0}
                      currentTime={isActive ? localCurrentTime : 0}
                      onTogglePlay={togglePlay}
                      onSeek={handleSeek}
                      audioRef={audioRef}
                    />
                  );
                })}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        loading={loading}
        onFirstPage={handleFirstPage}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
        onLastPage={handleLastPage}
        onGoToPage={handleGoToPage}
        onPageSizeChange={handlePageSizeChange}
      />
    </section>
  );
}
