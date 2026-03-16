import { AnalysisResult } from "@workspace/api-client-react/src/generated/api.schemas";
import { ModuleAccordion } from "./module-accordion";
import { format } from "date-fns";
import { Printer, Shield, Activity, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface AnalysisResultViewProps {
  result: AnalysisResult;
}

export function AnalysisResultView({ result }: AnalysisResultViewProps) {
  const handlePrint = () => {
    window.print();
  };

  const successCount = result.modules.filter(m => m.status === 'success').length;
  const errorCount = result.modules.filter(m => m.status === 'error').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full space-y-6 mt-8 print:mt-0 print-block"
    >
      {/* Result Header */}
      <div className="bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-xl relative overflow-hidden print:border-gray-300 print:shadow-none print:bg-white print:text-black">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary print:hidden" />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 text-primary print:text-black">
              <Shield className="w-5 h-5" />
              <h2 className="text-sm font-bold uppercase tracking-widest">Intelligence Report</h2>
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground font-mono break-all print:text-black">
              {result.target}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground print:text-gray-600">
              <div className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-lg border border-border print:bg-white print:border-gray-200">
                <Activity className="w-4 h-4 text-secondary" />
                <span className="uppercase font-semibold text-foreground print:text-black">{result.type}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-lg border border-border print:bg-white print:border-gray-200">
                <Clock className="w-4 h-4 text-primary" />
                <span>{format(new Date(result.createdAt), "MMM d, yyyy • HH:mm:ss")}</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-1.5 print:hidden">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success"></span> {successCount} Success</span>
                {errorCount > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive"></span> {errorCount} Error</span>}
              </div>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="print-hidden shrink-0 flex items-center gap-2 px-6 py-3 bg-secondary/10 text-secondary border border-secondary/30 hover:bg-secondary hover:text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-secondary/25"
          >
            <Printer className="w-5 h-5" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-4">
        <h3 className="text-xl font-display font-semibold text-foreground px-2 print:text-black print:mb-4 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-secondary rounded-full inline-block print:hidden" />
          Module Execution Results
        </h3>

        <div className="grid gap-4 print:block">
          {result.modules.map((module, idx) => (
            <ModuleAccordion
              key={`${module.module}-${idx}`}
              module={module}
              analysisId={result.id}
              defaultOpen={module.status !== 'skipped'}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
