<script>
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import Navbar from "$lib/../components/Navbar.svelte";
  import SlideMenu from "$lib/../components/SlideMenu.svelte";
  import Ramp from "../Ramp.svelte";
  import { browser } from "$app/environment";

  let mode = "create";
  let email = "";
  let username = "";
  let loading = false;
  let sent = false;
  let errorMsg = "";
  let showForm = false;
  let showSlideMenu = false;
  let oauthLoading = false;

  // Navbar event handlers
  function handleMenuClick() {
    showSlideMenu = true;
  }

  function handleCloseSlideMenu() {
    showSlideMenu = false;
  }

  function handleSlideMenuNavigation(event) {
    const destination = event.detail.destination;
    showSlideMenu = false;

    if (browser) {
      // Store the intended game mode in sessionStorage for the main page to pick up
      if (destination === "home") {
        sessionStorage.removeItem("spotle_intended_mode");
        window.location.href = "/";
      } else if (
        destination === "rewind" ||
        destination === "jam" ||
        destination === "create"
      ) {
        sessionStorage.setItem("spotle_intended_mode", destination);
        window.location.href = "/";
      }
      // Other destinations like external links are handled by the SlideMenu component itself
    }
  }

  const ALLOWED = [
    "https://spotle.io",
    "https://harmonies.io",
    "https://crosstune.io",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
  ];
  const unameRe = /^[a-z0-9_]{3,24}$/;
  let returnTo = "";
  let nextPath = "/";
  let redirectTo = "";

  onMount(() => {
    const url = new URL(window.location.href);
    const r = url.searchParams.get("r");
    const n = url.searchParams.get("next");
    const candidateReturnTo = r || window.location.origin;

    if (ALLOWED.includes(candidateReturnTo)) {
      returnTo = candidateReturnTo;
      redirectTo = `${returnTo}/auth/callback`;
      showForm = true;
    } else {
      errorMsg = "Unsupported origin.";
    }
    if (n && n.startsWith("/")) nextPath = n;

    console.log("redirectTo", redirectTo);
    console.log("returnTo", returnTo);
    console.log("nextPath", nextPath);
  });

  async function onSubmit(e) {
    e.preventDefault();
    if (!showForm) return;

    errorMsg = "";
    sent = false;

    if (!email || !email.includes("@")) {
      errorMsg = "Enter a valid email.";
      return;
    }

    loading = true;
    try {
      if (mode === "create") {
        // 1) validate username for new accounts
        const uname = username.trim().toLowerCase();
        if (!unameRe.test(uname)) {
          errorMsg = "Username must be 3–24 chars (a–z, 0–9, underscore).";
          return;
        }

        // 2) optionally pre-check username uniqueness to avoid a failing email
        const { data: existing, error: checkErr } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", uname)
          .maybeSingle();
        if (!checkErr && existing) {
          errorMsg = "That username is taken. Try another.";
          return;
        }

        // 3) send *signup* magic link (creates user)
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: redirectTo,
            data: { username: uname }, // trigger uses this to create the profile row
          },
        });
        if (error) throw error;
      } else {
        // LOGIN: send *login-only* magic link (never creates)
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: redirectTo,
            shouldCreateUser: false, // <- key difference
          },
        });
        if (error) {
          // If user not found, helpfully suggest creating one
          if (String(error.message).toLowerCase().includes("user not found")) {
            errorMsg = "No account for that email. Create one instead.";
            return;
          }
          throw error;
        }
      }

      sent = true;
    } catch (err) {
      console.error(err);
      errorMsg = err?.message || "Something went wrong.";
    } finally {
      loading = false;
    }
  }

  async function handleGoogleLogin(redirectTo) {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo,
      },
    });
  }
</script>

