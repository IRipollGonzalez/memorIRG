import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { mediaKindForLabel, mediaUrl, prettyLabel, youtubeEmbedUrl } from "@/lib/media";
import type { SessionState } from "@/types/session";

function CardValue({ label, value }: { label: string; value: string }) {
  switch (mediaKindForLabel(label)) {
    case "image":
      return (
        <img
          src={mediaUrl(value)}
          alt={prettyLabel(label)}
          className="max-h-40 w-auto max-w-full rounded-md object-contain sm:max-h-56"
        />
      );
    case "youtube":
      return (
        <iframe
          className="aspect-video w-full max-w-sm rounded-md"
          src={youtubeEmbedUrl(value)}
          title={prettyLabel(label)}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    case "audio":
      // Stop propagation so tapping the native play button doesn't also flip the card.
      return (
        <audio controls className="w-full max-w-xs" src={mediaUrl(value)} onClick={(e) => e.stopPropagation()}>
          Your browser can't play this audio.
        </audio>
      );
    default:
      return <span className="font-serif text-2xl font-medium text-foreground sm:text-3xl">{value}</span>;
  }
}

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
        className={cn(
          "flex min-h-56 w-full max-w-xl cursor-pointer flex-col items-center justify-center gap-3 px-6 py-6 text-center transition-colors duration-200 hover:scale-[1.01] sm:min-h-72 sm:px-8 sm:py-8",
          session.is_flipped ? "bg-card-back" : "bg-card-front",
        )}
        onClick={onFlip}
        data-testid="flashcard"
      >
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{prettyLabel(shownLabel)}</span>
        <CardValue label={shownLabel} value={shownValue} />
        <span className="text-xs text-muted-foreground">Tap to flip</span>
      </Card>

      <div className="grid w-full max-w-xl grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center sm:gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={onPrevious}
          disabled={!session.can_go_previous || pending}
        >
          Previous
        </Button>
        <Button size="lg" onClick={onNext} disabled={!session.can_go_next || pending}>
          Next
        </Button>
      </div>
    </div>
  );
}
