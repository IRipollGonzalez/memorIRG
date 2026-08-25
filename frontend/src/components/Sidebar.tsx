import { useEffect, useRef, useState } from "react";
import { ChevronDown, Info } from "lucide-react";

import type { TopicDetail, TopicSummary } from "@/types/topic";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { hasCategories, uniqueCategories } from "@/lib/topicFilters";
import { IS_STATIC } from "@/lib/env";
import { cn } from "@/lib/utils";

const REPO_URL = "https://github.com/IRipollGonzalez/memorIRG";
const ALL_CATEGORIES = "__all__";

interface SidebarProps {
  topics: TopicSummary[];
  topicName: string | null;
  onTopicChange: (name: string) => void;
  topic: TopicDetail | undefined;
  category: string | null;
  onCategoryChange: (category: string | null) => void;
  side1: string | null;
  side2: string | null;
  onSide1Change: (side: string) => void;
  onSide2Change: (side: string) => void;
  matchingCount: number | null;
  onStart: () => void;
  starting: boolean;
}

type Phase = "choosing" | "ready";

/** Topic (+ category, when the topic has any) is one step: picking a
 * category — or a topic with no categories at all — collapses it down to a
 * compact summary and reveals the sides step below, with "Play" as the only
 * action button. Tapping the summary reopens the choosing step. */
