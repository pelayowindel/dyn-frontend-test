// src/api/recordings.mock.ts
export type Recording = {
  id: string;
  title: string;
  agent?: string;
  durationMs: number;
  sizeBytes: number;
  createdAt: string; // ISO
  sourceUrl: string;

  // optional "nice to have" fields for UI
  tags?: string[];
  mimeType?: string;
};

export type ListRecordingsResponse = {
  items: Recording[];
  nextCursor?: string;
};

const supabaseMp3Urls = [
  "https://poevffjwrfaislgpfcox.supabase.co/storage/v1/object/public/sounds/recording_1589.mp3",
  "https://poevffjwrfaislgpfcox.supabase.co/storage/v1/object/public/sounds/recording_2672.mp3",
  "https://poevffjwrfaislgpfcox.supabase.co/storage/v1/object/public/sounds/recording_451%20(1).mp3",
  "https://poevffjwrfaislgpfcox.supabase.co/storage/v1/object/public/sounds/recording_454%20(1).mp3",
];

const sampleTitles = [
  "Outbound Call",
  "Inbound Support",
  "QA Review Sample",
  "Customer Follow-up",
  "Escalation Call",
  "Voicemail Recording",
  "Intro Script",
  "Survey Session",
];

const sampleAgents = [
  "Agent A. Santos",
  "Agent M. Dela Cruz",
  "Agent J. Reyes",
  "Agent K. Lim",
  "Agent S. Tan",
  "Agent P. Cruz",
];

const sampleTags = ["sales", "support", "qa", "training", "escalation", "demo"];

function randInt(min: number, max: number) {
  // inclusive
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]) {
  return arr[randInt(0, arr.length - 1)];
}

function maybe<T>(value: T, probability = 0.5): T | undefined {
  return Math.random() < probability ? value : undefined;
}

function randomIsoDateWithinDays(daysBack: number) {
  const now = Date.now();
  const past = now - randInt(0, daysBack) * 24 * 60 * 60 * 1000;
  return new Date(past).toISOString();
}

function randomId() {
  // Works in modern browsers; if you need older support, replace with a small uuid lib.
  return crypto.randomUUID();
}

function makeMockRecordings(count: number): Recording[] {
  return Array.from({ length: count }).map((_, i) => {
    const durationMs = randInt(20_000, 6 * 60_000);
    const sizeBytes = randInt(400_000, 18_000_000);

    const tags = Array.from(
      new Set(
        Array.from({ length: randInt(0, 3) }).map(() => pick(sampleTags)),
      ),
    );

    return {
      id: randomId(),
      title: `${pick(sampleTitles)} #${i + 1}`,
      agent: maybe(pick(sampleAgents), 0.8),
      durationMs,
      sizeBytes,
      createdAt: randomIsoDateWithinDays(45),
      sourceUrl: pick(supabaseMp3Urls),
      tags: tags.length ? tags : undefined,
      mimeType: "audio/mpeg",
    };
  });
}

// ✅ Generate mock data ONCE and reuse it
const MOCK_RECORDINGS = makeMockRecordings(100);

export async function listRecordingsMock(params?: {
  limit?: number;
  cursor?: string;
  q?: string;
}): Promise<ListRecordingsResponse> {
  const limit = params?.limit ?? 30;
  const q = (params?.q ?? "").trim().toLowerCase();

  // emulate network jitter
  await new Promise((r) => setTimeout(r, randInt(250, 900)));

  // ✅ Filter from the same pool every time
  let items = MOCK_RECORDINGS;

  console.log(q);

  if (q) {
    items = items.filter((x) => {
      const haystack =
        `${x.title} ${x.agent ?? ""} ${(x.tags ?? []).join(" ")}`.toLowerCase();
      return haystack.includes(q);
    });
  }

  const nextCursor = Math.random() > 0.65 ? String(Date.now()) : undefined;

  return {
    items: items.slice(0, limit),
    nextCursor,
  };
}
