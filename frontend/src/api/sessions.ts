import { useMutation } from "@tanstack/react-query";

import { apiFetch } from "@/api/client";
import { IS_STATIC } from "@/lib/env";
import { getTopic } from "@/lib/local/topicsEngine";
import { filterCards } from "@/lib/local/deckEngine";
import * as localSessionEngine from "@/lib/local/sessionEngine";
import type { SessionCreateRequest, SessionState } from "@/types/session";

export function useCreateSession() {
  return useMutation({
    mutationFn: async (body: SessionCreateRequest): Promise<SessionState> => {
      if (!IS_STATIC) return apiFetch<SessionState>("/sessions", { method: "POST", body: JSON.stringify(body) });

      const topic = getTopic(body.topic);
      const cards = filterCards(topic.cards, body.category, body.subcategory);
      return localSessionEngine.createSession(topic.label, topic.content_labels, cards, body.side_1, body.side_2);
    },
  });
}

export function useFlipCard() {
  return useMutation({
    mutationFn: async (sessionId: string) =>
      IS_STATIC
        ? localSessionEngine.flipCard(sessionId)
        : apiFetch<SessionState>(`/sessions/${sessionId}/flip`, { method: "POST" }),
  });
}

export function useNextCard() {
  return useMutation({
    mutationFn: async (sessionId: string) =>
      IS_STATIC
        ? localSessionEngine.goNext(sessionId)
        : apiFetch<SessionState>(`/sessions/${sessionId}/next`, { method: "POST" }),
  });
}

export function usePreviousCard() {
  return useMutation({
    mutationFn: async (sessionId: string) =>
      IS_STATIC
        ? localSessionEngine.goPrevious(sessionId)
        : apiFetch<SessionState>(`/sessions/${sessionId}/previous`, { method: "POST" }),
  });
}
