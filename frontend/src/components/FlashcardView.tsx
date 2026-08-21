import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { SessionState } from "@/types/session";

interface FlashcardViewProps {
  session: SessionState | null;
  onFlip: () => void;
  onNext: () => void;
  onPrevious: () => void;
  pending: boolean;
}

export function FlashcardView({ session, onFlip, onNext, onPrevious, pending }: FlashcardViewProps) {
  if (!session) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="font-serif text-lg text-foreground sm:text-xl">Pick a topic and press Start Session</p>
        <p className="text-sm text-muted-foreground">Your shuffled deck will appear here.</p>
      </div>
    );
  }

  if (session.completed) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-serif text-xl font-semibold text-foreground sm:text-2xl">Session complete!</p>
        <p className="text-sm text-muted-foreground">
          You went through all {session.total_cards} cards in {session.topic_label}.
        </p>
        <Button variant="outline" size="lg" onClick={onPrevious} disabled={pending}>
          Previous
        </Button>
      </div>
    );
  }

  const card = session.current_card!;
  const shownValue = session.is_flipped ? card.side_2_value : card.side_1_value;
  const shownLabel = session.is_flipped ? session.side_2 : session.side_1;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-6 sm:gap-6 sm:px-6">
      <p className="text-sm text-muted-foreground">
        Card {session.current_index + 1} of {session.total_cards}
      </p>

      <Card
        className="flex h-56 w-full max-w-xl cursor-pointer flex-col items-center justify-center gap-3 px-6 text-center transition-transform hover:scale-[1.01] sm:h-72 sm:px-8"
        onClick={onFlip}
        data-testid="flashcard"
      >
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{shownLabel}</span>
        <span className="font-serif text-2xl font-medium text-foreground sm:text-3xl">{shownValue}</span>
        <span className="text-xs text-muted-foreground">Tap to flip</span>
      </Card>

      <div className="grid w-full max-w-xl grid-cols-3 gap-2 sm:flex sm:w-auto sm:items-center sm:gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={onPrevious}
          disabled={!session.can_go_previous || pending}
        >
          Previous
        </Button>
        <Button variant="secondary" size="lg" onClick={onFlip} disabled={pending}>
          Flip
        </Button>
        <Button size="lg" onClick={onNext} disabled={!session.can_go_next || pending}>
          Next
        </Button>
      </div>
    </div>
  );
}
