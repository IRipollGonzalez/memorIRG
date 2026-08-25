import { useRef, useState } from "react";
import { Trash2 } from "lucide-react";

import { formatRelativeTime } from "@/lib/recentSessions";
import { cn } from "@/lib/utils";
import type { RecentSession } from "@/lib/recentSessions";

interface RecentSessionsDockProps {
  recents: RecentSession[];
  onResume: (recent: RecentSession) => void;
  onRemove: (recent: RecentSession) => void;
}

export function RecentSessionsDock({ recents, onResume, onRemove }: RecentSessionsDockProps) {
  if (recents.length === 0) return null;

  return (
    <div className="flex w-full shrink-0 flex-col border-t border-border bg-surface/60 px-4 py-4 sm:px-6">
      <p className="mb-2.5 shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">Recent</p>
      <div className="flex max-h-72 flex-col gap-2 overflow-y-auto sm:max-h-80">
        {recents.map((recent) => (
          <RecentSessionRow
            key={`${recent.topicName}|${recent.category}|${recent.subcategory}|${recent.side1}|${recent.side2}`}
            recent={recent}
            onResume={onResume}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}

const REMOVE_THRESHOLD = -72;

function RecentSessionRow({
  recent,
  onResume,
  onRemove,
}: {
  recent: RecentSession;
  onResume: (recent: RecentSession) => void;
  onRemove: (recent: RecentSession) => void;
}) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [removed, setRemoved] = useState(false);
  const startXRef = useRef(0);
  const draggedRef = useRef(false);

  function handlePointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    startXRef.current = event.clientX;
    draggedRef.current = false;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    if (!dragging) return;
    const delta = event.clientX - startXRef.current;
    if (Math.abs(delta) > 6) draggedRef.current = true;
    setDragX(Math.min(0, delta));
  }

  function handlePointerUp() {
    setDragging(false);
    if (dragX < REMOVE_THRESHOLD) {
      setRemoved(true);
      setDragX(-400);
      setTimeout(() => onRemove(recent), 180);
    } else {
      setDragX(0);
    }
  }

  function handleClick() {
    if (draggedRef.current) {
      draggedRef.current = false;
      return;
    }
    onResume(recent);
  }

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-xl transition-[max-height,opacity] duration-200 ease-out",
        removed ? "max-h-0 opacity-0" : "max-h-24 opacity-100",
      )}
    >
      <div className="absolute inset-0 flex items-center justify-end rounded-xl bg-negative px-5">
        <Trash2 className="size-4 text-white" />
      </div>
      <button
        type="button"
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ transform: `translateX(${dragX}px)` }}
        className={cn(
          "relative flex w-full shrink-0 touch-pan-y items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3.5 text-left select-none hover:bg-secondary active:bg-secondary sm:py-4",
          dragging ? "" : "transition-transform duration-200 ease-out",
        )}
      >
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-sm font-medium text-foreground sm:text-base">{recent.topicLabel}</span>
          <span className="truncate text-xs text-muted-foreground sm:text-sm">
            {recent.side1} → {recent.side2}
          </span>
        </span>
        <span className="shrink-0 text-xs text-muted-foreground sm:text-sm">
          {formatRelativeTime(recent.startedAt)}
        </span>
      </button>
    </div>
  );
}
