/** Recently-studied deck configurations, kept in localStorage so the
 * landing state can offer a one-tap "resume" — purely a client-side
 * convenience, no server involved on either the API or static build. */

export interface RecentSession {
  topicName: string;
  topicLabel: string;
  category: string | null;
  subcategory: string | null;
  side1: string;
  side2: string;
  startedAt: string;
}

const STORAGE_KEY = "memorirg.recent_sessions";
const MAX_ENTRIES = 6;

function readAll(): RecentSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function loadRecentSessions(): RecentSession[] {
  return readAll();
}

function sameConfig(a: RecentSession, b: RecentSession): boolean {
  return (
    a.topicName === b.topicName &&
    a.category === b.category &&
    a.subcategory === b.subcategory &&
    a.side1 === b.side1 &&
    a.side2 === b.side2
  );
}

/** Moves a matching entry to the front instead of duplicating it. Returns
 * the updated list so callers can update UI state without a re-read. */
export function saveRecentSession(entry: RecentSession): RecentSession[] {
  const next = [entry, ...readAll().filter((r) => !sameConfig(r, entry))].slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private browsing / quota exceeded — recents just won't persist this session.
  }
  return next;
}

export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const minutes = Math.round((now.getTime() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}
