# Getting Started

A linear, copy-paste-friendly guide to bring this project from "fresh clone" to "live demo on your laptop". If you skip steps you may break the demo path — read top to bottom the first time.

---

## Part 1 — What you need to do manually right now

Some of these you may have already done. Tick them off in order.

### 1. Confirm prerequisites

You need:

- **Node.js 20 or newer** — check with `node -v`. If you're on 18 or older, install 20 LTS from https://nodejs.org.
- **Google Chrome or Microsoft Edge** for the demo. Web Speech API does not work in Firefox. (The typed-input fallback works everywhere, so Firefox is OK for code-only verification.)
- **An OpenAI API key** that has credits and can call `gpt-4o-mini` (or whichever model you set in `OPENAI_MODEL`). Get one at https://platform.openai.com/api-keys.

### 2. Make sure the right env file exists with the right variable name

This is the most common gotcha right now because we just switched providers.

1. Open `backend/.env` in your editor.
2. The first line **must** be:

   ```
   OPENAI_API_KEY=sk-...your-actual-key...
   ```

   Not `ANTHROPIC_API_KEY` (that was the previous version of `.env.example`). If your file still says `ANTHROPIC_API_KEY=...`, just rename the variable to `OPENAI_API_KEY` and keep your value (assuming the value is your OpenAI key — if it was an Anthropic key, replace it with your OpenAI key).

3. Optional second line — pick a model. Default is `gpt-4o-mini` if omitted:

   ```
   OPENAI_MODEL=gpt-4o-mini
   ```

   Other supported choices: `gpt-4o`, `gpt-4o-2024-08-06`, `gpt-4.1-mini`, `gpt-4.1`. The model must support `response_format: json_schema` strict mode.

If `backend/.env` does not exist at all, create it by copying the example:

```powershell
copy backend\.env.example backend\.env
# then open backend\.env and paste your real key over the placeholder
```

### 3. Restart the backend so it picks up the env file

The backend was started before the env file existed (or with the old variable name), so it logged:

```
[backend] OPENAI_API_KEY not set — using keyword fallback parser.
```

To fix this you need to restart the backend dev server **after** the env file is correct. See Part 2 below for how to start/stop servers cleanly.

### 4. (Only if you cloned this on a different machine) install dependencies

If `node_modules/` doesn't exist in `frontend/`, `backend/`, or the root, run:

```powershell
# from the project root: c:\Users\jason\Coding\Building-Projects\ai-native
npm run install:all
```

This installs the root (concurrently), backend (express, openai SDK, vitest, tsx, etc.), and frontend (vite, react, tailwind, vitest, etc.) in one shot.

On the current machine, install has already completed — you can skip this step unless you nuked `node_modules`.

---

## Part 2 — How to run and test the project

### Daily run — both servers at once

From the project root:

```powershell
cd c:\Users\jason\Coding\Building-Projects\ai-native
npm run dev
```

This starts both processes via `concurrently`:

- Backend on `http://localhost:3001`
- Frontend on `http://localhost:5173`

Watch for these lines in the output to know it's healthy:

```
[backend] OpenAI ready — using model gpt-4o-mini.
  VITE v5.4.x  ready in 432 ms
  ➜  Local:   http://localhost:5173/
```

If you see `[backend] OPENAI_API_KEY not set — using keyword fallback parser.` instead, fix `backend/.env` (Part 1 step 2) and restart.

To stop everything, press `Ctrl+C` once in the terminal.

### Alternative: two terminals (more control, easier to read logs)

Terminal A (backend):

```powershell
cd c:\Users\jason\Coding\Building-Projects\ai-native\backend
npm run dev
```

Terminal B (frontend):

```powershell
cd c:\Users\jason\Coding\Building-Projects\ai-native\frontend
npm run dev
```

This is the recommended way for active development because you can read each log stream cleanly.

### Verify the backend is healthy

