import { json } from '@sveltejs/kit';

function isUUID(v) {
  return typeof v === 'string' && /^[0-9a-fA-F-]{36}$/.test(v);
}

/** @type {import('./$types').RequestHandler} */
export async function POST(event) {
  const { locals: { supabase, safeGetSession }, cookies, url } = event;

  let votesPayload;
  try {
    votesPayload = await event.request.json();
  } catch {
    return json({ message: 'Invalid JSON.' }, { status: 400 });
  }

  if (!Array.isArray(votesPayload) || votesPayload.length === 0) {
    return json({ message: 'Invalid payload.' }, { status: 400 });
  }

  // Basic shape/UUID validation (defensive)
  for (const v of votesPayload) {
    if (!isUUID(v.bracket_id) || !isUUID(v.matchup_id) || !isUUID(v.chosen_item_id)) {
      return json({ message: 'Invalid identifiers in payload.' }, { status: 400 });
    }
  }

  // Session / cookie
  const { user } = await safeGetSession();
  let sessionId = cookies.get('spotle_bracket_session_id');
  if (!user && !sessionId) sessionId = crypto.randomUUID();

  // Prepare votes in the format expected by the database function
  const votesForDB = votesPayload.map(v => ({
    matchup_id: v.matchup_id,
    item_id: v.chosen_item_id
  }));
  
  console.log('Attempting to cast votes for', votesPayload.length, 'matchups');

  // Call the batch vote function with duplicate prevention and sharding
  const { data, error } = await supabase.rpc('cast_votes_batch', {
    p_votes: votesForDB,
    p_user_id: user?.id ?? null,
    p_session_id: user ? null : sessionId
  });

  if (error) {
    console.error('cast_votes_batch error:', error);
    return json({ message: 'An error occurred while casting your votes.' }, { status: 500 });
  }

  // Filter to only votes that were actually applied (not duplicates/invalid)
  const appliedVotes = (data || []).filter(v => v.applied);
  const acceptedMatchupIds = appliedVotes.map(v => v.matchup_id);
  const rejectedCount = (data?.length || 0) - appliedVotes.length;
  
  console.log('Votes cast successfully:', appliedVotes.length, 'applied,', rejectedCount, 'duplicates/invalid rejected');

  // Set cookie for anonymous users
  if (!user) {
    cookies.set('spotle_bracket_session_id', sessionId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: true,
      secure: url.protocol === 'https:',
      sameSite: 'lax'
    });
  }

  // Return which matchup_ids were accepted
  return json({ success: true, accepted: acceptedMatchupIds });
}
