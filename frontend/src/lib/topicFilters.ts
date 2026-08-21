import type { CategorySubcategoryPair, TopicDetail } from "@/types/topic";

/** When picking the same content label for both sides, auto-swap the other
 * one so the two sides are never identical. */
export function resolveOtherSide(
  changedTo: string,
  otherSide: string | null,
  contentLabels: string[],
): string | null {
  if (changedTo !== otherSide) return otherSide;
  return contentLabels.find((label) => label !== changedTo) ?? otherSide;
}

export function uniqueCategories(pairs: CategorySubcategoryPair[]): string[] {
  return [...new Set(pairs.map((p) => p.category).filter((c): c is string => c !== null))].sort();
}

export function uniqueSubcategories(pairs: CategorySubcategoryPair[], category: string | null): string[] {
  return [
    ...new Set(
      pairs
        .filter((p) => category === null || p.category === category)
        .map((p) => p.subcategory)
        .filter((s): s is string => s !== null),
    ),
  ].sort();
}

export function hasCategories(pairs: CategorySubcategoryPair[]): boolean {
  return pairs.some((p) => p.category !== null);
}

/** Whether any card in the topic matches the current category/subcategory
 * selection — used to disable Start Session when a filter combination is
 * empty. Counts distinct (category, subcategory) pairs, not cards, since
 * that's all the API exposes; any nonzero match implies at least one card. */
export function matchingPairCount(
  topic: TopicDetail | undefined,
  category: string | null,
  subcategory: string | null,
): number | null {
  if (!topic) return null;
  if (!hasCategories(topic.category_subcategory_pairs)) return topic.total_cards;
  return topic.category_subcategory_pairs.filter(
    (pair) => (category === null || pair.category === category) && (subcategory === null || pair.subcategory === subcategory),
  ).length;
}
