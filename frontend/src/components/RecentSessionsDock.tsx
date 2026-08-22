import { formatRelativeTime } from "@/lib/recentSessions";
import type { RecentSession } from "@/lib/recentSessions";

interface RecentSessionsDockProps {
  recents: RecentSession[];
  onResume: (recent: RecentSession) => void;
}

export function RecentSessionsDock({ recents, onResume }: RecentSessionsDockProps) {
  if (recents.length === 0) return null;

  return (
    <div className="flex w-full shrink-0 flex-col border-t border-border bg-surface/60 px-4 py-4 sm:px-6">
      <p className="mb-2.5 shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">Recent</p>
      <div className="flex max-h-72 flex-col gap-2 overflow-y-auto sm:max-h-80">
        {recents.map((recent) => (
          <button
            key={`${recent.topicName}|${recent.category}|${recent.subcategory}|${recent.side1}|${recent.side2}`}
            type="button"
            onClick={() => onResume(recent)}
            className="flex w-full shrink-0 items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3.5 text-left transition-colors hover:bg-secondary active:bg-secondary sm:py-4"
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
        ))}
      </div>
    </div>
  );
}
