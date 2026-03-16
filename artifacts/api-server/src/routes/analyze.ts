import { Router, type IRouter } from "express";
import { exec } from "child_process";
import { promisify } from "util";
import { db, analysesTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import {
  RunAnalysisBody,
  GetAnalysisHistoryQueryParams,
  RunAnalysisResponse,
  GetAnalysisHistoryResponse,
} from "@workspace/api-zod";

const execAsync = promisify(exec);

const router: IRouter = Router();

const MODULE_MAP: Record<string, string[]> = {
  ip:      ["virustotal", "abuseipdb", "ip_to_geo", "isc_sans"],
  url:     ["virustotal", "urlscan"],
  email:   ["osint_indistries"],
  phone:   ["osint_indistries"],
  account: ["osint_indistries"],
  person:  ["osint_indistries"],
  eth:     ["osint_indistries"],
  btc:     ["osint_indistries"],
  trc:     ["osint_indistries"],
};

const PDF_PREFIX = "PDF_BASE64:";

async function runPythonModule(
  moduleName: string,
  target: string,
  analysisType: string
): Promise<{ module: string; status: string; output: string | null; error: string | null }> {
  try {
    const scriptPath = `/home/runner/workspace/python/${moduleName}.py`;
    const { stdout, stderr } = await execAsync(
      `python3 "${scriptPath}" "${target}" "${analysisType}"`,
      { timeout: 90000, maxBuffer: 50 * 1024 * 1024 }
    );
    const out = stdout.trim();
    return {
      module: moduleName,
      status: "success",
      output: out || null,
      error: stderr && stderr.trim() ? stderr.trim() : null,
    };
  } catch (err: unknown) {
    const error = err as { stdout?: string; stderr?: string; message?: string };
    const out = error.stdout ? error.stdout.trim() : "";
    if (out) {
      return {
        module: moduleName,
        status: "success",
        output: out,
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

router.get("/analyze/:id/pdf/:module", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const moduleName = Array.isArray(req.params.module) ? req.params.module[0] : req.params.module;
  const id = parseInt(rawId, 10);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [row] = await db
    .select()
    .from(analysesTable)
    .where(eq(analysesTable.id, id));

  if (!row) {
    res.status(404).json({ error: "Analysis not found" });
    return;
  }

  const mods = Array.isArray(row.modules) ? row.modules : [];
  const mod = mods.find((m: { module: string; output?: string | null }) => m.module === moduleName);

  if (!mod || !mod.output || !mod.output.startsWith(PDF_PREFIX)) {
    res.status(404).json({ error: "PDF not found for this module" });
    return;
  }

  const b64 = mod.output.slice(PDF_PREFIX.length);
  const pdfBuffer = Buffer.from(b64, "base64");

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="osint_${row.target}_${moduleName}.pdf"`);
  res.send(pdfBuffer);
});

export default router;
