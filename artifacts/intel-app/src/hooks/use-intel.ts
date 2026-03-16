import { useRunAnalysis, useGetAnalysisHistory, getGetAnalysisHistoryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AnalysisRequest } from "@workspace/api-client-react/src/generated/api.schemas";

export function useAnalysisOperations() {
  const queryClient = useQueryClient();

  const runAnalysisMutation = useRunAnalysis({
    mutation: {
      onSuccess: () => {
        // Invalidate history so the new run appears in the sidebar
        queryClient.invalidateQueries({ queryKey: getGetAnalysisHistoryQueryKey() });
      },
    },
  });

  const run = async (data: AnalysisRequest) => {
    return runAnalysisMutation.mutateAsync({ data });
  };

  return {
    run,
    isRunning: runAnalysisMutation.isPending,
    error: runAnalysisMutation.error,
  };
}

export function useHistoryList(limit = 15) {
  return useGetAnalysisHistory({ limit }, {
    query: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  });
}
