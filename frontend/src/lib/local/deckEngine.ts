/** Static-build mirror of backend/services/deck_service.py. */
import type { FlashcardRecord } from "@/types/localTopic";

export function filterCards(
  cards: FlashcardRecord[],
  category: string | null,
  subcategory: string | null,
): FlashcardRecord[] {
  let filtered = cards;
  if (category) filtered = filtered.filter((card) => card.category === category);
  if (subcategory) filtered = filtered.filter((card) => card.subcategory === subcategory);
  return filtered;
}
