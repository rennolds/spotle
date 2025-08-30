import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const GET = async (event) => {
  const { url, cookies } = event;

  const provider = url.searchParams.get('provider') ?? 'google';
  const next = url.searchParams.get('next') ?? '/';

  // Create a fresh server client so PKCE verifier cookies are set for this response
  const supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookies.set(name, value, { ...options, path: '/' });
        });
      }
    }
  });

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


