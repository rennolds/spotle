// bracketHelpers.js
// Client-side helpers for Spotle Brackets (DB-driven participants + tallies)
// Assumes the following views & functions exist server-side:
//   - participants (matchups -> item1_id/item2_id/winner_item_id)
//   - tallies_live  (matchup_id -> votes_1, votes_2, percent1_bp, updated_at)
//   - results_final (matchup_id -> final_votes_1/2, winner_item_id)

import moment from 'moment-timezone';

/** ---------- Time helpers (America/Detroit) ---------- **/

const TZ = 'America/Detroit';

/** Return today's anchor Sunday (the Sunday of the current M–F bracket week). */
export function getAnchorSunday(now = moment.tz(TZ)) {
  // If it's Sunday, anchor is *this* Sunday; Mon–Sat use the previous Sunday.
  // (You previously pulled "last week's" on Sundays; switching to "this Sunday"
  // makes lookups unambiguous & matches prebuilt schedules.)
  const dow = now.day(); // Sun=0
  const anchor = now.clone().startOf('day').subtract(dow, 'days'); // go back to Sunday
  return anchor.format('YYYY-MM-DD');
}

/** Return next week's anchor Sunday (for “upcoming”/Sunday results page). */
export function getUpcomingAnchorSunday(now = moment.tz(TZ)) {
  const thisSunday = moment.tz(TZ).startOf('day').subtract(now.day(), 'days');
  return thisSunday.add(7, 'days').format('YYYY-MM-DD');
}

/** Round by weekday: Mon..Fri -> 1..5, Sat/Sun -> 6 (results mode). */
export function getCurrentRound(now = moment.tz(TZ)) {
  const d = now.day(); // Sun=0 .. Sat=6
  if (d >= 1 && d <= 5) return d;
  return 6; // weekend results
}

/** ---------- Bracket fetchers ---------- **/

/** Get the current live bracket (by anchor_sunday). */
export async function getCurrentBracket(supabase, now = moment.tz(TZ)) {
  const anchorSunday = getAnchorSunday(now);
  const { data, error } = await supabase
    .from('brackets')
    .select('*')
    .eq('anchor_sunday', anchorSunday)
    .single();

  // Treat “not found” as null (PGRST116 = no rows)
  if (error && error.code !== 'PGRST116') {
    console.error('getCurrentBracket error:', error);
    throw error;
  }
  return data ?? null;
}

/** Get the upcoming bracket (next week’s anchor_sunday). */
export async function getUpcomingBracket(supabase, now = moment.tz(TZ)) {
  const anchorSunday = getUpcomingAnchorSunday(now);
  const { data, error } = await supabase
    .from('brackets')
    .select('*')
    .eq('anchor_sunday', anchorSunday)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('getUpcomingBracket error:', error);
    throw error;
  }
  return data ?? null;
}

/** ---------- Round payload (client-friendly) ---------- **/

/**
 * Return a client-ready payload for a specific bracket+round.
 * - Reads participants (item ids + winner)
 * - Reads all items once (map by id)
 * - Reads tallies_live for those matchups (percent basis points)
 * - Builds { item1, item2, percents, updated_at, winnerId } per matchup
 */
