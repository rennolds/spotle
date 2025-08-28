<script>
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient';
  
    let message = 'Signing you in…';
    let errorMsg = '';
  
    // Only allow safe relative redirects like "/"
    function safeNext(raw) {
      if (!raw) return '/';
      try {
        if (/^https?:\/\//i.test(raw)) return '/'; // block absolute URLs
        if (!raw.startsWith('/')) return '/';
        return raw;
      } catch {
        return '/';
      }
    }
  
    onMount(async () => {
      const url = new URL(window.location.href);
      const params = url.searchParams;
  
      // If the provider appended an error, show it
      const providerError = params.get('error');
      const providerDesc  = params.get('error_description');
      if (providerError) {
        errorMsg = providerDesc ? `${providerError}: ${providerDesc}` : providerError;
        message  = 'Sign-in failed.';
        return;
      }
  
      const next = safeNext(params.get('next')); // optional ?next=/path
  
      try {
        // Exchange the PKCE code in the URL for a session on THIS domain
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) throw error;
  
        window.location.replace(next);
      } catch (err) {
        // If the code was already used, fall back to existing session (if any)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) return window.location.replace(next);
  
        errorMsg = (err && err.message) || 'Unknown error';
        message  = 'Sign-in failed.';
      }
    });
  </script>
  
  <main class="min-h-[60vh] grid place-items-center p-8">
    <div class="max-w-md text-center">
      <h1 class="text-xl font-semibold mb-2">Spotle</h1>
      {#if errorMsg}
        <p class="text-red-600 mb-2">{errorMsg}</p>
        <a class="underline" href="/login">Return to login</a>
      {:else}
        <p>{message}</p>
      {/if}
    </div>
  </main>
  