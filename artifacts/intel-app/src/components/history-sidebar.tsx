import { useHistoryList } from "@/hooks/use-intel";
import { format } from "date-fns";
import { History, ArrowRight, Activity, TerminalSquare } from "lucide-react";
import { AnalysisRequestType } from "@workspace/api-client-react/src/generated/api.schemas";
import { cn } from "@/lib/utils";

interface HistorySidebarProps {
  onSelect: (type: AnalysisRequestType, target: string) => void;
  activeTarget?: string;
}

export function HistorySidebar({ onSelect, activeTarget }: HistorySidebarProps) {
  const { data: history, isLoading, isError } = useHistoryList(20);

  return (
    <div className="w-full h-full bg-card border-r border-border flex flex-col print-hidden">
      <div className="p-6 border-b border-border bg-background/50 flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <TerminalSquare className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-display font-bold text-lg text-foreground">Cyber OSINT</h2>
          <p className="text-xs text-muted-foreground">Threat Intelligence Platform</p>
        </div>
      </div>

      <div className="p-4 border-b border-border flex items-center gap-2 text-muted-foreground">
        <History className="w-4 h-4" />
        <h3 className="font-semibold text-sm uppercase tracking-wider">Recent Scans</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {isLoading && (
          <div className="flex flex-col gap-3 p-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-full h-16 bg-muted/50 animate-pulse rounded-lg" />
            ))}
          </div>
        )}

        {isError && (
          <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20 text-center">
            Failed to load history.
          </div>
        )}

        {history?.length === 0 && !isLoading && (
          <div className="p-6 text-center text-muted-foreground flex flex-col items-center gap-2">
            <Activity className="w-8 h-8 opacity-20" />
            <p className="text-sm">No analysis history found.</p>
          </div>
        )}

        {history?.map((item) => {
          const isActive = activeTarget === item.target;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.type as AnalysisRequestType, item.target)}
              className={cn(
                "w-full text-left p-3 rounded-lg border transition-all duration-200 group flex items-start justify-between gap-3",
                isActive 
                  ? "bg-primary/10 border-primary/30 shadow-[0_0_10px_rgba(0,184,217,0.1)]" 
                  : "bg-background border-transparent hover:border-border hover:bg-muted/50"
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider",
                    isActive ? "bg-primary text-primary-foreground" : "bg-secondary/20 text-secondary"
                  )}>
                    {item.type}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(item.createdAt), "MMM d, HH:mm")}
                  </span>
                </div>
                <p className={cn(
                  "text-sm font-mono truncate",
                  isActive ? "text-primary glow-text" : "text-foreground"
                )} title={item.target}>
                  {item.target}
                </p>
              </div>
              <ArrowRight className={cn(
                "w-4 h-4 shrink-0 mt-2 transition-transform duration-300",
                isActive ? "text-primary translate-x-1" : "text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0"
              )} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
