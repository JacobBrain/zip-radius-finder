## Product Requirements Doc (PRD): ZIP Radius Finder (ZipCodeAPI)

### 1) Objective
Build a lightweight web app that lets a user:
1) Enter a **center ZIP code** (US)
2) Enter a **radius** (miles)
3) Click **Search** (or press Enter)
4) View and copy a **deduplicated list of ZIP codes** within that radius, returned by **ZipCodeAPI**.

Primary goal: quickly define and validate **sales territory areas** (radius-based) by generating the ZIPs that fall within a given distance of a center ZIP.

---

### 2) Users & Use Cases
**Primary users:** internal team members (sales leadership, ops, account coverage owners) who need territory definitions without using terminal tools.

**Use cases**
- Define a rep’s territory as “ZIP X + Y miles” and get the ZIP set.
- Adjust radius and re-run to balance coverage.
- Copy ZIP list into CRM/territory tools/spreadsheets.

---

### 3) Scope
#### In scope (MVP)
- Single-page web app (hosted) with simple inputs and results
- Inputs: ZIP, radius (miles)
- Output: ZIP list (newline-delimited) with one-click copy
- Basic validation + clear errors
- Uses ZipCodeAPI “radius” endpoint
- API key kept server-side (never exposed in browser)

#### Out of scope (MVP)
- Authentication / accounts
- Territory saving/versioning/history
- International postal codes
- Map visualization

---

### 4) Non-Goals
- Perfect USPS polygon precision (accept ZipCodeAPI’s implementation of “within radius”)
- Complex territory logic (multi-center, drive-time, polygons) in MVP

---

### 5) Functional Requirements

#### 5.1 UI / UX
**Page layout**
- Title: “ZIP Radius Finder”
- Input row:
  - Center ZIP (text input)
  - Radius (number input)
  - Units label fixed to “miles”
- Buttons:
  - “Search”
  - “Copy ZIP List”
  - “Clear”
- Output area:
  - Read-only textarea showing ZIPs newline-delimited
  - Summary line above output:
    - “N ZIP codes found”
    - “Center: 21701 • Radius: 15 miles”
- Error banner area (inline, above output)

**Keyboard behavior**
- Enter triggers Search when cursor is in either input.

**Loading behavior**
- Disable Search while request is in-flight
- Show small loading indicator

#### 5.2 Validation (client-side)
- ZIP must be exactly 5 digits (allow leading zeros)
- Radius must be numeric, > 0
- Radius max: cap at a reasonable limit (e.g., **200 miles**) to prevent huge results; show a message if exceeded
- If invalid: prevent API call and show error

#### 5.3 Server/API behavior
- Browser calls hosted backend endpoint: `POST /api/radius`
  - Body: `{ zip: "21701", radius: 15, units: "miles" }`
- Server calls ZipCodeAPI with secret key stored in environment variable
- Server returns:
  - `{ zipCodes: ["21701","21702",...], meta: { count, centerZip, radius, units } }`

#### 5.4 Output normalization
- ZIPs must be:
  - string type
  - 5 chars with leading zeros preserved
  - deduplicated
  - sorted ascending

#### 5.5 Copy behavior
- “Copy ZIP List” copies exactly the newline-delimited ZIP list
- After copy: show “Copied” toast/message for ~1–2 seconds

---

### 6) ZipCodeAPI Integration Requirements

#### 6.1 API key handling
- API key must NEVER be shipped to browser JS
- Store in environment variable `ZIPCODEAPI_KEY`
- On Vercel, set as a Project Environment Variable

#### 6.2 Endpoint
- Use ZipCodeAPI “radius” endpoint for ZIP + distance in **miles**
- Units locked to miles for MVP

#### 6.3 Rate limiting / errors
- If ZipCodeAPI returns rate-limit (429) or auth error (401/403), show user-friendly error:
  - “API limit reached. Try again later.”
  - “API key invalid or missing.”
- For network failures: “Network error calling ZIP service.”

---

### 7) Deployment Requirements (Vercel)

#### 7.1 Hosting target
- Deploy on **Vercel** so users can access via a live link.

#### 7.2 Architecture requirement
- Use **Vercel Serverless Functions** (or Next.js API routes) as a proxy so the API key remains server-side.
- The frontend must call the app’s own `/api/radius` endpoint (same origin).

#### 7.3 Environment variables
- Configure in Vercel:
  - `ZIPCODEAPI_KEY` (required)

#### 7.4 Deliverables
- Public URL after deploy (for internal sharing)
- Repo ready to import into Vercel

---

### 8) Technical Requirements (Implementation Constraints)

