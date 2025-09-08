import { supabase } from './supabaseClient';
import moment from 'moment-timezone';

/**
 * Determines the anchor Sunday for the current week's bracket.
 * The tournament runs Monday to Friday. The anchor is the Sunday of that week.
 * @returns {string} The date of the anchor Sunday in 'YYYY-MM-DD' format.
 */
function getAnchorSunday() {
  const today = moment.tz('America/New_York');
  // .day() in moment: Sunday is 0, Monday is 1, etc.
  // If today is Sunday (0), we need to go back to *this* Sunday.
  // If today is Saturday (6), we need the upcoming Sunday.
  // The logic should be to find the preceding Sunday for Mon-Sat.
  // if today is Sunday, we want today.
  const dayOfWeek = today.day();
  
  // If it's Sunday, the anchor is today. Otherwise, find the last Sunday.
  const anchor = today.subtract(dayOfWeek, 'days');
  
  return anchor.format('YYYY-MM-DD');
}

/**
 * Fetches the current live bracket from the database.
 * @param {SupabaseClient} supabase The Supabase client instance.
 * @returns {Promise<object|null>} The bracket object or null if not found.
 */
export async function getCurrentBracket(supabase) {
  const anchorSunday = getAnchorSunday();

  const { data, error } = await supabase
    .from('brackets')
    .select('*')
    .eq('anchor_sunday', anchorSunday)
    .single();

  // .single() throws an error if no row is found, which is expected.
  // We'll treat "no row" as a non-error and return null.
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching current bracket:', error);
    throw error; // Re-throw actual errors
  }

  return data;
}

/**
 * Gets the current round number based on the day of the week.
 * Monday is Round 1, Tuesday is Round 2, etc.
 * @returns {number} The current round number (1-5), or 0 if not a tournament day.
 */
function getCurrentRound() {
    // FOR TESTING: Simulate Tuesday (Round 2)
    // return 2;

    const today = moment.tz('America/New_York');
    const dayOfWeek = today.day(); // Sunday=0, Monday=1, ..., Friday=5
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        return dayOfWeek;
    }
    return 0; // Not a tournament day
}

const r1Pairings = {
    1: [1, 32], 2: [16, 17], 3: [8, 25], 4: [9, 24],
    5: [4, 29], 6: [13, 20], 7: [5, 28], 8: [12, 21],
    9: [2, 31], 10: [15, 18], 11: [7, 26], 12: [10, 23],
    13: [3, 30], 14: [14, 19], 15: [6, 27], 16: [11, 22]
};

function getR1Pairing(index_in_round) {
    return r1Pairings[index_in_round];
}

/**
 * Fetches all necessary data for a given bracket and constructs the matchups for the current round.
 * @param {SupabaseClient} supabase The Supabase client instance.
 * @param {string} bracketId The UUID of the bracket.
 * @returns {Promise<object|null>} An object containing bracket details, matchups, and current round.
 */
