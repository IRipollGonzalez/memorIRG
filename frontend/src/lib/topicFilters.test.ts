import { describe, expect, it } from "vitest";

import { hasCategories, matchingPairCount, resolveOtherSide, uniqueCategories, uniqueSubcategories } from "@/lib/topicFilters";
import type { TopicDetail } from "@/types/topic";

describe("resolveOtherSide", () => {
  it("leaves the other side untouched when there's no conflict", () => {
    expect(resolveOtherSide("english", "spanish", ["english", "spanish", "italian"])).toBe("spanish");
  });

  it("auto-swaps the other side when both would match", () => {
    expect(resolveOtherSide("english", "english", ["english", "spanish", "italian"])).toBe("spanish");
  });

  it("falls back to the original value if no alternative exists", () => {
    expect(resolveOtherSide("english", "english", ["english"])).toBe("english");
  });
});

describe("category helpers", () => {
  const pairs = [
    { category: "animals", subcategory: "farm" },
    { category: "animals", subcategory: "wild" },
    { category: "colors", subcategory: null },
  ];

  it("dedupes and sorts categories", () => {
    expect(uniqueCategories(pairs)).toEqual(["animals", "colors"]);
  });

  it("narrows subcategories to the selected category", () => {
    expect(uniqueSubcategories(pairs, "animals")).toEqual(["farm", "wild"]);
    expect(uniqueSubcategories(pairs, "colors")).toEqual([]);
    expect(uniqueSubcategories(pairs, null)).toEqual(["farm", "wild"]);
  });

  it("detects whether any pair carries a category", () => {
    expect(hasCategories(pairs)).toBe(true);
    expect(hasCategories([{ category: null, subcategory: null }])).toBe(false);
  });
});

describe("matchingPairCount", () => {
  const topicWithCategories: TopicDetail = {
    name: "languages",
    label: "Languages",
    content_labels: ["english", "spanish"],
    category_subcategory_pairs: [
      { category: "animals", subcategory: "farm" },
      { category: "colors", subcategory: null },
    ],
    total_cards: 25,
  };

  const topicWithoutCategories: TopicDetail = {
    ...topicWithCategories,
    category_subcategory_pairs: [{ category: null, subcategory: null }],
  };

  it("returns null when there's no topic yet", () => {
    expect(matchingPairCount(undefined, null, null)).toBeNull();
  });

  it("counts matching pairs when categories exist", () => {
    expect(matchingPairCount(topicWithCategories, null, null)).toBe(2);
    expect(matchingPairCount(topicWithCategories, "animals", null)).toBe(1);
    expect(matchingPairCount(topicWithCategories, "does-not-exist", null)).toBe(0);
  });

  it("falls back to total_cards when the topic has no category column", () => {
    expect(matchingPairCount(topicWithoutCategories, null, null)).toBe(25);
  });
});
