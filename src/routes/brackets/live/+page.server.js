import { getCurrentBracket, getBracketMatchups, getUpcomingBracket } from '$lib/bracketHelpers';
import { error as svelteKitError } from '@sveltejs/kit';
import moment from 'moment-timezone';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, cookies }) {
  const supabase = locals.supabase;
  try {
    // For now, both Saturday and Sunday show the previous week's results
    const bracket = await getCurrentBracket(supabase);
    
    if (!bracket) {
      return {
        bracket: null,
        fullBracket: {},
        currentRound: 0,
        pageError: 'No live bracket found for this week.',
        userVoteMap: new Map(),
        champion: null,
      };
    }

    const matchupData = await getBracketMatchups(supabase, bracket.id);

    const { session } = await locals.safeGetSession();
    const sessionId = cookies.get('spotle_bracket_session_id');
    let userVotesQuery;

    if (session?.user) {
        userVotesQuery = supabase.from('votes').select('matchup_id, chosen_item_id').eq('bracket_id', bracket.id).eq('user_id', session.user.id);
    } else if (sessionId) {
        userVotesQuery = supabase.from('votes').select('matchup_id, chosen_item_id').eq('bracket_id', bracket.id).eq('session_id', sessionId);
    }

    const { data: userVotes } = userVotesQuery ? await userVotesQuery : { data: [] };
    const userVoteMap = new Map();
    if (userVotes) {
        for (const vote of userVotes) {
            userVoteMap.set(vote.matchup_id, vote.chosen_item_id);
        }
    }

    return {
      bracket: matchupData.bracket,
      fullBracket: matchupData.fullBracket,
      currentRound: matchupData.currentRound,
      pageError: matchupData.pageError,
      userVoteMap,
      champion: matchupData.champion,
    };
  } catch (err) {
    console.error("Error in live bracket load function:", err);
    throw svelteKitError(500, 'Could not fetch bracket data.');
  }
}
