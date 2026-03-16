import { useState, useEffect } from "react";
import { Globe, Link as LinkIcon, Mail, Phone, User, UserSearch, Coins, Bitcoin, Wallet, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnalysisRequestType } from "@workspace/api-client-react/src/generated/api.schemas";

const ANALYSIS_TYPES = [
  {
    id: "ip",
    label: "IP Address",
    icon: Globe,
    placeholder: "es. 8.8.8.8",
    modules: ["VirusTotal", "AbuseIPDB", "IPinfo", "ISC SANS"],
    group: "network",
  },
  {
    id: "url",
    label: "URL / Domain",
    icon: LinkIcon,
    placeholder: "es. example.com",
    modules: ["VirusTotal", "URLScan.io"],
    group: "network",
  },
  {
    id: "email",
    label: "Email",
    icon: Mail,
    placeholder: "es. target@email.com",
    modules: ["osint.industries"],
    group: "osint",
  },
  {
    id: "phone",
    label: "Telefono",
    icon: Phone,
    placeholder: "es. +39 333 1234567",
    modules: ["osint.industries"],
    group: "osint",
  },
  {
    id: "account",
    label: "Account",
    icon: User,
    placeholder: "es. username / handle",
    modules: ["osint.industries"],
    group: "osint",
  },
  {
    id: "person",
    label: "Persona",
    icon: UserSearch,
    placeholder: "es. Mario Rossi",
    modules: ["osint.industries"],
    group: "osint",
  },
  {
    id: "eth",
    label: "ETH Wallet",
    icon: Coins,
    placeholder: "es. 0x742d35Cc6634C05...",
    modules: ["osint.industries"],
    group: "crypto",
  },
  {
    id: "btc",
    label: "BTC Wallet",
    icon: Bitcoin,
    placeholder: "es. 1A1zP1eP5QGefi2D...",
    modules: ["osint.industries"],
    group: "crypto",
  },
  {
    id: "trc",
    label: "TRC Wallet",
    icon: Wallet,
    placeholder: "es. TN3W4xxxx...",
    modules: ["osint.industries"],
    group: "crypto",
  },
] as const;

const GROUP_LABELS: Record<string, string> = {
  network: "Network",
  osint: "Identity",
  crypto: "Crypto",
};

const GROUP_COLORS: Record<string, string> = {
  network: "text-blue-400",
  osint: "text-cyan-400",
  crypto: "text-yellow-400",
};

interface AnalysisFormProps {
  onSubmit: (type: AnalysisRequestType, target: string) => void;
  isLoading: boolean;
  externalType?: AnalysisRequestType;
  externalTarget?: string;
}

export function AnalysisForm({ onSubmit, isLoading, externalType, externalTarget }: AnalysisFormProps) {
  const [selectedType, setSelectedType] = useState<AnalysisRequestType>("ip");
  const [target, setTarget] = useState("");

  useEffect(() => {
    if (externalType) setSelectedType(externalType);
    if (externalTarget) setTarget(externalTarget);
  }, [externalType, externalTarget]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!target.trim() || isLoading) return;
    onSubmit(selectedType, target.trim());
  };

  const activeType = ANALYSIS_TYPES.find(t => t.id === selectedType);
  const activeModules = activeType?.modules || [];
  const activePlaceholder = activeType?.placeholder || "";

  const groups = ["network", "osint", "crypto"] as const;

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6 bg-card/40 border border-border/50 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-2xl relative overflow-hidden print-hidden">

      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 space-y-5">
        <h2 className="text-xl font-display font-semibold text-foreground flex items-center gap-2">
          <span className="w-1.5 h-6 bg-primary rounded-full inline-block" />
          Select Analysis Target
        </h2>

        {groups.map((group) => {
          const types = ANALYSIS_TYPES.filter(t => t.group === group);
          return (
            <div key={group} className="space-y-2">
              <p className={cn("text-xs font-bold uppercase tracking-widest", GROUP_COLORS[group])}>
                {GROUP_LABELS[group]}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {types.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => { setSelectedType(type.id as AnalysisRequestType); setTarget(""); }}
                      className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 group",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background/50 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-foreground"
                      )}
                    >
                      <Icon className={cn("w-6 h-6 mb-2 transition-transform duration-300", isSelected ? "scale-110" : "group-hover:scale-110")} />
                      <span className="font-semibold text-xs text-center leading-tight">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
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
              placeholder={activePlaceholder}
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

        <div className="flex flex-wrap items-center gap-2 pt-1">
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
