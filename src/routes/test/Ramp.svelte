<script>
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { browser } from "$app/environment";

  export let PUB_ID;
  export let WEBSITE_ID;

  let rampComponentLoaded = false;
  let lastPathname;

  // Rewarded helpers come from a shared module
  import {
    initRewardedAdEvents,
    setRampLoaded,
    tryPrefetchRewarded,
  } from "$lib/rewardedAd.js";

  onMount(() => {
    if (!browser || !PUB_ID || !WEBSITE_ID) {
      console.log("[RAMP] Missing Publisher Id and Website Id", {
        browser,
        PUB_ID,
        WEBSITE_ID,
      });
      return;
    }

    // Setup reward video event listeners (once)
    initRewardedAdEvents();

    window.ramp = window.ramp || {};
    window.ramp.que = window.ramp.que || [];
    window.ramp.passiveMode = true;

    // Load the Ramp configuration script
    const configScript = document.createElement("script");
    configScript.src = `https://cdn.intergient.com/${PUB_ID}/${WEBSITE_ID}/ramp.js`;
    document.body.appendChild(configScript);
    console.log("[RAMP] Injecting config script", { src: configScript.src });

    configScript.onload = () => {
      rampComponentLoaded = true;
      setRampLoaded(true);
      window.ramp.que.push(() => {
        console.log(
          "[RAMP] config loaded -> que: spaNewPage, addTag, prefetch"
        );
        try {
          window.ramp.spaNewPage();
          window.ramp.addTag("standard_iab_head1");
        } catch (err) {
          console.log("[RAMP] Error during initial que ops", err);
        }
        tryPrefetchRewarded();
      });
    };

    configScript.onerror = (err) => {
      console.log("[RAMP] Failed to load config script", err);
    };
  });

  $: if (
    browser &&
    rampComponentLoaded &&
    window.ramp &&
    window.ramp.spaNewPage &&
    $page.url.pathname !== lastPathname
  ) {
    lastPathname = $page.url.pathname;
    window.ramp.que.push(() => {
      console.log("[RAMP] SPA route change ->", $page.url.pathname);
      try {
        window.ramp.spaNewPage($page.url.pathname);
      } catch (err) {
        console.log("[RAMP] Error calling spaNewPage on route change", err);
      }
      tryPrefetchRewarded();
    });
  }
</script>

<div class="ad-container">
  <div data-pw-mobi="standard_iab_head1" id="standard_iab_head1"></div>
</div>

<style>
  .ad-container {
    position: sticky;
    top: 0;
    width: 100%;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #121212;
    z-index: 101;
  }

  #standard_iab_head1 {
    width: 350px;
    height: 50px;
    margin: 0 auto;
    padding: 0;
  }

  /* Hide ads on desktop */
  @media (min-width: 768px) {
    .ad-container {
      display: none;
    }
  }
</style>
