import type { TopicDetail, TopicSummary } from "@/types/topic";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { hasCategories as computeHasCategories, uniqueCategories, uniqueSubcategories } from "@/lib/topicFilters";

const ALL_VALUE = "__all__";

interface SidebarProps {
  topics: TopicSummary[];
  topicName: string | null;
  onTopicChange: (name: string) => void;
  topic: TopicDetail | undefined;
  category: string | null;
  onCategoryChange: (category: string | null) => void;
  subcategory: string | null;
  onSubcategoryChange: (subcategory: string | null) => void;
  side1: string | null;
  side2: string | null;
  onSide1Change: (side: string) => void;
  onSide2Change: (side: string) => void;
  matchingCount: number | null;
  onStart: () => void;
  starting: boolean;
}

export function Sidebar({
  topics,
  topicName,
  onTopicChange,
  topic,
  category,
  onCategoryChange,
  subcategory,
  onSubcategoryChange,
  side1,
  side2,
  onSide1Change,
  onSide2Change,
  matchingCount,
  onStart,
  starting,
}: SidebarProps) {
  const pairs = topic?.category_subcategory_pairs ?? [];
  const hasCategories = computeHasCategories(pairs);
  const categories = uniqueCategories(pairs);
  const subcategories = uniqueSubcategories(pairs, category);

  const noMatches = matchingCount === 0;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-5 md:gap-4">
        <Field label="Topic">
          {/* value is never `undefined` (even before topics load) — Base UI
              warns loudly if a Select flips from uncontrolled to controlled
              once a real value arrives. */}
          <Select value={topicName ?? ""} onValueChange={(value) => value && onTopicChange(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a topic">
                {(value: string | null) => topics.find((t) => t.name === value)?.label ?? "Choose a topic"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {topics.map((t) => (
                <SelectItem key={t.name} value={t.name}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {hasCategories && (
          <>
            <Field label="Category">
              <Select
                value={category ?? ALL_VALUE}
                onValueChange={(value) => onCategoryChange(value === ALL_VALUE ? null : value)}
              >
                <SelectTrigger className="h-11 w-full text-base md:h-8 md:text-sm">
                  <SelectValue>{(value: string) => (value === ALL_VALUE ? "All" : value)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>All</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {subcategories.length > 0 && (
              <Field label="Subcategory">
                <Select
                  value={subcategory ?? ALL_VALUE}
                  onValueChange={(value) => onSubcategoryChange(value === ALL_VALUE ? null : value)}
                >
                  <SelectTrigger className="h-11 w-full text-base md:h-8 md:text-sm">
                    <SelectValue>{(value: string) => (value === ALL_VALUE ? "All" : value)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUE}>All</SelectItem>
                    {subcategories.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          </>
        )}

        {topic && (
          <>
            <Field label="Side 1 (shown first)">
              <Select value={side1 ?? ""} onValueChange={(value) => value && onSide1Change(value)}>
                <SelectTrigger className="h-11 w-full text-base md:h-8 md:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {topic.content_labels.map((label) => (
                    <SelectItem key={label} value={label}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Side 2 (revealed on flip)">
              <Select value={side2 ?? ""} onValueChange={(value) => value && onSide2Change(value)}>
                <SelectTrigger className="h-11 w-full text-base md:h-8 md:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {topic.content_labels.map((label) => (
                    <SelectItem key={label} value={label}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </>
        )}
      </div>

      {noMatches && (
        <p className="rounded-md bg-negative/10 px-3 py-2 text-sm text-negative">
          No cards match the current filters.
        </p>
      )}

      <Button
        className="mt-auto h-14 w-full text-lg md:h-10 md:text-base"
        size="lg"
        disabled={!topic || noMatches || starting}
        onClick={onStart}
      >
        {starting ? "Starting…" : "Start Session"}
      </Button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2 md:gap-1.5">
      <span className="text-sm font-medium text-muted-foreground md:text-xs">{label}</span>
      {children}
    </label>
  );
}
