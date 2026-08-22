/** Purely decorative two-flashcard mark for the empty/landing state.
 * Colors come from the same tokens the real flashcard uses (card-front/
 * card-back), so it reads as "this app, before you've picked a deck" —
 * not a generic illustration. */
export function CardsMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 220" className={className} aria-hidden="true">
      <rect
        x="45"
        y="58"
        width="118"
        height="148"
        rx="16"
        transform="rotate(-9 104 132)"
        className="fill-card-back stroke-border"
        strokeWidth="1.5"
      />
      <rect
        x="57"
        y="46"
        width="118"
        height="148"
        rx="16"
        transform="rotate(7 116 120)"
        className="fill-card-front stroke-border"
        strokeWidth="1.5"
      />
      <g transform="rotate(7 116 120)">
        <rect x="80" y="90" width="72" height="9" rx="4.5" className="fill-muted-foreground" opacity="0.3" />
        <rect x="80" y="110" width="48" height="9" rx="4.5" className="fill-muted-foreground" opacity="0.2" />
        <circle cx="118" cy="155" r="16" className="fill-primary" opacity="0.9" />
      </g>
    </svg>
  );
}
