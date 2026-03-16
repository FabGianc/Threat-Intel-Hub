import { useState } from "react";
import { Layout } from "@/components/layout";
import { HistorySidebar } from "@/components/history-sidebar";
import { AnalysisForm } from "@/components/analysis-form";
import { AnalysisResultView } from "@/components/analysis-result";
import { useAnalysisOperations } from "@/hooks/use-intel";
import { AnalysisRequestType, AnalysisResult } from "@workspace/api-client-react/src/generated/api.schemas";
import { useToast } from "@/hooks/use-toast";
import { Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { toast } = useToast();
  const { run, isRunning } = useAnalysisOperations();
  
  const [activeResult, setActiveResult] = useState<AnalysisResult | null>(null);
  
  // State to push to form when clicking history
  const [formState, setFormState] = useState<{type?: AnalysisRequestType, target?: string}>({});

  const handleRunAnalysis = async (type: AnalysisRequestType, target: string) => {
    setActiveResult(null); // Clear previous
    setFormState({ type, target }); // Sync form
    
    try {
      const result = await run({ type, target });
      setActiveResult(result);
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${target}`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: err.message || "An unexpected error occurred while running the analysis.",
      });
    }
  };

  const handleHistorySelect = (type: AnalysisRequestType, target: string) => {
    // Automatically trigger a run when selecting from history
    handleRunAnalysis(type, target);
  };

  return (
    <Layout sidebar={<HistorySidebar onSelect={handleHistorySelect} activeTarget={formState.target} />}>
      <div className="space-y-8">
        
        {/* Header - Mobile only, since desktop has sidebar */}
        <div className="lg:hidden flex items-center gap-3 pb-4 border-b border-border print-hidden">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-foreground">Cyber OSINT</h1>
          </div>
        </div>

        <AnalysisForm 
          onSubmit={handleRunAnalysis} 
          isLoading={isRunning}
          externalType={formState.type}
          externalTarget={formState.target}
        />

        {activeResult && !isRunning && (
          <AnalysisResultView result={activeResult} />
        )}

        {!activeResult && !isRunning && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex flex-col items-center justify-center py-20 text-muted-foreground print-hidden relative"
          >
            {/* Using the image requested in requirements.yaml as a faint background decoration in the empty state */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none mix-blend-screen">
              <img 
                src={`${import.meta.env.BASE_URL}images/cyber-bg.png`} 
                alt="Cyber Background" 
                className="w-full h-full object-cover rounded-3xl blur-sm"
              />
            </div>
            <Activity className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-xl font-display font-semibold mb-2">Awaiting Target</h3>
            <p className="max-w-md text-center text-sm">
              Enter an IP, URL, Email, or Phone number above to aggregate intelligence from multiple sources.
            </p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
