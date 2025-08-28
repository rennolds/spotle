<script>
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient';
  
    function safeNext(raw) {
      if (!raw) return '/';
      if (/^https?:\/\//i.test(raw)) return '/';
      return raw.startsWith('/') ? raw : '/';
    }
  
    onMount(async () => {
      const url = new URL(window.location.href);
      const params = url.searchParams;
      const next = safeNext(params.get('next'));
  
      // 1) Implicit flow (magic link): tokens arrive in the hash
      if (location.hash.includes('access_token=')) {
        const h = new URLSearchParams(location.hash.slice(1));
        const access_token  = h.get('access_token');
        const refresh_token = h.get('refresh_token');
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (!error) return location.replace(next);
        }
      }
  
      // 2) PKCE flow (used by some OAuth flows): only try if a code is present
      if (params.has('code')) {
        const { error } = await supabase.auth.exchangeCodeForSession(location.href);
        if (!error) return location.replace(next);
      }
  
      // 3) Already signed in?
      const { data: { session } } = await supabase.auth.getSession();
      if (session) return location.replace(next);
  
      console.error('Auth callback failed: no tokens found');
    });
  </script>
  
  <main class="min-h-[60vh] grid place-items-center p-8">
    <div class="max-w-md text-center">
      <h1 class="text-xl font-semibold mb-2">Signing you in…</h1>
      <p>If this hangs, request a new link and open it in the same browser.</p>
    </div>
  </main>
  