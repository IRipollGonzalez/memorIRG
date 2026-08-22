import { formatRelativeTime } from "@/lib/recentSessions";
import type { RecentSession } from "@/lib/recentSessions";

interface RecentSessionsDockProps {
  recents: RecentSession[];
  onResume: (recent: RecentSession) => void;
}

export function RecentSessionsDock({ recents, onResume }: RecentSessionsDockProps) {
  if (recents.length === 0) return null;

  return (
    <div className="w-full shrink-0 border-t border-border bg-surface/60 px-4 py-4 sm:px-6">
      <p className="mb-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Recent</p>
      <div className="flex gap-2.5 overflow-x-auto pb-1">
        {recents.map((recent) => (
          <button
            key={`${recent.topicName}|${recent.category}|${recent.subcategory}|${recent.side1}|${recent.side2}`}
            type="button"
            onClick={() => onResume(recent)}
            className="flex shrink-0 flex-col items-start gap-1 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-secondary active:bg-secondary"
          >
            <span className="text-sm font-medium text-foreground sm:text-base">{recent.topicLabel}</span>
            <span className="text-xs text-muted-foreground sm:text-sm">
              {recent.side1} → {recent.side2} · {formatRelativeTime(recent.startedAt)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
