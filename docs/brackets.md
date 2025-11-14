### Music Bracket Tournament — Product and Technical Requirements

## 1) Overview

- **Goal**: Weekly 32-seed music bracket where users vote on head-to-head matchups until a champion is crowned. Bracket goes live on Monday, ends Friday at midnight. 24 hours per round.
- **Navigation**: New side-menu section “Brackets” with two tiles:
  - **LIVE BRACKET**: Current week’s bracket, voting enabled for the current round.
  - **BRACKET GALLERY**: Past brackets with final trees and results.

## 2) Terminology

- **Bracket**: A weekly tournament anchored to an `anchor_sunday` (the Sunday starting that week).
- **Round**: Stage in the tournament (R1→R5 for a 32-seed bracket). There are 5 rounds.
- **Matchup**: One head-to-head between two bracket items at a given `round` and `index_in_round`.
- **Vote**: A selection of one item in a matchup. Exactly one vote per matchup per user/session.

## 3) User Stories

- As a visitor (auth or anon), I can open “LIVE BRACKET” and vote once on each current-round matchup.
- As a visitor, I see a countdown to round end at midnight EST and see which matchups I’ve already voted on.
- As a visitor, while the round is live I see who is winning via percentage (not raw totals). After the round ends, I can see exact totals.
- As a visitor, I can browse prior weeks in “BRACKET GALLERY” and view full results and winners.
- As an admin, I can create a weekly bracket, seed items (1–32) with images and optional audio previews, and kick off R1.

## 4) Navigation & IA

- Side Menu:
  - “Brackets”
    - “LIVE BRACKET”
    - “BRACKET GALLERY”
- LIVE BRACKET:
  - Header: bracket title, week (derived from `anchor_sunday`), current round label, countdown to midnight EST.
  - Content: list/grid of current-round matchups; each shows two items with image, label, optional audio preview, and vote UI.
- BRACKET GALLERY:
  - List of prior brackets (descending by `anchor_sunday`), each tile shows title, champion, total votes.
  - Detail page shows final tree, per-round results, and per-matchup totals.

## 5) Voting UX

- Interaction: Click/tap on one of the two items to cast a vote.
- Constraints: 1 vote per matchup per authenticated user, or per anon session via `session_id` cookie. No vote changes once submitted.
- State:
  - Before vote: both choices enabled.
  - After vote: chosen item highlighted; further changes are not allowed.
- Audio: Each item may include an optional audio preview (play/pause; ensure only one preview plays at a time).
- Feedback: Optimistic UI; show success state. On conflict (already voted), show a friendly “You’ve already voted on this matchup.” message.

## 6) Time and Rounds (EST)

- Timezone: All bracket scheduling is in Eastern Time (EST/EDT as applicable). Rollover times occur at local midnight in America/New_York.
- Structure (32 seeds → 5 rounds):
  - R1: 16 matchups (Monday)
  - R2: 8 matchups (Tu)
  - R3: 4 matchups (Wed)
  - R4: 2 matchups (Thu)
  - R5: 1 matchup (final/fri)
- Schedule:
  - Start: R1 opens at `anchor_sunday 00:00` America/New_York.
  - Rollover: New round begins at local midnight each day; previous round is locked.
  - End: Champion determined at R5 lock; bracket enters gallery-only state.

## 7) Seeding, Pairings, and Winners

- Seeds: Integers `1..32`, unique per bracket.
- R1 pairings: Deterministic standard 32-seed layout (e.g., 1–32, 16–17, 8–25, 9–24, 4–29, 13–20, 5–28, 12–21, 2–31, 15–18, 7–26, 10–23, 3–30, 14–19, 6–27, 11–22).
- Subsequent rounds: Each `index_in_round` derives its participants from prior-round winners. No separate persistence; compute on the fly from votes.
- Ties: Higher seed advances by default. Admin may override via backoffice if needed.

## 8) Database Schema (Given)

```sql
-- 1) Weekly bracket (Sunday anchor)
create table if not exists public.brackets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  anchor_sunday date not null,
  slug text unique,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (anchor_sunday)
);

-- 2) Items (seed + optional audio preview)
create table if not exists public.bracket_items (
  id uuid primary key default gen_random_uuid(),
  bracket_id uuid not null references public.brackets(id) on delete cascade,
  seed int2 not null check (seed between 1 and 32),
  label text not null,
  image_url text,
  audio_url text,                           -- NEW: nullable audio preview
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (bracket_id, seed)
);

-- 3) Matchups: just round + index (we derive everything else)
-- You’ll create 31 rows per bracket:
-- R1: 16 rows, R2: 8, R3: 4, R4: 2, R5: 1
create table if not exists public.matchups (
  id uuid primary key default gen_random_uuid(),
  bracket_id uuid not null references public.brackets(id) on delete cascade,
  round int2 not null check (round between 1 and 5),
  index_in_round int2 not null,
  created_at timestamptz not null default now(),
  unique (bracket_id, round, index_in_round)
);

create index if not exists matchups_byr on public.matchups (bracket_id, round);

-- 4) Votes (auth or anon)
create table if not exists public.votes (
  id bigserial primary key,
  bracket_id uuid not null references public.brackets(id) on delete cascade,
  matchup_id uuid not null references public.matchups(id) on delete cascade,
  chosen_item_id uuid not null references public.bracket_items(id) on delete cascade,
  user_id uuid references auth.users(id),    -- nullable (authed)
  session_id text,                           -- nullable (anon cookie/UUID)
  created_at timestamptz not null default now()
);

create unique index if not exists vot_uq_user on public.votes (matchup_id, user_id) where user_id is not null;
create unique index if not exists vot_uq_sess on public.votes (matchup_id, session_id) where session_id is not null;
create index if not exists vot_by_matchup on public.votes (matchup_id);
create index if not exists vot_by_bracket_time on public.votes (bracket_id, created_at);
```