Open a new terminal and run:

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/health"
```

You should see:

```
ok        : True
provider  : openai
model     : gpt-4o-mini
hasApiKey : True            <-- this MUST be True for the OpenAI path
```

If `hasApiKey` is `False`, your `.env` is missing or has the wrong variable name. Fix Part 1 step 2 and restart the backend.

### Smoke-test the intent endpoint

```powershell
$body = '{"transcript":"this is too much, I cant focus","domSummary":["nav","main","aside-left"]}'
Invoke-RestMethod -Uri "http://localhost:3001/api/intent" -Method Post -ContentType "application/json" -Body $body
```

Expected response includes `source: llm` (when your key works) or `source: fallback` (when it doesn't). Both return a valid plan with 5–8 actions.

### Run the full test suite

```powershell
# from project root - runs both packages
npm test
```

Or one at a time:

```powershell
npm --prefix backend test     # 10 tests covering the keyword fallback parser
npm --prefix frontend test    # 10 tests covering the engine and frontend fallback
```

A green run is 20 tests passing total.

### Run the live demo in the browser

1. Make sure both servers are up (`npm run dev` from root).
2. Open http://localhost:5173 in **Chrome** or **Edge**.
3. The page loads as an aggressively chaotic Amazon-clone. The mic widget is in the bottom-right.
4. Click the mic button. Chrome will pop a microphone-permission dialog the first time — click **Allow**.
5. Say one of these phrases out loud:
   - "There's too much going on"
   - "I can't focus"
   - "Make the text bigger"
   - "Even simpler"
6. Within ~2 seconds, a toast appears at the top with the LLM's rationale, and the page transforms — sidebars dim, content centers, type scales up.
7. Click **Reset** in the mic widget to return to chaos and try a different phrase.
8. If the mic doesn't work or you're on Firefox, use the **type a request** input field — same code path, no microphone needed.

### Demo script (cheat sheet)

| Beat | Action | Expected |
|---|---|---|
| 0 | Page loads at http://localhost:5173 | Chaotic Amazon-clone, mic in bottom-right |
| 1 | "There's too much going on" | Sidebars dim, main centers, type scales up, spotlight on product |
| 2 | "Make the text even bigger" | Font scale increases further, layout from beat 1 preserved |
| 3 | Click **Reset** | Page returns to chaos exactly |
| 4 | "I can't focus" (alternative path) | Periphery dims, spotlight on main, structure mostly preserved |
| 5 | "Even simpler" | Most aggressive flatten — sidebars hidden, narrow column |

---

## Part 3 — Troubleshooting

### `[backend] OPENAI_API_KEY not set — using keyword fallback parser.`

Your `backend/.env` either does not exist, has the wrong variable name (`ANTHROPIC_API_KEY` from the old version), or contains the placeholder `sk-...`. See Part 1 step 2. After fixing, fully restart the backend (`Ctrl+C` then `npm run dev`).

### Backend won't start: `EADDRINUSE :::3001`

Another backend instance is already running. Find and kill it:

```powershell
Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object OwningProcess
Stop-Process -Id <pid-from-above> -Force
```

Or just close all your terminal windows and re-open — `tsx watch` cleans up its own child process when its parent dies.

### Frontend mic does nothing

- You must use Chrome or Edge over `http://localhost` (or HTTPS in production). Firefox is unsupported.
- You may have denied mic permission. Click the lock icon in the address bar → Site settings → Microphone → Allow.
- Try the typed-input field next to the mic — works in any browser.

### CORS error in the browser console

The backend's allowed origin must match the frontend's URL. Default is `http://localhost:5173`. If you changed Vite's port, update `ALLOWED_ORIGIN` in `backend/.env` and restart the backend.

### OpenAI returns 401 / 429

- 401 → your key is invalid or revoked. Generate a new one and update `backend/.env`.
- 429 → you've hit a rate or budget limit. Wait, or top up credits. The keyword fallback will keep the demo functional.

### `model 'gpt-4o-mini' does not exist or you do not have access`

Your account may not have access to that model. Try a different `OPENAI_MODEL` (e.g. `gpt-4o`) in `backend/.env`. The model must support `response_format: json_schema` in strict mode.

---

## Part 4 — Quick reference

| Thing | Path / Command |
|---|---|
| Project root | `c:\Users\jason\Coding\Building-Projects\ai-native` |
| Frontend URL | http://localhost:5173 |
| Backend URL | http://localhost:3001 |
| Backend health | http://localhost:3001/health |
| Env file | `backend/.env` (create from `backend/.env.example`) |
| Required env var | `OPENAI_API_KEY=sk-...` |
| Optional env var | `OPENAI_MODEL=gpt-4o-mini` (default) |
| Run both | `npm run dev` (from root) |
| Run backend only | `npm --prefix backend run dev` |
| Run frontend only | `npm --prefix frontend run dev` |
| Run all tests | `npm test` (from root) |
| Install everything | `npm run install:all` (from root, only after fresh clone) |
