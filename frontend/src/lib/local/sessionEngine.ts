/** Static-build mirror of backend/services/session_service.py +
 * repositories/session_store.py — an in-memory Map replaces the backend's
 * process-lifetime dict, and every transition replaces the stored session
 * rather than mutating it in place (same "immutable session state" design
 * decision as the backend, see CLAUDE.md). */
import type { FlashcardRecord } from "@/types/localTopic";
import type { SessionState } from "@/types/session";

interface LocalSession {
  session_id: string;
  topic_label: string;
  side_1: string;
  side_2: string;
  shuffled_cards: FlashcardRecord[];
  current_index: number;
  is_flipped: boolean;
}

const sessions = new Map<string, LocalSession>();

function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function toResponse(session: LocalSession): SessionState {
  const completed = session.current_index >= session.shuffled_cards.length;
  const card = completed ? null : session.shuffled_cards[session.current_index];
  return {
    session_id: session.session_id,
    topic_label: session.topic_label,
    side_1: session.side_1,
    side_2: session.side_2,
    current_card: card
      ? { card_id: card.card_id, side_1_value: card.values[session.side_1], side_2_value: card.values[session.side_2] }
      : null,
    is_flipped: session.is_flipped,
    current_index: session.current_index,
    total_cards: session.shuffled_cards.length,
    completed,
    can_go_previous: session.current_index > 0,
    can_go_next: !completed,
  };
}

function get(sessionId: string): LocalSession {
  const session = sessions.get(sessionId);
  if (!session) throw new Error(`No session "${sessionId}"`);
  return session;
}

export function createSession(
  topicLabel: string,
  contentLabels: string[],
  cards: FlashcardRecord[],
  side1: string,
  side2: string,
): SessionState {
  if (side1 === side2) throw new Error("side_1 and side_2 must be different columns");
  if (!contentLabels.includes(side1) || !contentLabels.includes(side2)) {
    throw new Error("side_1/side_2 must be content columns for this topic");
  }
  if (cards.length === 0) throw new Error("No cards match the selected filters");

  const session: LocalSession = {
    session_id: crypto.randomUUID(),
    topic_label: topicLabel,
    side_1: side1,
    side_2: side2,
    shuffled_cards: shuffle(cards),
    current_index: 0,
    is_flipped: false,
  };
  sessions.set(session.session_id, session);
  return toResponse(session);
}

export function flipCard(sessionId: string): SessionState {
  const current = get(sessionId);
  const updated = { ...current, is_flipped: !current.is_flipped };
  sessions.set(sessionId, updated);
  return toResponse(updated);
}

export function goNext(sessionId: string): SessionState {
  const current = get(sessionId);
  if (current.current_index >= current.shuffled_cards.length) return toResponse(current);
  const updated = { ...current, current_index: current.current_index + 1, is_flipped: false };
  sessions.set(sessionId, updated);
  return toResponse(updated);
}

export function goPrevious(sessionId: string): SessionState {
  const current = get(sessionId);
  if (current.current_index <= 0) return toResponse(current);
  const updated = { ...current, current_index: current.current_index - 1, is_flipped: false };
  sessions.set(sessionId, updated);
  return toResponse(updated);
}
