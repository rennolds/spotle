<!-- src/routes/login/+page.svelte -->
<script>
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient';
  
    // UI state
    let email = '';
    let username = '';
    let loading = false;
    let sent = false;
    let errorMsg = '';
    let showForm = false;
  
    // Allow-list the origins that are permitted to initiate login
    const ALLOWED = [
      'https://spotle.io',
      'https://harmonies.io',
      'https://crosstune.io',
      'http://localhost:5173', // Spotle dev
      'http://localhost:5174', // Harmonies dev (adjust if needed)
      'http://localhost:5175'  // Crosstune dev (adjust if needed)
    ];
  
    // Defaults; will be overridden by query params if allowed
    let returnTo = 'https://spotle.io'; // where the email link should return
    let nextPath = '/';                 // where to land after callback
  
    // lowercase letters, digits, underscore; 3–24 chars
    const unameRe = /^[a-z0-9_]{3,24}$/;
  
    onMount(() => {
      const url = new URL(window.location.href);
      const r = url.searchParams.get('r') || window.location.origin; // origin that initiated login
      const n = url.searchParams.get('next');
  
      if (ALLOWED.includes(r)) {
        returnTo = r;
        showForm = true; // ✅ only render the form for approved origins
      } else {
        showForm = false;
        errorMsg = 'Unsupported origin.';
      }
  
      if (n && n.startsWith('/')) nextPath = n;
    });
  
    async function onSubmit(e) {
      e.preventDefault();
      if (!showForm) return;
  
      errorMsg = '';
      sent = false;
  
      const uname = username.trim().toLowerCase();
  
      // Basic validation
      if (!unameRe.test(uname)) {
        errorMsg = 'Username must be 3–24 chars (a–z, 0–9, underscore).';
        return;
      }
      if (!email || !email.includes('@')) {
        errorMsg = 'Enter a valid email.';
        return;
      }
  
      loading = true;
      try {
        // Optional preflight to avoid sending a link that would fail due to duplicate username
        const { data: existing, error: checkErr } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', uname)
          .maybeSingle();
  
        if (!checkErr && existing) {
          errorMsg = 'That username is taken. Try another.';
          return;
        }
  
        // Build the redirect back to the originating site’s callback
        const redirectTo = `${returnTo}/auth/callback?next=${encodeURIComponent(nextPath)}`;
  
        // Send Supabase magic link. The username goes into user_metadata
        // and your DB trigger will read it to create the profile row.
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: redirectTo,
            data: { username: uname }
          }
        });
  
        if (error) throw error;
  
        sent = true; // show “check your email” state
      } catch (err) {
        console.error(err);
        errorMsg = err?.message || 'Something went wrong sending the magic link.';
      } finally {
        loading = false;
      }
    }
  </script>
  
  <main class="max-w-md mx-auto p-6">
    <h1 class="text-2xl font-semibold mb-4">Sign in to Spotle</h1>
  
    {#if sent}
      <div class="space-y-3">
        <p>Check your email for a sign-in link.</p>
        <p class="text-sm opacity-70">
          You’ll return to <code>{returnTo}</code> and land on <code>{nextPath}</code>.
        </p>
        <a class="underline" href="/">Back home</a>
      </div>
    {:else}
      {#if errorMsg}
        <p class="text-red-600 mb-3">{errorMsg}</p>
      {/if}
  
      {#if showForm}
        <form class="space-y-4" on:submit={onSubmit}>
          <label class="block">
            <span class="text-sm">Email</span>
            <input
              class="w-full border rounded p-2"
              type="email"
              bind:value={email}
              placeholder="you@example.com"
              required
            />
          </label>
  
          <label class="block">
            <span class="text-sm">Username</span>
            <input
              class="w-full border rounded p-2"
              type="text"
              bind:value={username}
              placeholder="yourname"
              minlength="3"
              maxlength="24"
              pattern="[a-z0-9_]+"
              required
            />
            <small class="opacity-70">lowercase letters, numbers, and underscore only</small>
          </label>
  
          <button class="w-full rounded p-2 border" disabled={loading}>
            {loading ? 'Sending…' : 'Send magic link'}
          </button>
  
          <p class="text-xs opacity-70">
            By continuing, you agree to our Terms and Privacy Policy.
          </p>
        </form>
      {/if}
    {/if}
  </main>
  