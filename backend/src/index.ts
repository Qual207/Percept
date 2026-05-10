import "dotenv/config";
import express from "express";
import cors from "cors";
import { intentHandler } from "./routes/intent.js";

const app = express();
const PORT = Number(process.env.PORT ?? 3001);
const ORIGIN = process.env.ALLOWED_ORIGIN ?? "http://localhost:5173";

// In dev we accept any localhost / 127.0.0.1 origin (Vite often falls back
// from 5173 → 5174 → 5175 when the port is busy, and we don't want CORS
// to silently break the demo). In production set ALLOWED_ORIGIN explicitly.
const corsOrigin = (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
  if (!origin) return cb(null, true); // server-to-server / curl
  if (origin === ORIGIN) return cb(null, true);
  try {
    const host = new URL(origin).hostname;
    if (host === "localhost" || host === "127.0.0.1") return cb(null, true);
  } catch { /* fall through */ }
  cb(new Error(`CORS: origin ${origin} not allowed`));
};
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: "256kb" }));

function hasOpenAIKey(): boolean {
  const k = process.env.OPENAI_API_KEY;
  return !!k && !k.startsWith("sk-...");
}

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    provider: "openai",
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    hasApiKey: hasOpenAIKey(),
  });
});

app.post("/api/intent", intentHandler);

app.listen(PORT, () => {
  console.log(`[backend] listening on http://localhost:${PORT}`);
  console.log(`[backend] CORS allowed origin: ${ORIGIN}`);
  if (hasOpenAIKey()) {
    console.log(
      `[backend] OpenAI ready — using model ${process.env.OPENAI_MODEL ?? "gpt-4o-mini"}.`,
    );
  } else {
    console.warn(
      "[backend] OPENAI_API_KEY not set — using keyword fallback parser.",
    );
  }
});
