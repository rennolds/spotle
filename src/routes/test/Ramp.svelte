<script>
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { browser } from "$app/environment";

  export let PUB_ID;
  export let WEBSITE_ID;

  let rampComponentLoaded = false;
  let lastPathname;

  // Rewarded helpers come from a shared module
  import { initRewardedAdEvents, setRampLoaded } from "$lib/rewardedAd.js";

  onMount(() => {
    if (!browser || !PUB_ID || !WEBSITE_ID) {
      console.log("Missing Publisher Id and Website Id");
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

    configScript.onload = () => {
      rampComponentLoaded = true;
      setRampLoaded(true);
      window.ramp.que.push(() => {
        window.ramp.spaNewPage();
        window.ramp.addTag("standard_iab_head1");
      });
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
      window.ramp.spaNewPage($page.url.pathname);
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
