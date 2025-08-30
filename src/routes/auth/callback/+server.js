import { redirect } from '@sveltejs/kit';

export const GET = async (event) => {
	const {
		url,
		locals: { supabase }
	} = event;

	const code = url.searchParams.get('code');
	const tokenHash = url.searchParams.get('token_hash');
	const type = url.searchParams.get('type');
	const next = url.searchParams.get('next') ?? '/';

	let error = null;

	if (code) {
		({ error } = await supabase.auth.exchangeCodeForSession(code));
	} else if (tokenHash && type) {
		({ error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type }));
	}

	if (!error) {
		throw redirect(303, `/${next.slice(1)}`);
	}

	console.error('Auth callback error:', error);
	throw redirect(303, '/auth/auth-code-error');
};

