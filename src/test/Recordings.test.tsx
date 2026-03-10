import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Provider } from "react-redux";
import Recordings from "../pages/Recordings";
import * as recordingsApi from "../api/recordings.mock";
import { store } from "../store/store";
import type { Recording, ListRecordingsResponse } from "../api/recordings.mock";

// Mock the recordings API
vi.mock("../api/recordings.mock", async () => {
  const actual = await vi.importActual("../api/recordings.mock");
  return {
    ...actual,
    listRecordingsMock: vi.fn(),
  };
});

const mockListRecordings = vi.mocked(recordingsApi.listRecordingsMock);

// Sample test data
const createMockRecording = (
  overrides: Partial<Recording> = {},
): Recording => ({
  id: "test-id-1",
  title: "Test Recording 1",
  agent: "Agent Test",
  durationMs: 120000, // 2 minutes
  sizeBytes: 1048576, // 1 MB
  createdAt: "2026-03-01T10:00:00.000Z",
  sourceUrl: "https://example.com/audio.mp3",
  tags: ["sales", "qa"],
  mimeType: "audio/mpeg",
  ...overrides,
});

const mockRecordings: Recording[] = [
  createMockRecording({ id: "1", title: "Outbound Call #1" }),
  createMockRecording({
    id: "2",
    title: "Inbound Support #2",
    agent: "Agent Santos",
    tags: ["support"],
  }),
  createMockRecording({
    id: "3",
    title: "QA Review #3",
    agent: undefined,
    durationMs: 300000,
    sizeBytes: 5242880,
  }),
];

const mockResponse: ListRecordingsResponse = {
  items: mockRecordings,
  nextCursor: undefined,
};

// Mock HTMLMediaElement methods
const mockPlay = vi.fn(() => Promise.resolve());
const mockPause = vi.fn();
const mockLoad = vi.fn();

const renderRecordings = async () => {
  render(
    <Provider store={store}>
      <Recordings />
    </Provider>,
  );
  await screen.findByText("Outbound Call #1");
};