## 9) Row-Level Security (RLS) — Implemented

```sql
alter table public.brackets      enable row level security;
alter table public.bracket_items enable row level security;
alter table public.matchups      enable row level security;
alter table public.votes         enable row level security;

create policy "public read brackets" on public.brackets      for select using (true);
create policy "public read items"    on public.bracket_items for select using (true);
create policy "public read matchups" on public.matchups      for select using (true);

create policy "insert votes" on public.votes for insert with check (true);
create policy "read votes"   on public.votes for select using (true);
```

Notes:

- Public SELECT is allowed on all four tables, including `votes`. Client should still prefer aggregate endpoints/views for efficient reads.
- Insert to `votes` is broadly allowed; uniqueness constraints enforce one vote per matchup per user/session.

## 10) API Contracts

- GET `/api/brackets/current`
  - Returns the current bracket (by date vs `anchor_sunday` in America/New_York), current round number, and countdown to midnight EST/EDT.
- GET `/api/brackets/:slug`
  - Returns bracket metadata, items, seeded layout, current round, and whether voting is open.
- GET `/api/brackets/:id/round/:round`
  - Returns matchups for a round with derived item pairs and current aggregates.
  - While round is live: include per-matchup percentage only (hide raw totals).
  - After round lock: include exact totals.
- POST `/api/brackets/:id/matchups/:matchup_id/vote`
  - Body: `{ chosen_item_id }`. Identify user via auth or `session_id` cookie.
  - Idempotency: If unique constraint is violated, return 409 with a friendly error. No changes to prior votes.
  - Response: updated aggregate for that matchup.
- GET `/api/brackets/:id/results`
  - Full tree with per-matchup totals, winners, and champion.

Aggregation Strategy:

- Compute winners and aggregates on demand (“on the fly”) using `votes` counts per matchup and tie-break policy.
- No persisted `winner_item_id` required; next-round participants are derived from prior-round winners.

## 11) Round Rollover

- Trigger: Nightly at 00:00 America/New_York.
- Steps:
  - Lock the previous round (no further writes are accepted due to time-based checks in the API layer).
  - Next round becomes active immediately at midnight.
  - Winners are computed on demand from stored votes; next-round participants are resolved dynamically.

Implementation Options:

- Supabase Scheduled Function or server cron aligned to America/New_York midnight.

## 12) Live Bracket UI Details

- Matchup Card:
  - Image, label, optional audio preview.
  - Vote button/select on each item; immediate submit; disable further input for that matchup after success.
  - During live round: show winning percentage bars only (sum to 100%).
  - After round ends: show exact totals alongside percentages.
- Header:
  - “Round X of 5”, progress bar, countdown to local midnight (America/New_York), total votes for round (optional).
- Persistence:
  - Store anon `session_id` in cookie (UUIDv4) with ~2 week expiry.

## 13) Gallery UI Details

- List View: Cards with title, `anchor_sunday`, champion label/image.
- Detail View: Full bracket tree; per-matchup scores; winners highlighted. No voting.

## 14) Anti-abuse, Performance, Observability

- Anti-abuse:
  - Uniqueness constraints enforce 1 vote per matchup per user/session.
  - Optionally rate-limit vote endpoint per IP/session and add basic bot challenges under anomalous activity.
- Performance:
  - Cache read endpoints 10–60s; on vote, refresh cache for that matchup.
  - Indexes provided are sufficient for typical volumes. Consider composite indexes for analytics as needed.
- Observability:
  - Log vote errors, API latency, and nightly rollover execution.
  - Metrics: votes per matchup/round, conversion (view→vote), seed upset frequency.

## 15) Edge Cases and Policies

- Ties: Higher seed advances.
- Zero-vote matchups: Higher seed advances.
- Duplicate/late votes: Reject with clear message. During live round, a second attempt returns 409 “already voted.” After lock, return 403/410.
- Vote edits: Not allowed. No update route.

## 16) Acceptance Criteria

- Side menu shows “Brackets” with tiles “LIVE BRACKET” and “BRACKET GALLERY”.
- LIVE BRACKET displays active round with percentage-only visuals during the round, and totals after the round ends.
- One vote per matchup per user/session enforced at DB-level and API-level, with friendly error on conflicts.
- Midnight rollover uses America/New_York timezone. Rounds progress daily, and results are visible the next day.
- Gallery shows prior brackets, final bracket tree, and winners.