export async function getBracketMatchups(supabase, bracketId) {
    // Fetch all necessary data at once
    const [bracketRes, itemsRes, allMatchupsRes, votesRes] = await Promise.all([
        supabase.from('brackets').select('*').eq('id', bracketId).single(),
        supabase.from('bracket_items').select('*').eq('bracket_id', bracketId),
        supabase.from('matchups').select('id, round, index_in_round').eq('bracket_id', bracketId).order('round').order('index_in_round'),
        supabase.from('votes').select('matchup_id, chosen_item_id').eq('bracket_id', bracketId)
    ]);

    if (bracketRes.error) throw new Error(bracketRes.error.message);
    if (itemsRes.error) throw new Error(itemsRes.error.message);
    if (allMatchupsRes.error) throw new Error(allMatchupsRes.error.message);
    if (votesRes.error) throw new Error(votesRes.error.message);

    const bracket = bracketRes.data;
    const items = itemsRes.data;
    const allMatchups = allMatchupsRes.data;
    const votes = votesRes.data;

    const itemsById = new Map(items.map(item => [item.id, item]));
    const matchupsByRound = allMatchups.reduce((acc, m) => {
        if (!acc[m.round]) acc[m.round] = [];
        acc[m.round].push(m);
        return acc;
    }, {});

    const voteCounts = votes.reduce((acc, vote) => {
        if (!acc[vote.matchup_id]) acc[vote.matchup_id] = {};
        if (!acc[vote.matchup_id][vote.chosen_item_id]) acc[vote.matchup_id][vote.chosen_item_id] = 0;
        acc[vote.matchup_id][vote.chosen_item_id]++;
        return acc;
    }, {});

    const currentRound = getCurrentRound();
    const winners = new Map(); // Map<matchupId, itemId>
    const tbdItem = { id: 'TBD', label: 'TBD', seed: '', image_url: '/resources/cd.png' };

    // Helper to determine winner, including tie-breaker
    const getWinner = (matchup, item1, item2) => {
        if (!item1 || item1.id === 'TBD' || !item2 || item2.id === 'TBD') return null;
        
        const vCounts = voteCounts[matchup.id] || {};
        const votes1 = vCounts[item1.id] || 0;
        const votes2 = vCounts[item2.id] || 0;

        if (votes1 > votes2) return item1.id;
        if (votes2 > votes1) return item2.id;
        return item1.seed < item2.seed ? item1.id : item2.id; // Tie-breaker
    };

    // Pre-calculate all winners for rounds that have finished
    for (let roundNum = 1; roundNum < currentRound; roundNum++) {
        if (!matchupsByRound[roundNum]) continue;
        for (const matchup of matchupsByRound[roundNum]) {
            let item1, item2;
            if (roundNum === 1) {
                const pairing = getR1Pairing(matchup.index_in_round);
                item1 = items.find(i => i.seed === pairing[0]);
                item2 = items.find(i => i.seed === pairing[1]);
            } else {
                const prevMatchup1 = matchupsByRound[roundNum - 1][(matchup.index_in_round * 2) - 2];
                const prevMatchup2 = matchupsByRound[roundNum - 1][(matchup.index_in_round * 2) - 1];
                const winner1Id = winners.get(prevMatchup1.id);
                const winner2Id = winners.get(prevMatchup2.id);
                item1 = winner1Id ? itemsById.get(winner1Id) : null;
                item2 = winner2Id ? itemsById.get(winner2Id) : null;
            }
            const winnerId = getWinner(matchup, item1, item2);
            if (winnerId) {
                winners.set(matchup.id, winnerId);
            }
        }
    }

    const fullBracket = {};
    for (let roundNum = 1; roundNum <= 5; roundNum++) {
        if (!matchupsByRound[roundNum]) continue;
        fullBracket[roundNum] = matchupsByRound[roundNum].map(matchup => {
            let item1, item2;
            if (roundNum === 1) {
                const pairing = getR1Pairing(matchup.index_in_round);
                item1 = items.find(i => i.seed === pairing[0]) || tbdItem;
                item2 = items.find(i => i.seed === pairing[1]) || tbdItem;
            } else {
                const prevMatchup1 = matchupsByRound[roundNum - 1]?.[(matchup.index_in_round * 2) - 2];
                const prevMatchup2 = matchupsByRound[roundNum - 1]?.[(matchup.index_in_round * 2) - 1];
                const winner1Id = prevMatchup1 ? winners.get(prevMatchup1.id) : null;
                const winner2Id = prevMatchup2 ? winners.get(prevMatchup2.id) : null;
                item1 = winner1Id ? itemsById.get(winner1Id) : tbdItem;
                item2 = winner2Id ? itemsById.get(winner2Id) : tbdItem;
            }

            const matchupVoteCounts = voteCounts[matchup.id] || {};
            const item1Votes = matchupVoteCounts[item1.id] || 0;
            const item2Votes = matchupVoteCounts[item2.id] || 0;
            const totalVotes = item1Votes + item2Votes;

            let winnerId = null;
            if (roundNum < currentRound) {
                winnerId = getWinner(matchup, item1, item2);
            }

            return {
                ...matchup,
                item1, item2, item1Votes, item2Votes, totalVotes,
                item1Percentage: totalVotes > 0 ? (item1Votes / totalVotes) * 100 : 0,
                item2Percentage: totalVotes > 0 ? (item2Votes / totalVotes) * 100 : 0,
                winnerId,
            };
        });
    }

    const today = moment.tz('America/New_York');
    let pageError = null;
    if (currentRound === 0) {
        if (today.day() === 0) {
            pageError = 'Voting begins Monday at midnight EST.';
        } else {
            pageError = 'The tournament is over for this week. Check back Monday!';
        }
    }

    return {
        bracket,
        fullBracket,
        currentRound,
        pageError
    };
}

/**
 * Fetches a bracket's structure for the gallery/picks mode.
 * This version does not fetch votes or calculate official winners.
 * @param {SupabaseClient} supabase The Supabase client instance.
 * @param {string} bracketId The UUID of the bracket.
 * @returns {Promise<object|null>} An object containing bracket details and the structured matchups.
 */
export async function getBracketForGallery(supabase, bracketId) {
    const [bracketRes, itemsRes, allMatchupsRes] = await Promise.all([
        supabase.from('brackets').select('*').eq('id', bracketId).single(),
        supabase.from('bracket_items').select('*').eq('bracket_id', bracketId),
        supabase.from('matchups').select('id, round, index_in_round').eq('bracket_id', bracketId).order('round').order('index_in_round'),
    ]);

    if (bracketRes.error) throw new Error(bracketRes.error.message);
    if (itemsRes.error) throw new Error(itemsRes.error.message);
    if (allMatchupsRes.error) throw new Error(allMatchupsRes.error.message);

    const bracket = bracketRes.data;
    const items = itemsRes.data;
    const allMatchups = allMatchupsRes.data;
    const tbdItem = { id: 'TBD', label: 'TBD', seed: '', image_url: '/resources/cd.png' };

    const matchupsByRound = allMatchups.reduce((acc, m) => {
        if (!acc[m.round]) acc[m.round] = [];
        acc[m.round].push(m);
        return acc;
    }, {});

    const fullBracket = {};
    for (let roundNum = 1; roundNum <= 5; roundNum++) {
        if (!matchupsByRound[roundNum]) continue;

        fullBracket[roundNum] = matchupsByRound[roundNum].map(matchup => {
            let item1, item2;
            if (roundNum === 1) {
                const pairing = getR1Pairing(matchup.index_in_round);
                item1 = items.find(i => i.seed === pairing[0]) || tbdItem;
                item2 = items.find(i => i.seed === pairing[1]) || tbdItem;
            } else {
                item1 = tbdItem;
                item2 = tbdItem;
            }

            return {
                ...matchup,
                item1,
                item2,
            };
        });
    }

    return {
        bracket,
        items,
        fullBracket,
    };
}
