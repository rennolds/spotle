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
    return new Response(null, {
      status: 303,
      headers: new Headers({ Location: '/auth/auth-code-error' })
    });
  }

  return new Response(null, {
    status: 303,
    headers: new Headers({ Location: data.url })
  });
};


