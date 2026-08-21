/** Mirrors backend/domain/models.py's FlashcardRecord/Topic — the shape
 * baked into src/data/topics.json by scripts/build_topics_json.py. */
export interface FlashcardRecord {
  card_id: string;
  category: string | null;
  subcategory: string | null;
  values: Record<string, string>;
}

export interface LocalTopic {
  name: string;
  label: string;
  content_labels: string[];
  cards: FlashcardRecord[];
}