beforeEach(() => {
  vi.clearAllMocks();
  mockListRecordings.mockResolvedValue(mockResponse);

  // Mock media element methods
  vi.spyOn(window.HTMLMediaElement.prototype, "play").mockImplementation(
    mockPlay,
  );
  vi.spyOn(window.HTMLMediaElement.prototype, "pause").mockImplementation(
    mockPause,
  );
  vi.spyOn(window.HTMLMediaElement.prototype, "load").mockImplementation(
    mockLoad,
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Recordings", () => {
  describe("Initial Rendering", () => {
    it("renders the page heading", async () => {
      await renderRecordings();

      expect(
        screen.getByRole("heading", { name: /recordings/i }),
      ).toBeInTheDocument();
    });

    it("shows loading skeleton while fetching data", async () => {
      mockListRecordings.mockReturnValue(new Promise(() => {}));

      render(
        <Provider store={store}>
          <Recordings />
        </Provider>,
      );

      await waitFor(() => {
        expect(screen.getByText("...")).toBeInTheDocument();
      });
    });

    it("renders recordings after loading", async () => {
      render(
        <Provider store={store}>
          <Recordings />
        </Provider>,
      );

      await waitFor(() => {
        expect(screen.getByText("Outbound Call #1")).toBeInTheDocument();
      });

      expect(screen.getByText("Inbound Support #2")).toBeInTheDocument();
      expect(screen.getByText("QA Review #3")).toBeInTheDocument();
    });

    it("shows correct item count after loading", async () => {
      render(
        <Provider store={store}>
          <Recordings />
        </Provider>,
      );

      await waitFor(() => {
        expect(screen.getByText(/showing 1-3 of 3 items/i)).toBeInTheDocument();
      });
    });

    it("calls listRecordingsMock on mount", async () => {
      render(
        <Provider store={store}>
          <Recordings />
        </Provider>,
      );

      await waitFor(() => {
        expect(mockListRecordings).toHaveBeenCalledTimes(1);
      });

      // Component fetches with limit: 200
      expect(mockListRecordings).toHaveBeenCalledWith({ limit: 200, q: "" });
    });
  });

  describe("Table Display", () => {
    it("renders table headers", async () => {
      render(
        <Provider store={store}>
          <Recordings />
        </Provider>,
      );

      await waitFor(() => {
        expect(screen.getByText("Outbound Call #1")).toBeInTheDocument();
      });

      expect(
        screen.getByRole("columnheader", { name: /title/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("columnheader", { name: /size/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("columnheader", { name: /duration/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("columnheader", { name: /action/i }),
      ).toBeInTheDocument();
    });

    it("displays formatted file sizes", async () => {
      render(
        <Provider store={store}>
          <Recordings />
        </Provider>,
      );

      await waitFor(() => {
        expect(screen.getAllByText("1.0 MB").length).toBeGreaterThan(0);
      });

      expect(screen.getByText("5.0 MB")).toBeInTheDocument();
    });

    it("shows dash when agent is undefined", async () => {
      render(
        <Provider store={store}>
          <Recordings />
        </Provider>,
      );

      await waitFor(() => {
        const rows = screen.getAllByRole("row");
        const qaRow = rows.find((row) =>
          within(row).queryByText("QA Review #3"),
        );
        expect(qaRow).toBeInTheDocument();
        expect(within(qaRow!).getByText(/-/)).toBeInTheDocument();
      });
    });
  });

  describe("Search Functionality", () => {
    it("renders search input", async () => {
      await renderRecordings();

      expect(
        screen.getByPlaceholderText(/search title\/agent\/tags/i),
      ).toBeInTheDocument();
    });

    it("updates search input value on change", async () => {
      const user = userEvent.setup();
      render(
        <Provider store={store}>
          <Recordings />
        </Provider>,
      );

      const searchInput = screen.getByPlaceholderText(
        /search title\/agent\/tags/i,
      );
      await user.type(searchInput, "outbound");

      expect(searchInput).toHaveValue("outbound");
    });

    it("triggers search on Enter key", async () => {
      const user = userEvent.setup();
      render(
        <Provider store={store}>
          <Recordings />
        </Provider>,
      );

      await waitFor(() => {
        expect(mockListRecordings).toHaveBeenCalledTimes(1);
      });

      const searchInput = screen.getByPlaceholderText(
        /search title\/agent\/tags/i,
      );
      await user.type(searchInput, "test{enter}");

      await waitFor(() => {
        expect(mockListRecordings).toHaveBeenCalledWith({
          limit: 200,
          q: "test",
        });
      });
    });

    it("triggers search on Search button click", async () => {
      const user = userEvent.setup();
      render(
        <Provider store={store}>
          <Recordings />
        </Provider>,
      );

      await waitFor(() => {
        expect(screen.getByText("Outbound Call #1")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(
        /search title\/agent\/tags/i,
      );
      await user.type(searchInput, "support");

      const searchButton = screen.getByRole("button", { name: /^search$/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(mockListRecordings).toHaveBeenCalledWith({
          limit: 200,
          q: "support",
        });
      });
    });
  });

  describe("Refresh Functionality", () => {
    it("renders refresh button", async () => {
      await renderRecordings();

      expect(
        screen.getByRole("button", { name: /refresh/i }),
      ).toBeInTheDocument();
    });

    it("reloads data on refresh click", async () => {
      const user = userEvent.setup();
      render(
        <Provider store={store}>
          <Recordings />
        </Provider>,
      );

      await waitFor(() => {
        expect(screen.getByText("Outbound Call #1")).toBeInTheDocument();
      });

      const refreshButton = screen.getByRole("button", { name: /refresh/i });
      await user.click(refreshButton);

      await waitFor(() => {
        expect(mockListRecordings).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("Audio Playback", () => {
    it("starts playback when play button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <Provider store={store}>
          <Recordings />
        </Provider>,
      );

      await waitFor(() => {
        expect(screen.getByText("Outbound Call #1")).toBeInTheDocument();
      });

      const playButtons = screen.getAllByRole("button", { name: /play/i });
      await user.click(playButtons[0]);

      await waitFor(() => {
        expect(mockLoad).toHaveBeenCalled();
        expect(mockPlay).toHaveBeenCalled();
      });
    });

    it("shows progress slider when recording is active", async () => {
      const user = userEvent.setup();
      render(
        <Provider store={store}>
          <Recordings />
        </Provider>,
      );

      await waitFor(() => {
        expect(screen.getByText("Outbound Call #1")).toBeInTheDocument();
      });

      const playButtons = screen.getAllByRole("button", { name: /play/i });
      await user.click(playButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole("slider")).toBeInTheDocument();
      });
    });
  });

  describe("Stop Functionality", () => {
    it("renders stop button", async () => {
      await renderRecordings();

      expect(screen.getByRole("button", { name: /stop/i })).toBeInTheDocument();
    });

    it("stops playback when stop button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <Provider store={store}>
          <Recordings />
        </Provider>,
      );

      await waitFor(() => {
        expect(screen.getByText("Outbound Call #1")).toBeInTheDocument();
      });

      const playButtons = screen.getAllByRole("button", { name: /play/i });
      await user.click(playButtons[0]);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /pause/i }),
        ).toBeInTheDocument();
      });

      const stopButton = screen.getByRole("button", { name: /stop/i });
      await user.click(stopButton);

      expect(mockPause).toHaveBeenCalled();
    });
  });

  describe("Empty State", () => {
    it("renders empty table when no recordings", async () => {
      mockListRecordings.mockResolvedValue({
        items: [],
        nextCursor: undefined,
      });

      render(
        <Provider store={store}>
          <Recordings />
        </Provider>,
      );

      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
      });

      // Check for the summary paragraph instead
      const summary = screen.getByText(/showing/i).parentElement;
      expect(summary).toHaveTextContent("0 of 0 items");
    });
  });

  describe("Pagination", () => {
    it("renders pagination controls", async () => {
      await renderRecordings();

      expect(screen.getByText(/page 1 of/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/page size/i)).toBeInTheDocument();
    });

    it("changes page size", async () => {
      const user = userEvent.setup();
      render(
        <Provider store={store}>
          <Recordings />
        </Provider>,
      );

      await waitFor(() => {
        expect(screen.getByText("Outbound Call #1")).toBeInTheDocument();
      });

      const pageSizeSelect = screen.getByDisplayValue("30"); // Now matches
      await user.selectOptions(pageSizeSelect, "50");

      expect(pageSizeSelect).toHaveValue("50");
    });
  });
});
