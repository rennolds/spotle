<script>
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient';
  
    let mode = 'login'; // 'login' | 'create'
    let email = '';
    let username = '';
    let loading = false;
    let sent = false;
    let errorMsg = '';
    let showForm = false;
  
    const ALLOWED = ['https://spotle.io','https://harmonies.io','https://crosstune.io','http://localhost:5173','http://localhost:5174','http://localhost:5175'];
    const unameRe = /^[a-z0-9_]{3,24}$/;
    let returnTo = 'https://spotle.io';
    let nextPath = '/';
  
    onMount(() => {
      const url = new URL(window.location.href);
      const r = url.searchParams.get('r') || window.location.origin;
      const n = url.searchParams.get('next');
      if (ALLOWED.includes(r)) { returnTo = r; showForm = true; } else { errorMsg = 'Unsupported origin.'; }
      if (n && n.startsWith('/')) nextPath = n;
    });
  
    async function emailExists(e) {
      const res = await fetch('/api/auth/email-exists', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || 'server');
      return !!j.exists;
    }
  
    async function onSubmit(e) {
      e.preventDefault();
      if (!showForm) return;
  
      errorMsg = ''; sent = false;
      const redirectTo = `${returnTo}/auth/callback?next=${encodeURIComponent(nextPath)}`;
  
      if (!email || !email.includes('@')) {
        errorMsg = 'Enter a valid email.'; return;
      }
  
      loading = true;
      try {
        if (mode === 'create') {
          // 1) block if email is already registered
          const exists = await emailExists();
          if (exists) { errorMsg = 'That email is already registered. Please log in.'; return; }
  
          // 2) validate username for new accounts
          const uname = username.trim().toLowerCase();
          if (!unameRe.test(uname)) { errorMsg = 'Username must be 3–24 chars (a–z, 0–9, underscore).'; return; }
  
          // 3) optionally pre-check username uniqueness to avoid a failing email
          const { data: existing, error: checkErr } = await supabase.from('profiles').select('id').eq('username', uname).maybeSingle();
          if (!checkErr && existing) { errorMsg = 'That username is taken. Try another.'; return; }
  
          // 4) send *signup* magic link (creates user)
          const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: redirectTo,
              data: { username: uname } // trigger uses this to create the profile row
            }
          });
          if (error) throw error;
        } else {
          // LOGIN: send *login-only* magic link (never creates)
          const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: redirectTo,
              shouldCreateUser: false // <- key difference
            }
          });
          if (error) {
            // If user not found, helpfully suggest creating one
            if (String(error.message).toLowerCase().includes('user not found')) {
              errorMsg = 'No account for that email. Create one instead.';
              return;
            }
            throw error;
          }
        }
  
        sent = true;
      } catch (err) {
        console.error(err);
        errorMsg = err?.message || 'Something went wrong.';
      } finally {
        loading = false;
      }
    }
  </script>
  
  <!-- Add a simple mode switch -->
  <div class="max-w-md mx-auto p-6">
    <div class="flex gap-2 mb-4">
      <button class="border rounded px-3 py-1" on:click={() => (mode = 'login') } aria-pressed={mode==='login'}>Log in</button>
      <button class="border rounded px-3 py-1" on:click={() => (mode = 'create')} aria-pressed={mode==='create'}>Create account</button>
    </div>
  
    <!-- rest of your UI stays the same, but show username only in create mode -->
    <form class="space-y-4" on:submit={onSubmit}>
      <label class="block">
        <span class="text-sm">Email</span>
        <input class="w-full border rounded p-2" type="email" bind:value={email} required />
      </label>
  
      {#if mode === 'create'}
        <label class="block">
          <span class="text-sm">Username</span>
          <input class="w-full border rounded p-2" type="text" bind:value={username} minlength="3" maxlength="24" pattern="[a-z0-9_]+" required />
          <small class="opacity-70">lowercase, numbers, underscore</small>
        </label>
      {/if}
  
      <button class="w-full rounded p-2 border" disabled={loading}>
        {loading ? 'Sending…' : (mode === 'create' ? 'Send sign-up link' : 'Send login link')}
      </button>
      {#if sent}<p class="mt-3">Check your email for a {mode === 'create' ? 'sign-up' : 'login'} link.</p>{/if}
      {#if errorMsg}<p class="text-red-600 mt-2">{errorMsg}</p>{/if}
    </form>
  </div>
  