<main>
  <!-- The backdrop div should be the first child in main -->
  <div class="backdrop"></div>
  <Ramp PUB_ID="" WEBSITE_ID="" />
  <Navbar
    playingJam={false}
    playingRewind={false}
    showStats={false}
    showHelp={false}
    showMute={false}
    on:menu={handleMenuClick}
  />

  <!-- Slide Menu overlay -->
  {#if showSlideMenu}
    <SlideMenu
      on:close={handleCloseSlideMenu}
      on:navigate={handleSlideMenuNavigation}
    />
  {/if}

  <div class="outer-container">
    <div class="container">
      <div class="login-container">
        <!-- Header -->
        <div class="login-header">
          <h1 class="login-title">
            {mode === "create" ? "Create Spotle Account" : "Login to Spotle"}
          </h1>
          <p class="login-subtitle">
            {mode === "create"
              ? "Join thousands of music lovers playing Spotle daily"
              : "Welcome back! Sign in to continue playing"}
          </p>
        </div>

        <!-- Mode toggle -->
        <div class="mode-toggle">
          <button
            class="toggle-btn {mode === 'login' ? 'active' : ''}"
            on:click={() => (mode = "login")}
            aria-pressed={mode === "login"}
          >
            Log In
          </button>
          <button
            class="toggle-btn {mode === 'create' ? 'active' : ''}"
            on:click={() => (mode = "create")}
            aria-pressed={mode === "create"}
          >
            Create Account
          </button>
        </div>

        {#if showForm}
          <!-- Login form -->
          <form class="login-form" on:submit={onSubmit}>
            <div class="input-group">
              <label class="input-label" for="email">Email</label>
              <input
                id="email"
                class="login-input"
                type="email"
                bind:value={email}
                placeholder="Enter your email"
                required
              />
            </div>

            {#if mode === "create"}
              <div class="input-group">
                <label class="input-label" for="username">Username</label>
                <input
                  id="username"
                  class="login-input"
                  type="text"
                  bind:value={username}
                  minlength="3"
                  maxlength="24"
                  pattern="[a-z0-9_]+"
                  placeholder="Choose a username"
                  required
                />
                <small class="input-hint"
                  >lowercase, numbers, underscore only</small
                >
              </div>
            {/if}

            <button class="login-btn" type="submit" disabled={loading}>
              {loading
                ? "Sending…"
                : mode === "create"
                  ? "Send Sign-Up Link"
                  : "Send Login Link"}
            </button>

            {#if sent}
              <div class="success-message">
                <p>
                  Check your email for a {mode === "create"
                    ? "sign-up"
                    : "login"} link.
                </p>
              </div>
            {/if}

            {#if errorMsg}
              <div class="error-message">
                <p>{errorMsg}</p>
              </div>
            {/if}
          </form>

          <!-- OAuth placeholder -->
          <div class="oauth-section">
            <div class="divider">
              <span class="divider-text">or</span>
            </div>

            <div class="oauth-buttons">
              <button
                class="oauth-btn google-btn"
                on:click={handleGoogleLogin}
                disabled={oauthLoading}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {oauthLoading ? "Connecting..." : "Continue with Google"}
              </button>

              <button class="oauth-btn apple-btn" disabled>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
                    fill="currentColor"
                  />
                </svg>
                Continue with Apple
              </button>
            </div>
          </div>
        {:else}
          <div class="error-message">
            <p>{errorMsg}</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</main>

<style>
  .outer-container {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    min-height: 100vh;
  }

  .container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    max-width: 340px;
    margin: 0 auto;
    padding: 20px;
  }

  .login-container {
    width: 100%;
    max-width: 340px;
    background: rgba(18, 18, 18, 0.9);
    border-radius: 12px;
    padding: 30px 25px;
    margin-top: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .login-header {
    text-align: center;
    margin-bottom: 30px;
  }

  .login-title {
    color: #fff;
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 8px;
    line-height: 1.2;
  }

  .login-subtitle {
    color: #b5b5b5;
    font-size: 16px;
    font-weight: 400;
    line-height: 1.4;
    margin: 0;
  }

  .mode-toggle {
    display: flex;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    padding: 3px;
    margin-bottom: 25px;
  }

  .toggle-btn {
    flex: 1;
    background: none;
    border: none;
    color: #b5b5b5;
    font-size: 14px;
    font-weight: 600;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .toggle-btn.active {
    background: #cbff70;
    color: #121212;
  }

  .toggle-btn:hover:not(.active) {
    color: #fff;
    background: rgba(255, 255, 255, 0.05);
  }

  .login-form {
    width: 100%;
  }

  .input-group {
    margin-bottom: 20px;
  }

  .input-label {
    display: block;
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
    text-align: left;
  }

  .login-input {
    width: 100%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 16px;
    color: #fff;
    font-size: 16px;
    font-family: "Inter", system-ui, Avenir, Helvetica, Arial, sans-serif;
    transition: all 0.2s ease;
    box-sizing: border-box;
  }

  .login-input:focus {
    outline: none;
    border-color: #cbff70;
    box-shadow: 0 0 0 2px rgba(203, 255, 112, 0.2);
  }

  .login-input::placeholder {
    color: #666;
  }

  .input-hint {
    color: #888;
    font-size: 14px;
    margin-top: 4px;
    display: block;
  }

  .login-btn {
    width: 100%;
    background: #cbff70;
    border: none;
    border-radius: 8px;
    color: #121212;
    font-size: 14px;
    font-weight: 700;
    padding: 12px 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 10px;
  }

  .login-btn:hover:not(:disabled) {
    background: #b8e65c;
    transform: translateY(-1px);
  }

  .login-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .success-message {
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.2);
    border-radius: 8px;
    padding: 16px;
    margin-top: 20px;
  }

  .success-message p {
    color: #22c55e;
    font-size: 14px;
    margin: 0;
    text-align: center;
  }

  .error-message {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 8px;
    padding: 16px;
    margin-top: 20px;
  }

  .error-message p {
    color: #ef4444;
    font-size: 14px;
    margin: 0;
    text-align: center;
  }

  .oauth-section {
    margin-top: 30px;
  }

  .divider {
    position: relative;
    text-align: center;
    margin-bottom: 20px;
  }

  .divider::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
  }

  .divider-text {
    background: rgba(18, 18, 18, 0.9);
    color: #888;
    padding: 0 16px;
    font-size: 14px;
    position: relative;
    z-index: 1;
  }

  .oauth-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .oauth-btn {
    width: 100%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    padding: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .oauth-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .oauth-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }

  .google-btn svg {
    flex-shrink: 0;
  }

  .apple-btn {
    color: #fff;
  }

  /* Mobile responsiveness */
  @media (max-width: 480px) {
    .container {
      padding: 15px;
    }

    .login-container {
      padding: 25px 20px;
    }

    .login-title {
      font-size: 22px;
    }

    .login-subtitle {
      font-size: 15px;
    }
  }

  /* Desktop styles */
  @media (min-width: 768px) {
    .container {
      max-width: 400px;
      padding: 40px 20px;
    }

    .login-container {
      padding: 40px 35px;
    }
  }
</style>