export async function getBracketRound(supabase, bracketId, round) {
  // 1) Fetch matchups for the round
  const { data: matchupsData, error: pErr } = await supabase
    .from('matchups')
    .select('id, bracket_id, round, index_in_round, item1_id, item2_id, winner_item_id')
    .eq('bracket_id', bracketId)
    .eq('round', round)
    .order('index_in_round', { ascending: true });

  if (pErr) throw new Error(`matchups: ${pErr.message}`);
  if (!matchupsData || matchupsData.length === 0) {
    return { matchups: [], items: {}, updatedAt: null };
  }
  
  // Map to expected structure
  const parts = matchupsData.map(m => ({
    matchup_id: m.id,
    bracket_id: m.bracket_id,
    round: m.round,
    index_in_round: m.index_in_round,
    left_item_id: m.item1_id,
    right_item_id: m.item2_id,
    winner_item_id: m.winner_item_id
  }));

  // 2) Fetch all items for the bracket (to render labels/images/audio)
  const { data: items, error: iErr } = await supabase
    .from('bracket_items')
    .select('id, bracket_id, seed, label, sublabel, image_url, audio_url')
    .eq('bracket_id', bracketId);

  if (iErr) throw new Error(`items: ${iErr.message}`);

  const byId = new Map(items.map(i => [i.id, i]));

  // 3) Fetch tallies for these matchups (one call with IN list)
  const matchupIds = parts.map(p => p.matchup_id);
  const { data: tallies, error: tErr } = await supabase
    .from('tallies_live')
    .select('matchup_id, item1_id, item2_id, percent1_bp, votes_1, votes_2, updated_at')
    .in('matchup_id', matchupIds);

  if (tErr) throw new Error(`tallies_live: ${tErr.message}`);

  const talliesByMid = new Map(tallies.map(t => [t.matchup_id, t]));

  // 4) Build client DTO
  const matchups = parts.map(p => {
    const t = talliesByMid.get(p.matchup_id) || null;
    const item1 = byId.get(p.left_item_id) || null;
    const item2 = byId.get(p.right_item_id) || null;

    // Percent handling (basis points → percentages)
    let leftPct = null;
    let rightPct = null;
    if (t && typeof t.percent1_bp === 'number') {
      leftPct = t.percent1_bp / 100.0;
      rightPct = +(100 - leftPct).toFixed(2);
      leftPct = +leftPct.toFixed(2);
    }

    return {
      id: p.matchup_id,
      round: p.round,
      index_in_round: p.index_in_round,
      item1,
      item2,
      // (Optionally show raw counts at end of day; during week you may hide)
      votes_1: t?.votes_1 ?? null,
      votes_2: t?.votes_2 ?? null,
      leftPct,
      rightPct,
      updated_at: t?.updated_at ?? null,
      winnerId: p.winner_item_id ?? null
    };
  });

  const updatedAt = matchups.reduce((acc, m) => {
    if (!m.updated_at) return acc;
    const ts = new Date(m.updated_at).getTime();
    return acc ? Math.max(acc, ts) : ts;
  }, null);

  return {
    matchups,
    items: Object.fromEntries(byId), // if you like having a dictionary for client cache
    updatedAt: updatedAt ? new Date(updatedAt).toISOString() : null
  };
}

/** ---------- Results payload (weekend/after close) ---------- **/

/**
 * Get final results for an entire bracket: counts + winner per matchup.
 * This uses results_final (which reads frozen counts from matchups).
 */
export async function getBracketResults(supabase, bracketId) {
  const { data: res, error: rErr } = await supabase
    .from('results_final')
    .select('matchup_id, item1_id, item2_id, votes_1, votes_2, winner_item_id');

  if (rErr) throw new Error(`results_final: ${rErr.message}`);

  // Fetch items once
  const { data: items, error: iErr } = await supabase
    .from('bracket_items')
    .select('id, bracket_id, seed, label, sublabel, image_url, audio_url')
    .eq('bracket_id', bracketId);

  if (iErr) throw new Error(`items: ${iErr.message}`);

  const byId = new Map(items.map(i => [i.id, i]));

  const rows = res
    .filter(r => byId.has(r.item1_id) && byId.has(r.item2_id))
    .map(r => ({
      matchup_id: r.matchup_id,
      item1: byId.get(r.item1_id),
      item2: byId.get(r.item2_id),
      votes_1: r.votes_1,
      votes_2: r.votes_2,
      winnerId: r.winner_item_id
    }));

  // Group by round/index for rendering order (requires a join back to matchups)
  const { data: metas, error: mErr } = await supabase
    .from('matchups')
    .select('id, round, index_in_round')
    .eq('bracket_id', bracketId);

  if (mErr) throw new Error(`matchups meta: ${mErr.message}`);

  const metaById = new Map(metas.map(m => [m.id, m]));
  rows.sort((a, b) => {
    const ma = metaById.get(a.matchup_id) || { round: 99, index_in_round: 99 };
    const mb = metaById.get(b.matchup_id) || { round: 99, index_in_round: 99 };
    return ma.round - mb.round || ma.index_in_round - mb.index_in_round;
  });

  return { results: rows };
}

/** ---------- Page mode helper ---------- **/

/**
 * Quick page-mode decision:
 * - Mon..Fri -> round = weekday number (1..5), standard voting view
 * - Sat/Sun  -> results mode
 */
export function getPageMode(now = moment.tz(TZ)) {
  const round = getCurrentRound(now);
  return {
    round,
    isResults: round === 6,
    anchorSunday: getAnchorSunday(now)
  };
}

/** ---------- UI Helper Functions ---------- **/

/**
 * Get the formatted date for a given round
 */
export function getRoundDate(bracket, roundNum) {
  if (!bracket) return "";
  const startDate = moment(bracket.anchor_sunday).tz("America/New_York");
  return startDate.add(roundNum, "days").format("ddd, MMM D");
}

/**
 * Update countdown timer to show time remaining until midnight
 */