#### 8.1 Suggested stack (opt for simplest on Vercel)
**Option A (recommended): Next.js**
- Next.js app router or pages router
- API route: `/api/radius`
- Single page UI

**Option B: Vite + Vercel functions**
- Static frontend
- `/api/radius` implemented as Vercel serverless function

Pick whichever is fastest for Claude Code to implement reliably.

#### 8.2 Repo / file structure (Next.js recommended)
```
zip-radius-finder/
  README.md
  package.json
  .env.example
  .gitignore
  app/
    page.tsx (or page.jsx)
  app/api/radius/route.ts (or route.js)
  lib/
    zipcodeapi.ts (or zipcodeapi.js)
```

---

### 9) User Stories & Acceptance Criteria

#### Story 1: Find ZIPs in radius
- Given I enter a valid ZIP and radius and click Search
- When the API succeeds
- Then I see a sorted list of ZIPs in the output box and “N ZIP codes found”

**Acceptance criteria**
- ZIP validation blocks bad input (non-5-digit)
- Radius validation blocks 0/negative/non-numeric
- Output is newline list, sorted, deduped

#### Story 2: Copy results
- Given results are displayed
- When I click Copy
- Then the ZIP list is copied to clipboard exactly as shown

**Acceptance criteria**
- Clipboard contains newline-separated ZIPs only
- Confirmation message appears

#### Story 3: Handle failures cleanly
- Given the API key is missing or rate-limited
- When I run a search
- Then I see a clear error message and no crash

---

### 10) API Limitations Notice (In-App)

#### 10.1 Purpose
Display a visible notice in the app so users understand the usage constraints of the free ZipCodeAPI tier before they hit rate limits unexpectedly.

#### 10.2 Free Tier Limits (ZipCodeAPI)
| Metric | Limit |
|--------|-------|
| Requests per hour | 10 |
| Requests per day | 240 |
| Supported regions | US ZIP codes only (MVP) |

#### 10.3 UI Placement
- Display a small info box or footer note on the main page
- Should be visible but not intrusive (muted styling)

#### 10.4 Suggested Copy
> **API Limits (Free Tier):** 10 requests/hour • 240 requests/day
> Limit resets hourly. If you hit the limit, wait and try again.

#### 10.5 Optional Enhancement
- Track request count locally (localStorage) and show "~X requests remaining this hour" as a soft estimate
- This is a nice-to-have, not required for MVP

---

### 11) Error Messages (exact text suggestions)
- Invalid ZIP: "Enter a valid 5-digit ZIP code."
- Invalid radius: "Enter a radius greater than 0."
- Radius too large: "Radius too large for this tool (max: 200 miles)."
- Missing API key: "Server not configured: ZIPCODEAPI_KEY missing."
- Rate limit: "ZIP service rate limit reached. Try again later."
- Generic: "Couldn't fetch ZIP codes. Try again."

---

### 12) README Requirements
Include:
- Prereqs: Node 18+ (or 20+)
- Local dev:
  1) `cp .env.example .env.local`
  2) Set `ZIPCODEAPI_KEY=...`
  3) `npm install`
  4) `npm run dev`
- Vercel deploy:
  - Import repo into Vercel
  - Set `ZIPCODEAPI_KEY` in Project Settings → Environment Variables
  - Deploy

---

### 13) Test Plan (lightweight)
Manual checks:
- ZIP=90210 radius=5 → returns non-empty list
- ZIP with leading zero (e.g., 02108) preserved
- radius=0, -1, “abc” blocked
- missing API key shows correct error
- copy button copies just ZIP lines

---

### 14) Claude Code Build Instructions (paste this directly)
**Task:** Create a small web app deployed on Vercel that takes a ZIP + radius (miles) and returns a list of ZIPs within that radius using ZipCodeAPI.

**Hard requirements:**
- Host on Vercel; produce a shareable live URL.
- Do NOT expose the ZipCodeAPI key in the browser.
- Implement `/api/radius` as a server-side endpoint (Next.js API route or Vercel function).
- Frontend: single page with inputs (zip, radius), Search button, Copy button, Clear button, output textarea, error banner.
- Validate inputs client-side; also validate on server.
- Return JSON `{ zipCodes: string[], meta: { count, centerZip, radius, units } }`.
- Normalize ZIP list: 5-digit strings, dedupe, sort.
- Add `.env.example`, `.gitignore`, and README with local dev + Vercel deploy steps.

**Implementation preference:**
- Use Next.js for easiest Vercel deployment. Keep styling minimal (plain CSS or simple utility classes).

**Done when:**
- Running locally works (`npm run dev`).
- Deploy to Vercel works with `ZIPCODEAPI_KEY` configured.
- User can enter ZIP/radius, press Enter, see results, and copy ZIP list.

