export interface SessionCreateRequest {
  topic: string;
  category: string | null;
  subcategory: string | null;
  side_1: string;
  side_2: string;
}

export interface CardResponse {
  card_id: string;
  side_1_value: string;
  side_2_value: string;
}

export interface SessionState {
  session_id: string;
  topic_label: string;
  side_1: string;
  side_2: string;
  current_card: CardResponse | null;
  is_flipped: boolean;
  current_index: number;
  total_cards: number;
  completed: boolean;
  can_go_previous: boolean;
  can_go_next: boolean;
}
