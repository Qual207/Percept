# Getting Started

Everything you need to go from a fresh clone to a live, demoing app.

---

## System requirements

| Tool | Version | Check |
|---|---|---|
| Node.js | 20+ | `node -v` |
| npm | 10+ | `npm -v` |
| Browser | Chrome or Edge | Web Speech API (mic) won't work in Firefox) |

If you use **nvm**, run `nvm use` in the project root — `.nvmrc` pins Node 20 automatically.

See `requirements.txt` for the full system-level list.

---

## One-time setup (fresh clone)

Do this once after cloning. Skip any step you've already done.

### Step 1 — Install dependencies

```powershell
# from the project root
npm run install:all
```

This installs packages for all three locations: root, `backend/`, and `frontend/`.

### Step 2 — Create your env file

```powershell
copy backend\.env.example backend\.env
```

Then open `backend\.env` and replace `sk-...` with your real OpenAI API key:

```
OPENAI_API_KEY=sk-proj-...your-actual-key...
OPENAI_MODEL=gpt-4o-mini
```

The key must have credits and access to `gpt-4o-mini`. Get one at https://platform.openai.com/api-keys.

> **Without the key the demo still works** — a keyword-based fallback parser kicks in automatically. You just lose the smart LLM path.

### Step 3 — Verify the backend picks up the key

```powershell
# terminal 1: start the backend
cd backend
npm run dev
```

Look for this line in the output:

```
[backend] OpenAI ready — using model gpt-4o-mini.
```

If you see `OPENAI_API_KEY not set — using keyword fallback parser` instead, your `.env` is wrong or missing. Re-check Step 2.

---

## Running the project

### Option A — One command, both servers (recommended)

```powershell
# from the project root
npm run dev
```

Starts both servers in one terminal via `concurrently`. Press `Ctrl+C` to stop both.

### Option B — Two terminals (easier to read logs)

Terminal 1:

```powershell
cd backend
npm run dev
```

Terminal 2:

```powershell
cd frontend
npm run dev
```

### What should be running

| Server | URL | Healthy when… |
|---|---|---|
| Backend | http://localhost:3001 | Logs `OpenAI ready` or `using keyword fallback` |
| Frontend | http://localhost:5173 | Vite logs `ready in Xms` |

---

## Verifying everything works

### 1. Check the backend health endpoint

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/health"
```

Expected output:

```
ok        : True
provider  : openai
model     : gpt-4o-mini
hasApiKey : True        ← must be True for the LLM path
```

### 2. Smoke-test the intent endpoint

```powershell
$body = '{"transcript":"this is too much, I cant focus","domSummary":["nav","main","aside-left"]}'
Invoke-RestMethod -Uri "http://localhost:3001/api/intent" -Method Post -ContentType "application/json" -Body $body
```

Expected: a response with `source: llm` (if your key works) or `source: fallback`, plus 5–8 actions.

### 3. Run the full test suite

```powershell
# from the project root
npm test
```

Should show 20 tests passing (10 backend + 10 frontend). Zero failures means the engine and fallback parser are solid.

### 4. Open the demo in Chrome

Navigate to http://localhost:5173.

You should see a chaotic Amazon-clone page. The mic widget is in the bottom-right corner.

**First time only:** click the mic — Chrome will ask for microphone permission. Click **Allow**.

---

## Demo walkthrough

| Step | What you do | What you should see |
|---|---|---|
| 1 | Page loads | Chaotic Amazon-clone, mic widget bottom-right |
| 2 | Click mic → say "There's too much going on" | Toast: "Detected overload — simplifying layout". Sidebars dim, main content centers, type scales up |
| 3 | Say "Make the text even bigger" | Font scale increases. Previous layout changes preserved |
| 4 | Click **Reset** | Page snaps back to full chaos |
| 5 | Type "even simpler" in the text input | Same transformation, no mic needed — works in any browser |

---

## Troubleshooting

### `EADDRINUSE: address already in use :::3001`

Another backend instance is already running (common if you started it before and didn't kill it).

```powershell
# find and kill the process on port 3001
$proc = (Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue).OwningProcess
Stop-Process -Id $proc -Force
```

Then run `npm run dev` again.

### `[backend] OPENAI_API_KEY not set — using keyword fallback parser`

Your `backend\.env` is missing or the variable name is wrong. Make sure the file contains:

```
OPENAI_API_KEY=sk-proj-...
```

Not `ANTHROPIC_API_KEY` (old name from a previous version). Restart the backend after fixing.

### Mic does nothing / mic button is greyed out

- Web Speech API only works in **Chrome** or **Edge** over `localhost` or HTTPS.
- Firefox is not supported. Use the typed-input field as a fallback.
- If you accidentally denied mic permission: click the lock icon in Chrome's address bar → Site settings → Microphone → Allow → reload the page.

### OpenAI returns 401

Your API key is invalid or revoked. Generate a new one and update `backend\.env`.

### OpenAI returns 429

Rate limit or out of credits. Top up at https://platform.openai.com/settings/billing. The keyword fallback will keep the demo functional while you do.

### CORS error in the browser console

The frontend URL and `ALLOWED_ORIGIN` in `backend\.env` must match. Default is `http://localhost:5173`. If Vite is on a different port, update `ALLOWED_ORIGIN` in `backend\.env` and restart the backend.

---

## Quick reference

| Task | Command (from project root) |
|---|---|
| Install everything (first time) | `npm run install:all` |
| Start both servers | `npm run dev` |
| Start backend only | `npm --prefix backend run dev` |
| Start frontend only | `npm --prefix frontend run dev` |
| Run all tests | `npm test` |
| Run backend tests only | `npm --prefix backend test` |
| Run frontend tests only | `npm --prefix frontend test` |
| Kill whatever is on :3001 | `Stop-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess -Force` |

| URL | What |
|---|---|
| http://localhost:5173 | The demo (open in Chrome) |
| http://localhost:3001/health | Backend health check |
| http://localhost:3001/api/intent | Intent endpoint (POST) |
