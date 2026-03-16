import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CheckCircle2, AlertCircle, SkipForward, FileDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModuleResult } from "@workspace/api-client-react/src/generated/api.schemas";

const PDF_PREFIX = "PDF_BASE64:";

interface ModuleAccordionProps {
  module: ModuleResult;
  analysisId?: number;
  defaultOpen?: boolean;
}

export function ModuleAccordion({ module, analysisId, defaultOpen = false }: ModuleAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const isPdf = module.output?.startsWith(PDF_PREFIX) ?? false;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "success":
        return { icon: CheckCircle2, color: "text-success", bg: "bg-success/10", border: "border-success/30" };
      case "error":
        return { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30" };
      case "skipped":
      default:
        return { icon: SkipForward, color: "text-muted-foreground", bg: "bg-muted", border: "border-border" };
    }
  };

  const statusConfig = getStatusConfig(module.status);
  const StatusIcon = statusConfig.icon;

  const handleDownloadPdf = () => {
    if (!analysisId) return;
    const url = `/api/analyze/${analysisId}/pdf/${module.module}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = `osint_${module.module}.pdf`;
    a.click();
  };

  return (
    <div className={cn(
      "border rounded-xl overflow-hidden transition-colors duration-300 print-avoid-break print:border-gray-300 print:mb-4",
      isOpen ? "border-primary/30 shadow-lg shadow-primary/5" : "border-border bg-card/50"
    )}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-card hover:bg-muted/50 transition-colors print:bg-gray-100"
      >
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg print:hidden", statusConfig.bg)}>
            <StatusIcon className={cn("w-5 h-5", statusConfig.color)} />
          </div>
          <div className="text-left">
            <h4 className="font-display font-semibold text-lg text-foreground print:text-black">
              {module.module}
            </h4>
            <p className="text-xs text-muted-foreground uppercase tracking-wider print:hidden">
              STATUS: <span className={statusConfig.color}>{module.status}</span>
              {isPdf && <span className="ml-2 text-primary">• PDF Report</span>}
            </p>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-muted-foreground transition-transform duration-300 print:hidden",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className={cn(
              "p-4 border-t border-border bg-black/40 print:bg-white print:border-gray-200",
            )}>
              {module.status === "error" ? (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive print:text-red-700 print:bg-white print:border-red-300">
                  <p className="font-mono text-sm whitespace-pre-wrap">{module.error || "Unknown error occurred during analysis."}</p>
                </div>
              ) : isPdf ? (
                <div className="flex flex-col items-center gap-4 py-6">
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <FileDown className="w-10 h-10 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-foreground font-semibold mb-1">Report PDF disponibile</p>
                    <p className="text-muted-foreground text-sm">Il risultato di <span className="text-primary">{module.module}</span> è stato generato come documento PDF.</p>
                  </div>
                  <button
                    onClick={handleDownloadPdf}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
                  >
                    <FileDown className="w-5 h-5" />
                    Scarica PDF
                  </button>
                </div>
              ) : module.output ? (
                <pre className="font-mono text-sm text-foreground/90 whitespace-pre-wrap break-words overflow-x-auto p-4 rounded-lg bg-black/60 border border-border/50 print:bg-white print:text-black print:border-gray-300">
                  {module.output}
                </pre>
              ) : (
                <p className="text-muted-foreground italic text-sm">No output returned.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
