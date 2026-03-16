import { useState, useEffect } from "react";
import { Globe, Link as LinkIcon, Mail, Phone, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnalysisRequestType } from "@workspace/api-client-react/src/generated/api.schemas";

const ANALYSIS_TYPES = [
  { id: "ip", label: "IP Address", icon: Globe, modules: ["VirusTotal", "AbuseIPDB", "IPinfo", "ISC SANS"] },
  { id: "url", label: "URL / Domain", icon: LinkIcon, modules: ["VirusTotal", "URLScan.io"] },
  { id: "email", label: "Email Address", icon: Mail, modules: ["osint.industries"] },
  { id: "phone", label: "Phone Number", icon: Phone, modules: ["osint.industries"] },
] as const;

interface AnalysisFormProps {
  onSubmit: (type: AnalysisRequestType, target: string) => void;
  isLoading: boolean;
  externalType?: AnalysisRequestType;
  externalTarget?: string;
}

export function AnalysisForm({ onSubmit, isLoading, externalType, externalTarget }: AnalysisFormProps) {
  const [selectedType, setSelectedType] = useState<AnalysisRequestType>("ip");
  const [target, setTarget] = useState("");

  // Sync with external state when history item is clicked
  useEffect(() => {
    if (externalType) setSelectedType(externalType);
    if (externalTarget) setTarget(externalTarget);
  }, [externalType, externalTarget]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!target.trim() || isLoading) return;
    onSubmit(selectedType, target.trim());
  };

  const activeModules = ANALYSIS_TYPES.find(t => t.id === selectedType)?.modules || [];

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-8 bg-card/40 border border-border/50 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-2xl relative overflow-hidden print-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 space-y-4">
        <h2 className="text-xl font-display font-semibold text-foreground flex items-center gap-2">
          <span className="w-1.5 h-6 bg-primary rounded-full inline-block" />
          Select Analysis Target
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ANALYSIS_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setSelectedType(type.id as AnalysisRequestType)}
                className={cn(
                  "flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-300 group",
                  isSelected 
                    ? "border-primary bg-primary/10 glow-primary text-primary" 
                    : "border-border bg-background/50 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-foreground"
                )}
              >
                <Icon className={cn("w-8 h-8 mb-3 transition-transform duration-300", isSelected ? "scale-110" : "group-hover:scale-110")} />
                <span className="font-semibold text-sm">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder={`Enter ${ANALYSIS_TYPES.find(t => t.id === selectedType)?.label.toLowerCase()}...`}
              className="block w-full pl-12 pr-4 py-4 bg-black/40 border-2 border-border rounded-xl text-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-mono"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !target.trim()}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-display font-bold text-lg rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <Search className="w-6 h-6" />
                <span>Analyze</span>
              </>
            )}
          </button>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Active Modules:</span>
          {activeModules.map(mod => (
            <span key={mod} className="px-2.5 py-1 rounded-md bg-secondary/10 text-secondary border border-secondary/20 text-xs font-mono">
              {mod}
            </span>
          ))}
        </div>
      </div>
    </form>
  );
}
