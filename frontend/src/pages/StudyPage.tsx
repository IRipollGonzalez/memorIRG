import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import { useTopic, useTopics } from "@/api/topics";
import { useCreateSession, useFlipCard, useNextCard, usePreviousCard } from "@/api/sessions";
import { Sidebar } from "@/components/Sidebar";
import { FlashcardView } from "@/components/FlashcardView";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { matchingPairCount, resolveOtherSide } from "@/lib/topicFilters";
import type { SessionState } from "@/types/session";

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary font-serif text-xs font-semibold text-primary-foreground md:size-8 md:text-sm">
        M
      </div>
      <span className="font-serif text-base font-semibold tracking-tight md:text-lg">MemorIRG</span>
    </div>
  );
}

export function StudyPage() {
  const { data: topics = [] } = useTopics();

  const [topicName, setTopicName] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [subcategory, setSubcategory] = useState<string | null>(null);
  const [side1, setSide1] = useState<string | null>(null);
  const [side2, setSide2] = useState<string | null>(null);
  const [session, setSession] = useState<SessionState | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: topic } = useTopic(topicName);
  const createSession = useCreateSession();
  const flipCard = useFlipCard();
  const nextCard = useNextCard();
  const previousCard = usePreviousCard();

  useEffect(() => {
    if (topics.length > 0 && topicName === null) {
      setTopicName(topics[0].name);
    }
  }, [topics, topicName]);

  useEffect(() => {
    if (topic) {
      setCategory(null);
      setSubcategory(null);
      setSide1(topic.content_labels[0] ?? null);
      setSide2(topic.content_labels[1] ?? null);
    }
  }, [topic?.name]);

  useEffect(() => {
    setSubcategory(null);
  }, [category]);

  function handleSide1Change(next: string) {
    setSide1(next);
    setSide2((current) => resolveOtherSide(next, current, topic?.content_labels ?? []));
  }

  function handleSide2Change(next: string) {
    setSide2(next);
    setSide1((current) => resolveOtherSide(next, current, topic?.content_labels ?? []));
  }

  const matchingCount = matchingPairCount(topic, category, subcategory);

  function handleStart() {
    if (!topicName || !side1 || !side2) return;
    createSession.mutate(
      { topic: topicName, category, subcategory, side_1: side1, side_2: side2 },
      {
        onSuccess: (next) => {
          setSession(next);
          setSheetOpen(false);
        },
      },
    );
  }

  const sidebarProps = {
    topics,
    topicName,
    onTopicChange: setTopicName,
    topic,
    category,
    onCategoryChange: setCategory,
    subcategory,
    onSubcategoryChange: setSubcategory,
    side1,
    side2,
    onSide1Change: handleSide1Change,
    onSide2Change: handleSide2Change,
    matchingCount,
    onStart: handleStart,
    starting: createSession.isPending,
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-background text-foreground md:flex-row">
      {/* Mobile/tablet: sidebar content lives in a slide-out sheet, triggered from a slim top bar. */}
      <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3 md:hidden">
        <Logo />
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger render={<Button variant="outline" size="sm" />}>
            <SlidersHorizontal className="size-4" />
            Deck
          </SheetTrigger>
          <SheetContent side="left" className="w-[86vw] max-w-sm gap-0 p-5">
            <SheetHeader className="p-0 pb-5">
              <SheetTitle>Study deck</SheetTitle>
              <SheetDescription>Choose a topic and how to study it.</SheetDescription>
            </SheetHeader>
            <Sidebar {...sidebarProps} />
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop/tablet-landscape: fixed left column. */}
      <aside className="hidden w-72 shrink-0 flex-col gap-6 border-r border-border bg-surface/40 px-5 py-6 md:flex">
        <Logo />
        <Sidebar {...sidebarProps} />
      </aside>

      <main className="flex flex-1 flex-col overflow-y-auto">
        <FlashcardView
          session={session}
          onFlip={() => session && flipCard.mutate(session.session_id, { onSuccess: setSession })}
          onNext={() => session && nextCard.mutate(session.session_id, { onSuccess: setSession })}
          onPrevious={() => session && previousCard.mutate(session.session_id, { onSuccess: setSession })}
          pending={flipCard.isPending || nextCard.isPending || previousCard.isPending}
        />
      </main>
    </div>
  );
}
