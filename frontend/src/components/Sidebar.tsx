import { useState } from "react";
import { ChevronDown, Info } from "lucide-react";

import type { TopicDetail, TopicSummary } from "@/types/topic";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { hasCategories as computeHasCategories, uniqueCategories, uniqueSubcategories } from "@/lib/topicFilters";
import { IS_STATIC } from "@/lib/env";
import { cn } from "@/lib/utils";

const REPO_URL = "https://github.com/IRipollGonzalez/memorIRG";
const ALL_VALUE = "__all__";

type Step = "topic" | "category" | "subcategory" | "sides";

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
  const [editingLevel, setEditingLevel] = useState<Step | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);

  const pairs = topic?.category_subcategory_pairs ?? [];
  const hasCategoriesForTopic = computeHasCategories(pairs);
  const categories = uniqueCategories(pairs);
  const subcategories = uniqueSubcategories(pairs, category);
  const hasSubcategoriesForSelection = subcategories.length > 0;

  function naturalStep(): Step {
    if (!topicName || !topic) return "topic";
    if (hasCategoriesForTopic && category === null) return "category";
    if (hasCategoriesForTopic && hasSubcategoriesForSelection && subcategory === null) return "subcategory";
    return "sides";
  }

  const activeStep = editingLevel ?? naturalStep();

  function handleEditLevel(step: Step) {
    // Re-opening an earlier level clears whatever came after it — the whole
    // point of tapping a breadcrumb is to redo everything from that point on.
    if (step === "topic" || step === "category") onSubcategoryChange(null);
    if (step === "topic") onCategoryChange(null);
    setEditingLevel(step);
  }

  const selectedTopicLabel = topics.find((t) => t.name === topicName)?.label ?? topicName ?? "";
  const noMatches = matchingCount === 0;

  const breadcrumbs: { step: Step; heading: string; value: string }[] = [];
  if (activeStep !== "topic") {
    breadcrumbs.push({ step: "topic", heading: "Topic", value: selectedTopicLabel });
  }
  if (hasCategoriesForTopic && activeStep !== "topic" && activeStep !== "category") {
    breadcrumbs.push({ step: "category", heading: "Category", value: category ?? "All" });
  }
  if (
    hasCategoriesForTopic &&
    hasSubcategoriesForSelection &&
    activeStep !== "topic" &&
    activeStep !== "category" &&
    activeStep !== "subcategory"
  ) {
    breadcrumbs.push({ step: "subcategory", heading: "Subcategory", value: subcategory ?? "All" });
  }

  return (
    <div className="flex flex-1 flex-col gap-5">
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

      {breadcrumbs.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {breadcrumbs.map((crumb) => (
            <button
              key={crumb.step}
              type="button"
              onClick={() => handleEditLevel(crumb.step)}
              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-raised px-3.5 py-2.5 text-left transition-colors hover:bg-border/30"
            >
              <span className="flex flex-col gap-0.5">
                <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {crumb.heading}
                </span>
                <span className="text-sm font-medium text-foreground">{crumb.value}</span>
              </span>
              <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3">
        {activeStep === "topic" && (
          <StepButtons
            heading="Choose a topic"
            options={topics.map((t) => ({ value: t.name, label: t.label }))}
            selected={topicName}
            onSelect={(value) => {
              onTopicChange(value);
              setEditingLevel(null);
            }}
          />
        )}

        {activeStep === "category" && (
          <StepButtons
            heading="Choose a category"
            options={[{ value: ALL_VALUE, label: "All" }, ...categories.map((c) => ({ value: c, label: c }))]}
            selected={category ?? ALL_VALUE}
            onSelect={(value) => {
              onCategoryChange(value === ALL_VALUE ? null : value);
              setEditingLevel(null);
            }}
          />
        )}

        {activeStep === "subcategory" && (
          <StepButtons
            heading="Choose a subcategory"
            options={[{ value: ALL_VALUE, label: "All" }, ...subcategories.map((s) => ({ value: s, label: s }))]}
            selected={subcategory ?? ALL_VALUE}
            onSelect={(value) => {
              onSubcategoryChange(value === ALL_VALUE ? null : value);
              setEditingLevel(null);
            }}
          />
        )}

        {activeStep === "sides" && topic && (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-foreground">Choose your sides</p>
            <div className="grid grid-cols-2 gap-3">
              <SideColumn
                label="Side 1 (shown first)"
                options={topic.content_labels}
                selected={side1}
                onSelect={onSide1Change}
              />
              <SideColumn
                label="Side 2 (revealed on flip)"
                options={topic.content_labels}
                selected={side2}
                onSelect={onSide2Change}
              />
            </div>
          </div>
        )}
      </div>

      {activeStep === "sides" && noMatches && (
        <p className="rounded-md bg-negative/10 px-3 py-2 text-sm text-negative">
          No cards match the current filters.
        </p>
      )}

      {activeStep === "sides" && (
        <Button
          className="mt-auto h-14 w-full text-lg md:h-10 md:text-base"
          size="lg"
          disabled={!topic || noMatches || starting}
          onClick={onStart}
        >
          {starting ? "Starting…" : "Start Session"}
        </Button>
      )}
    </div>
  );
}

function StepButtons({
  heading,
  options,
  selected,
  onSelect,
}: {
  heading: string;
  options: { value: string; label: string }[];
  selected: string | null;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-foreground">{heading}</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {options.map((option) => {
          const isSelected = option.value === selected;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors md:py-2",
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
    </div>
  );
}

function SideColumn({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: string[];
  selected: string | null;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex flex-col gap-2">
        {options.map((option) => {
          const isSelected = option === selected;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              className={cn(
                "rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface text-foreground hover:bg-surface-raised",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
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
    <div className="flex-1 overflow-y-auto text-sm text-muted-foreground">
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
