import { error as svelteKitError } from '@sveltejs/kit';
import moment from 'moment-timezone';
import { getCurrentBracket, getPageMode } from '$lib/bracketHelpers';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, cookies }) {
  const supabase = locals.supabase;
  try {
    const now = moment.tz('America/Detroit');
    const bracket = await getCurrentBracket(supabase, now);

    if (!bracket) {
      return {
        bracket: null,
        fullBracket: {},
        currentRound: 0,
        pageError: 'No live bracket found for this week.',
        userVoteMap: new Map(),
        champion: null
      };
    }

    const { round: currentRound } = getPageMode(now);

    // 1) all matchups (items + winner) for every round
    const { data: parts, error: pErr } = await supabase
      .from('matchups')
      .select('id, bracket_id, round, index_in_round, item1_id, item2_id, winner_item_id')
      .eq('bracket_id', bracket.id)
      .order('round', { ascending: true })
      .order('index_in_round', { ascending: true });
    if (pErr) throw new Error(pErr.message);
    
    // Map matchups to expected structure (rename columns)
    const matchups = parts.map(m => ({
      matchup_id: m.id,
      bracket_id: m.bracket_id,
      round: m.round,
      index_in_round: m.index_in_round,
      left_item_id: m.item1_id,
      right_item_id: m.item2_id,
      winner_item_id: m.winner_item_id
    }));

    // 2) all items once
    const { data: items, error: iErr } = await supabase
      .from('bracket_items')
      .select('id, bracket_id, seed, label, sublabel, image_url, audio_url')
      .eq('bracket_id', bracket.id);
    if (iErr) throw new Error(iErr.message);

    const itemById = new Map(items.map(i => [i.id, i]));

    // 3) live tallies for current and past rounds (so users can see results after voting)
    const relevantRoundIds = matchups.filter(p => p.round <= currentRound).map(p => p.matchup_id);
    const { data: tallies, error: tErr } = relevantRoundIds.length
      ? await supabase
          .from('tallies_live')
          .select('matchup_id, item1_id, item2_id, percent1_bp, votes_1, votes_2, updated_at')
          .in('matchup_id', relevantRoundIds)
      : { data: [], error: null };
    if (tErr) throw new Error(tErr.message);
    
    console.log('Fetched tallies for', tallies?.length || 0, 'matchups');
    
    // Check specific matchups we know have votes
    const testMatchupIds = ['92388056-c799-46c9-8e2c-ad173886a480', '5c93c7e1-41b1-4421-bd44-1b4f2cdef6df'];
    const testTallies = tallies?.filter(t => testMatchupIds.includes(t.matchup_id));
    if (testTallies?.length > 0) {
      console.log('Test matchups with votes:', JSON.stringify(testTallies, null, 2));
    } else {
      console.log('Test matchups NOT found in fetched tallies');
    }
    
    const talliesByMid = new Map(tallies.map(t => [t.matchup_id, t]));

    // 4) build fullBracket: { [round]: [{ ...matchup dto }] }
    const fullBracket = {};
    for (const p of matchups) {
      const item1 = itemById.get(p.left_item_id) || null;
      const item2 = itemById.get(p.right_item_id) || null;

      // Skip matchups with missing items (shouldn't happen in valid data)
      if (!item1 || !item2) {
        console.warn('Skipping matchup with missing items:', p.matchup_id, p.left_item_id, p.right_item_id);
        continue;
      }

      // Apply tallies for current and past rounds (show progress after voting)
      let item1Percentage = 50; // Default to 50/50 when no votes
      let item2Percentage = 50;
      let votes_1 = 0;
      let votes_2 = 0;
      let totalVotes = 0;
      const t = talliesByMid.get(p.matchup_id) || null;
      if (t) {
        votes_1 = t.votes_1 ?? 0;
        votes_2 = t.votes_2 ?? 0;
        totalVotes = (votes_1 + votes_2) || 0;
        
        // Use percent_bp if available, otherwise calculate from votes
        if (typeof t.percent1_bp === 'number') {
          item1Percentage = +(t.percent1_bp / 100).toFixed(2);
          item2Percentage = +(100 - item1Percentage).toFixed(2);
        } else if (totalVotes > 0) {
          item1Percentage = +((votes_1 / totalVotes) * 100).toFixed(2);
          item2Percentage = +((votes_2 / totalVotes) * 100).toFixed(2);
        }
        // else: stays at default 50/50 when there are no votes
        
        // Debug log for test matchups
        if (testMatchupIds.includes(p.matchup_id)) {
          console.log(`Applied tally to ${p.matchup_id}: ${votes_1}/${votes_2} = ${item1Percentage}%/${item2Percentage}%`);
        }
      }

      const dto = {
        id: p.matchup_id,
        round: p.round,
        index_in_round: p.index_in_round,
        item1,
        item2,
        // zeroed counts for safe optimistic updates on client
        item1Votes: votes_1,
        item2Votes: votes_2,
        totalVotes,
        item1Percentage,
        item2Percentage,
        winnerId: p.winner_item_id ?? null
      };

      if (!fullBracket[p.round]) fullBracket[p.round] = [];
      fullBracket[p.round].push(dto);
    }

    // Fetch user's previous votes from vote_receipts
    const { user } = await locals.safeGetSession();
    const sessionId = cookies.get('spotle_bracket_session_id');
    
    let userVotes = [];
    if (user) {
      // Fetch receipts for logged-in user
      const { data } = await supabase
        .from('vote_receipts')
        .select('matchup_id')
        .eq('user_id', user.id);
      userVotes = data || [];
    } else if (sessionId) {
      // Fetch receipts for anonymous session
      const { data } = await supabase
        .from('vote_receipts')
        .select('matchup_id')
        .eq('session_id', sessionId);
      userVotes = data || [];
    }
    
    // Map matchup_id to a placeholder (we don't track which item they chose, just that they voted)
    // The UI will just show "you've voted in this matchup" without revealing the choice
    const userVoteMap = Object.fromEntries(
      userVotes.map(v => [v.matchup_id, true])
    );

    // results "champion" (if weekend): final winner = winner of round 5, index 1
    let champion = null;
    if (currentRound === 6 && fullBracket[5]?.[0]?.winnerId) {
      const final = fullBracket[5][0];
      champion = final.winnerId === final.item1?.id ? final.item1 : final.item2;
    }

    // weekend message only (keep your existing UX)
    let pageError = null;

    return {
      bracket,
      fullBracket,
      currentRound,
      pageError,
      userVoteMap,
      champion
    };
  } catch (err) {
    console.error('Error in /brackets load:', err);
    throw svelteKitError(500, 'Could not fetch bracket data.');
  }
}
