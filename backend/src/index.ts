import "dotenv/config";
import express from "express";
import cors from "cors";
import { intentHandler } from "./routes/intent.js";

const app = express();
const PORT = Number(process.env.PORT ?? 3001);
const ORIGIN = process.env.ALLOWED_ORIGIN ?? "http://localhost:5173";

app.use(cors({ origin: ORIGIN }));
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
