# Resume Writer

Tailor your resume for **Workday ATS** using Gemini via OpenRouter. Paste a job description and the app rewrites your **Professional Summary** and **Experience bullets** to match keywords, then downloads a Workday-friendly `.docx`.

Runs fully in the browser — no backend required. Deploy to **Vercel** or run locally.

---

## Features

- ATS-optimized `.docx` export (single column, Arial, standard headings)
- Gemini-powered tailoring via OpenRouter
- Edit base resume once; only summary & bullets change per job
- Inline preview editing
- JD history, undo tailor, Ctrl+Enter shortcut
- Settings stored in browser (localStorage)

---

## Quick start (local)

```bash
npm install
npm run dev
```

Open **http://127.0.0.1:5173**

> Use `127.0.0.1` instead of `localhost` if you use Astrill VPN.

---

## Settings (required)

1. Click **Settings** in the header
2. Enter your **OpenRouter API key** ([get one at openrouter.ai](https://openrouter.ai/keys))
3. Set the **model name**, e.g.:
   - `google/gemini-2.0-flash-001` (default)
   - `google/gemini-2.5-flash-preview`
   - `google/gemini-flash-1.5`

Settings are saved in your browser only. The key is sent directly to OpenRouter — not to any other server.

---

## How to use

1. **Fill your base resume** — name, email, location, education, certs, company names, dates, skills
2. **Paste the job description**
3. Click **Generate ATS Resume** (or `Ctrl + Enter`)
4. Review the preview, edit inline if needed
5. Click **Download .docx** to save again

### What Gemini rewrites

| Rewritten per job | Kept fixed |
|-------------------|------------|
| Professional Summary | Name, email, phone, location |
| Experience bullet points | Education, certifications |
| | Job titles, company names, dates |
| | Skills (editable by you) |

---

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Use these settings:
   - **Framework:** Vite
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
4. Deploy — no environment variables needed on Vercel

Users add their own OpenRouter API key in the app **Settings** after opening the deployed URL.

---

## Project structure

```
src/
  components/     UI (editor, preview, settings, etc.)
  data/           Default resume template & localStorage helpers
  utils/          OpenRouter API, docx generation, settings
index.html
vite.config.js
vercel.json       SPA routing for Vercel
```

---

## ATS / Workday formatting

The exported `.docx` follows Workday parser rules:

- Single-column layout, no tables or graphics
- Standard headings: Professional Summary, Skills, Work Experience, Education, Certifications
- Plain-text contact info at the top
- Arial 11pt, dates as `Jan 2023 – Present`

Gemini is prompted to mirror JD keywords, quantify bullets, and use: **Action + Tool/Tech + Scope → Impact**.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `fetch failed` / API error | Check API key in Settings; ensure OpenRouter account has credits |
| App won't load with VPN | Open `http://127.0.0.1:5173` not `localhost` |
| Generate button disabled | Add API key in Settings; paste a longer job description (80+ chars) |
| Resume data lost | Data is in browser localStorage — don't clear site data |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |

---

## Privacy

- Resume data → browser `localStorage`
- API key → browser `localStorage`
- Job descriptions → sent to OpenRouter only when you click Generate
- No server-side storage
