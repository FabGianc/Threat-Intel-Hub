import { Router, type IRouter } from "express";
import { exec } from "child_process";
import { promisify } from "util";
import { db, analysesTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import {
  RunAnalysisBody,
  GetAnalysisHistoryQueryParams,
  RunAnalysisResponse,
  GetAnalysisHistoryResponse,
} from "@workspace/api-zod";

const execAsync = promisify(exec);

const router: IRouter = Router();

const MODULE_MAP: Record<string, string[]> = {
  ip: ["virustotal", "abuseipdb", "ip_to_geo", "isc_sans"],
  url: ["virustotal", "urlscan"],
  email: ["osint_indistries"],
  phone: ["osint_indistries"],
};

async function runPythonModule(
  moduleName: string,
  target: string,
  analysisType: string
): Promise<{ module: string; status: string; output: string | null; error: string | null }> {
  try {
    const scriptPath = `/home/runner/workspace/python/${moduleName}.py`;
    const { stdout, stderr } = await execAsync(
      `python3 "${scriptPath}" "${target}" "${analysisType}"`,
      { timeout: 60000 }
    );
    return {
      module: moduleName,
      status: "success",
      output: stdout || null,
      error: stderr && stderr.trim() ? stderr.trim() : null,
    };
  } catch (err: unknown) {
    const error = err as { stdout?: string; stderr?: string; message?: string };
    if (error.stdout && error.stdout.trim()) {
      return {
        module: moduleName,
        status: "success",
        output: error.stdout.trim(),
        error: null,
      };
    }
    return {
      module: moduleName,
      status: "error",
      output: null,
      error: (error.stderr || error.message || "Unknown error").trim(),
    };
  }
}

router.post("/analyze", async (req, res): Promise<void> => {
  const parsed = RunAnalysisBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { type, target } = parsed.data;
  const modules = MODULE_MAP[type];

  if (!modules || modules.length === 0) {
    res.status(400).json({ error: `Unknown analysis type: ${type}` });
    return;
  }

  const moduleResults = await Promise.all(
    modules.map((mod) => runPythonModule(mod, target, type))
  );

  const [saved] = await db
    .insert(analysesTable)
    .values({
      type,
      target,
      modules: moduleResults,
    })
    .returning();

  const result = RunAnalysisResponse.parse({
    id: saved.id,
    type: saved.type,
    target: saved.target,
    modules: saved.modules,
    createdAt: saved.createdAt,
  });

  res.json(result);
});

router.get("/analyze/history", async (req, res): Promise<void> => {
  const queryParams = GetAnalysisHistoryQueryParams.safeParse(req.query);
  const limit = queryParams.success && queryParams.data.limit ? queryParams.data.limit : 20;

  const rows = await db
    .select()
    .from(analysesTable)
    .orderBy(desc(analysesTable.createdAt))
    .limit(limit);

  const history = rows.map((row) => {
    const mods = Array.isArray(row.modules) ? row.modules : [];
    return {
      id: row.id,
      type: row.type,
      target: row.target,
      createdAt: row.createdAt,
      moduleCount: mods.length,
    };
  });

  const result = GetAnalysisHistoryResponse.parse(history);
  res.json(result);
});

export default router;
