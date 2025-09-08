import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function POST(event) {
    const { locals: { supabase, safeGetSession }, cookies } = event;
    const votesPayload = await event.request.json();

    if (!Array.isArray(votesPayload) || votesPayload.length === 0) {
        return json({ message: 'Invalid payload.' }, { status: 400 });
    }

    const { user } = await safeGetSession();
    let sessionId = cookies.get('spotle_bracket_session_id');

    if (!user && !sessionId) {
        sessionId = crypto.randomUUID();
    }

    const votesToInsert = votesPayload.map(vote => ({
        bracket_id: vote.bracket_id,
        matchup_id: vote.matchup_id,
        chosen_item_id: vote.chosen_item_id,
        user_id: user?.id,
        session_id: user ? null : sessionId,
    }));

    const { error } = await supabase.from('votes').insert(votesToInsert);

    if (error) {
        if (error.code === '23505') { // unique_violation
            return json({ message: 'You have already voted in one or more of these matchups.' }, { status: 409 });
        }
        console.error('Error inserting votes:', error);
        return json({ message: 'An error occurred while casting your votes.' }, { status: 500 });
    }

    // Set cookie for anonymous users
    if (!user) {
        cookies.set('spotle_bracket_session_id', sessionId, {
            path: '/',
            maxAge: 60 * 60 * 24 * 365, // 1 year
            httpOnly: true,
            secure: event.url.protocol === 'https:',
            sameSite: 'lax'
        });
    }

    return json({ success: true });
}
