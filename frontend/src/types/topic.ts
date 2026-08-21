export interface TopicSummary {
  name: string;
  label: string;
}

export interface CategorySubcategoryPair {
  category: string | null;
  subcategory: string | null;
}

export interface TopicDetail {
  name: string;
  label: string;
  content_labels: string[];
  category_subcategory_pairs: CategorySubcategoryPair[];
  total_cards: number;
}
