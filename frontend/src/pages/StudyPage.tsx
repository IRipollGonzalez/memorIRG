import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import { useTopic, useTopics } from "@/api/topics";
import { useCreateSession, useFlipCard, useNextCard, usePreviousCard } from "@/api/sessions";
import { Sidebar } from "@/components/Sidebar";
import { FlashcardView } from "@/components/FlashcardView";
import { RecentSessionsDock } from "@/components/RecentSessionsDock";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { matchingPairCount, resolveOtherSide } from "@/lib/topicFilters";
import { loadRecentSessions, saveRecentSession } from "@/lib/recentSessions";
import { cn } from "@/lib/utils";
import type { RecentSession } from "@/lib/recentSessions";
import type { SessionState } from "@/types/session";

function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary font-serif text-sm font-semibold text-primary-foreground md:size-8">
        M
      </div>
      <span className="font-serif text-lg font-semibold tracking-tight">MemorIRG</span>
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
  const [recents, setRecents] = useState<RecentSession[]>(() => loadRecentSessions());
  const pendingResumeRef = useRef<RecentSession | null>(null);

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
    if (!topic) return;

    const pending = pendingResumeRef.current;
    if (pending && pending.topicName === topic.name) {
      pendingResumeRef.current = null;
      startSession(pending);
      return;
    }

    setCategory(null);
    setSubcategory(null);
    setSide1(topic.content_labels[0] ?? null);
    setSide2(topic.content_labels[1] ?? null);
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

  function startSession(config: Omit<RecentSession, "startedAt">) {
    createSession.mutate(
      { topic: config.topicName, category: config.category, subcategory: config.subcategory, side_1: config.side1, side_2: config.side2 },
      {
        onSuccess: (next) => {
          setSession(next);
          setSheetOpen(false);
          setRecents(saveRecentSession({ ...config, startedAt: new Date().toISOString() }));
        },
      },
    );
  }

  function handleStart() {
    if (!topicName || !side1 || !side2 || !topic) return;
    startSession({ topicName, topicLabel: topic.label, category, subcategory, side1, side2 });
  }

  function handleOpenDeckFromLanding() {
    // The desktop layout already shows the sidebar inline — this tap-anywhere
    // affordance only makes sense (and only has a Sheet to open) below md.
    if (window.matchMedia("(max-width: 767px)").matches) {
      setSheetOpen(true);
    }
  }

  function handleResumeRecent(recent: RecentSession) {
    if (topic && topic.name === recent.topicName) {
      setCategory(recent.category);
      setSubcategory(recent.subcategory);
      setSide1(recent.side1);
      setSide2(recent.side2);
      startSession(recent);
    } else {
      pendingResumeRef.current = recent;
      setTopicName(recent.topicName);
    }
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
      {/* Mobile/tablet: sidebar content lives in a slide-out sheet. The Deck
          button is a backup affordance (useful once a session is active) —
          the primary way in is tapping the landing area itself, wired
          through FlashcardView's onOpenDeck below. A 3-column grid keeps the
          wordmark truly centered regardless of the Deck button's width. */}
      <header className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-border px-4 py-4 md:hidden">
        <span />
        <Logo className="justify-self-center" />
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger render={<Button variant="outline" size="lg" className="h-11 justify-self-end text-base" />}>
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
          onOpenDeck={handleOpenDeckFromLanding}
          pending={flipCard.isPending || nextCard.isPending || previousCard.isPending}
        />
        {!session && <RecentSessionsDock recents={recents} onResume={handleResumeRecent} />}
      </main>
    </div>
  );
}
