import { beforeEach, describe, expect, it } from "vitest";

import { formatRelativeTime, loadRecentSessions, saveRecentSession } from "@/lib/recentSessions";
import type { RecentSession } from "@/lib/recentSessions";

function entry(overrides: Partial<RecentSession> = {}): RecentSession {
  return {
    topicName: "languages",
    topicLabel: "Languages",
    category: null,
    subcategory: null,
    side1: "english",
    side2: "spanish",
    startedAt: new Date().toISOString(),
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe("saveRecentSession", () => {
  it("persists and reloads entries", () => {
    saveRecentSession(entry());
    expect(loadRecentSessions()).toHaveLength(1);
  });

  it("moves a repeated config to the front instead of duplicating it", () => {
    saveRecentSession(entry({ topicName: "languages" }));
    saveRecentSession(entry({ topicName: "art" }));
    saveRecentSession(entry({ topicName: "languages" }));

    const recents = loadRecentSessions();
    expect(recents).toHaveLength(2);
    expect(recents[0].topicName).toBe("languages");
  });

  it("caps the list at 10 entries, dropping the oldest", () => {
    for (let i = 0; i < 12; i++) {
      saveRecentSession(entry({ topicName: `topic-${i}` }));
    }
    const recents = loadRecentSessions();
    expect(recents).toHaveLength(10);
    expect(recents[0].topicName).toBe("topic-11");
    expect(recents.some((r) => r.topicName === "topic-0")).toBe(false);
    expect(recents.some((r) => r.topicName === "topic-1")).toBe(false);
  });
});

describe("formatRelativeTime", () => {
  const now = new Date("2026-01-01T12:00:00Z");

  it("describes very recent times as 'just now'", () => {
    expect(formatRelativeTime(new Date("2026-01-01T11:59:40Z").toISOString(), now)).toBe("just now");
  });

  it("formats minutes and hours", () => {
    expect(formatRelativeTime(new Date("2026-01-01T11:45:00Z").toISOString(), now)).toBe("15m ago");
    expect(formatRelativeTime(new Date("2026-01-01T09:00:00Z").toISOString(), now)).toBe("3h ago");
  });

  it("falls back to a date string after a week", () => {
    const iso = new Date("2025-12-01T12:00:00Z").toISOString();
    expect(formatRelativeTime(iso, now)).toBe(new Date(iso).toLocaleDateString());
  });
});