export function Sidebar({
  topics,
  topicName,
  onTopicChange,
  topic,
  category,
  onCategoryChange,
  side1,
  side2,
  onSide1Change,
  onSide2Change,
  matchingCount,
  onStart,
  starting,
}: SidebarProps) {
  const [infoOpen, setInfoOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("choosing");
  // Whether the user has actually tapped a category option for the
  // *current* topic yet — kept separate from `category` itself, since
  // `category === null` means both "nothing chosen" and "All" was chosen.
  const [categoryChosen, setCategoryChosen] = useState(false);
  const prevTopicNameRef = useRef<string | null>(null);

  const pairs = topic?.category_subcategory_pairs ?? [];
  const hasCategoriesForTopic = hasCategories(pairs);
  const categories = uniqueCategories(pairs);

  useEffect(() => {
    setCategoryChosen(false);
  }, [topicName]);

  // A newly-loaded topic with no categories has nothing left to pick before
  // sides — collapse straight to the sides step once its detail arrives.
  useEffect(() => {
    if (!topic) return;
    const isNewTopic = prevTopicNameRef.current !== topic.name;
    prevTopicNameRef.current = topic.name;
    if (isNewTopic && !hasCategories(topic.category_subcategory_pairs)) {
      setPhase("ready");
    }
  }, [topic]);

  const topicOptions = topics.map((t) => ({ value: t.name, label: t.label }));
  const categoryOptions = [
    { value: ALL_CATEGORIES, label: "All" },
    ...categories.map((c) => ({ value: c, label: c })),
  ];
  const sideOptions = (topic?.content_labels ?? []).map((l) => ({ value: l, label: l }));

  function handleTopicSelect(value: string) {
    onTopicChange(value);
    // Re-picking the same topic when it has no category step won't trigger
    // the "new topic" effect above (nothing actually changed) — collapse now.
    if (value === topicName && !hasCategoriesForTopic) {
      setPhase("ready");
    }
  }

  function handleCategorySelect(value: string) {
    onCategoryChange(value === ALL_CATEGORIES ? null : value);
    setCategoryChosen(true);
    setPhase("ready");
  }

  const selectedTopicLabel = topics.find((t) => t.name === topicName)?.label ?? topicName ?? "";
  const noMatches = matchingCount === 0;
  const canStart = !!topic && !!side1 && !!side2 && !noMatches && !starting;
  const showSides = phase === "ready" && !!topic;
  const heading = topicName && hasCategoriesForTopic ? "Choose a topic and category" : "Choose a topic";

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-muted-foreground">Pick a topic and how you'd like to study it.</p>
        {IS_STATIC && (
          <Sheet open={infoOpen} onOpenChange={setInfoOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 rounded-full text-muted-foreground"
                  aria-label="How to add new cards"
                />
              }
            >
              <Info className="size-4" />
            </SheetTrigger>
            <SheetContent side="center" className="gap-3 p-5">
              <SheetHeader className="p-0">
                <SheetTitle>Adding cards</SheetTitle>
              </SheetHeader>
              <AddCardsHelp />
            </SheetContent>
          </Sheet>
        )}
      </div>

      {phase === "ready" ? (
        <div className="flex flex-col gap-1.5">
          <SummaryRow heading="Topic" value={selectedTopicLabel} onClick={() => setPhase("choosing")} />
          {hasCategoriesForTopic && (
            <SummaryRow heading="Category" value={category ?? "All"} onClick={() => setPhase("choosing")} />
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-foreground">{heading}</p>
          <div className={topicName && hasCategoriesForTopic ? "grid grid-cols-2 gap-3" : ""}>
            <FilterColumn label="Topic" options={topicOptions} selected={topicName} onSelect={handleTopicSelect} />
            {topicName && hasCategoriesForTopic && (
              <FilterColumn
                label="Category"
                options={categoryOptions}
                selected={categoryChosen ? (category ?? ALL_CATEGORIES) : null}
                onSelect={handleCategorySelect}
              />
            )}
          </div>
        </div>
      )}

      {showSides && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-foreground">Choose your sides</p>
          <div className="grid grid-cols-2 gap-3">
            <FilterColumn label="Side 1 (shown first)" options={sideOptions} selected={side1} onSelect={onSide1Change} />
            <FilterColumn
              label="Side 2 (revealed on flip)"
              options={sideOptions}
              selected={side2}
              onSelect={onSide2Change}
            />
          </div>
        </div>
      )}

      {showSides && noMatches && (
        <p className="rounded-md bg-negative/10 px-3 py-2 text-sm text-negative">
          No cards match the current filters.
        </p>
      )}

      {showSides && (
        <Button className="mt-auto h-14 w-full text-lg md:h-10 md:text-base" size="lg" disabled={!canStart} onClick={onStart}>
          {starting ? "Starting…" : "Play"}
        </Button>
      )}
    </div>
  );
}

function SummaryRow({ heading, value, onClick }: { heading: string; value: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-raised px-3.5 py-2.5 text-left transition-colors hover:bg-border/30"
    >
      <span className="flex flex-col gap-0.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{heading}</span>
        <span className="text-sm font-medium text-foreground">{value}</span>
      </span>
      <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

/** Options render inside a box capped at 6 items tall — shorter when there
 * are fewer, and scrollable internally once there are more, so a long list
 * (e.g. many categories) never pushes the rest of the page around. */
function FilterColumn({
  label,
  options,
  selected,
  onSelect,
  emptyHint,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string | null;
  onSelect: (value: string) => void;
  emptyHint?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      {options.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground">
          {emptyHint ?? "None available"}
        </p>
      ) : (
        <div className="flex max-h-[21rem] flex-col gap-2 overflow-y-auto rounded-xl border border-border p-2">
          {options.map((option) => {
            const isSelected = option.value === selected;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onSelect(option.value)}
                className={cn(
                  "shrink-0 rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface text-foreground hover:bg-surface-raised",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">{children}</code>;
}

/** Only rendered on the static (GitHub Pages) build — the desktop/dev app's
 * equivalent instructions are "drop a CSV in data/ and reload", which
 * doesn't involve GitHub at all. */
function AddCardsHelp() {
  return (
    <div className="overflow-y-auto text-sm text-muted-foreground">
      <p className="mb-2.5 leading-relaxed">
        <span className="font-medium text-foreground">Want to add a new topic?</span> Go to{" "}
        <a
          href={REPO_URL}
          target="_blank"
          rel="noreferrer"
          className="text-accent underline underline-offset-2 hover:text-accent-hover"
        >
          github.com/IRipollGonzalez/memorIRG
        </a>
        , open the <Code>data</Code> folder, and add a new <Code>.csv</Code> file there. The first row is the
        column names — <Code>category</Code> and <Code>subcategory</Code> are optional filters, and every other
        column becomes a side you can pick above (you can have more than two). For example:
      </p>
      <pre className="mb-2.5 overflow-x-auto rounded-md bg-muted px-3 py-2 font-mono text-xs text-foreground">
        {"category,english,spanish,italian\nanimals,dog,perro,cane"}
      </pre>
      <p className="leading-relaxed">
        <span className="font-medium text-foreground">Want to add cards to an existing topic?</span> Open that
        topic's <Code>.csv</Code> file in the same folder, add a new line with a value for each column, and
        commit. The site rebuilds and updates automatically within a minute or two.
      </p>
    </div>
  );
}