export function updateCountdown() {
  const now = moment.tz("America/New_York");
  const midnight = now.clone().endOf("day");
  const duration = moment.duration(midnight.diff(now));

  const hours = String(duration.hours()).padStart(2, "0");
  const minutes = String(duration.minutes()).padStart(2, "0");
  const seconds = String(duration.seconds()).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Generate TBD (To Be Determined) matchups for future rounds
 */
export function generateTBDMatchups(roundNum) {
  const matchupCount = Math.pow(2, 5 - roundNum); // Round 1=16, 2=8, 3=4, 4=2, 5=1
  const tbdMatchups = [];

  for (let i = 0; i < matchupCount; i++) {
    tbdMatchups.push({
      id: `tbd-${roundNum}-${i}`,
      item1: {
        id: `tbd-${roundNum}-${i}-1`,
        label: "TBD",
        seed: "",
        image_url: "/resources/cd.png",
      },
      item2: {
        id: `tbd-${roundNum}-${i}-2`,
        label: "TBD",
        seed: "",
        image_url: "/resources/cd.png",
      },
      item1Votes: 0,
      item2Votes: 0,
      totalVotes: 0,
      item1Percentage: 50,
      item2Percentage: 50,
    });
  }

  return tbdMatchups;
}

/**
 * Get matchups for display, including TBD placeholders for future rounds
 */
export function getDisplayMatchups(fullBracket, roundNum, currentRound) {
  if (!roundNum) return null; // For the special null column in final view

  // If this is a future round, show TBD
  if (roundNum > currentRound && currentRound < 6) {
    return generateTBDMatchups(roundNum);
  }

  // If the round has started/completed and exists in fullBracket, use it
  if (fullBracket[roundNum] && fullBracket[roundNum].length > 0) {
    return fullBracket[roundNum];
  }

  // Otherwise return empty
  return [];
}

/**
 * Calculate which rounds should be visible based on effective round
 */
export function calculateVisibleRounds(effectiveRound) {
  // View 1: [1, 2, 3]   - Monday (Round 1)
  // View 2: [2, 3, 4]   - Tuesday (Sweet Sixteen)
  // View 3: [3, 4, 5]   - Wednesday (Elite Eight)
  // View 4: [4, 5, 6]   - Thursday (Final Four)
  // View 5: [5]         - Friday+ (Finals)

  if (effectiveRound <= 1) return [1, 2, 3];
  if (effectiveRound === 2) return [2, 3, 4];
  if (effectiveRound === 3) return [3, 4, 5];
  if (effectiveRound === 4) return [4, 5, 6];
  if (effectiveRound >= 5) return [5];

  return [1, 2, 3];
}

/**
 * Calculate the top 4 finishers from bracket results
 */
export function calculateTopFinishers(currentRound, fullBracket) {
  if (currentRound !== 6 || !fullBracket[5] || !fullBracket[5][0]) {
    return { champion: null, second: null, third: null, fourth: null };
  }

  const finalMatchup = fullBracket[5][0];
  const champion =
    finalMatchup.winnerId === finalMatchup.item1.id
      ? finalMatchup.item1
      : finalMatchup.item2;
  const runnerUp =
    finalMatchup.winnerId === finalMatchup.item1.id
      ? finalMatchup.item2
      : finalMatchup.item1;

  // For 3rd and 4th place, we need to look at the semifinal losers
  let third = null;
  let fourth = null;

  if (fullBracket[4] && fullBracket[4].length >= 2) {
    const semifinal1 = fullBracket[4][0];
    const semifinal2 = fullBracket[4][1];

    // Find the losers of the semifinals
    const semifinal1Loser =
      semifinal1.winnerId === semifinal1.item1.id
        ? semifinal1.item2
        : semifinal1.item1;
    const semifinal2Loser =
      semifinal2.winnerId === semifinal2.item1.id
        ? semifinal2.item2
        : semifinal2.item1;

    // Determine 3rd and 4th based on seed (lower seed = better placement)
    if (semifinal1Loser.seed < semifinal2Loser.seed) {
      third = semifinal1Loser;
      fourth = semifinal2Loser;
    } else {
      third = semifinal2Loser;
      fourth = semifinal1Loser;
    }
  }

  return { champion, second: runnerUp, third, fourth };
}

/**
 * Calculate total votes for a specific item across all matchups
 */
export function calculateItemTotalVotes(fullBracket, itemId) {
  if (!itemId) return 0;

  return Object.values(fullBracket).reduce((total, roundMatchups) => {
    return (
      total +
      roundMatchups.reduce((roundTotal, matchup) => {
        // Count votes for item in this matchup
        if (matchup.item1.id === itemId) {
          return roundTotal + (matchup.item1Votes || 0);
        } else if (matchup.item2.id === itemId) {
          return roundTotal + (matchup.item2Votes || 0);
        }
        return roundTotal;
      }, 0)
    );
  }, 0);
}
