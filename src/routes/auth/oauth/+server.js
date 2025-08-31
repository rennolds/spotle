import { redirect } from '@sveltejs/kit';

export const GET = async (event) => {
  const { url, locals: { supabase } } = event;

  const provider = url.searchParams.get('provider') ?? 'google';
  const next = url.searchParams.get('next') ?? '/';

  const redirectTo = `${url.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo }
  });

  if (error || !data?.url) {
    throw redirect(303, '/auth/auth-code-error');
  }

  throw redirect(303, data.url);
};


