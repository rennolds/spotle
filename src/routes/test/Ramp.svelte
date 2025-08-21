<script>
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { browser } from "$app/environment";

  export let PUB_ID;
  export let WEBSITE_ID;

  function playAd() {
    if (window.ramp && window.ramp.manuallyCreateRewardUi) {
        const result = window.ramp.manuallyCreateRewardUi({
          skipConfirmation: true,
        })
            .then(() => {
              console.log("✅ Reward granted");
            })
            .catch((error) => {
              console.error("❌ Rewarded video error:", error);
            });
    }
  }
  if (browser) {
    let rampComponentLoaded = false;
    let lastPathname;
    onMount(() => {
      if (!PUB_ID || !WEBSITE_ID) {
        console.log("Missing Publisher Id and Website Id");
        return;
      }
      window.ramp = window.ramp || {};
      window.ramp.que = window.ramp.que || [];
      window.ramp.passiveMode = true;
      // Load the Ramp configuration script
      const configScript = document.createElement("script");
      configScript.src = `https://cdn.intergient.com/${PUB_ID}/${WEBSITE_ID}/ramp.js`;
      document.body.appendChild(configScript); // Insert before closing</body> tag
      configScript.onload = () => {
        rampComponentLoaded = true;
        window.ramp.que.push(() => {
          window.ramp.spaNewPage();
          window.ramp.addTag("standard_iab_head1");
        });
      };
    });

    $: if (
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
  }
</script>

<div class="ad-container">
  <div data-pw-mobi="standard_iab_head1" id="standard_iab_head1"></div>
</div>

<div class="play-ad-container">
  <button class="play-ad-button" on:click={playAd}>PLAY AD</button>
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

  .play-ad-container {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
  }

  .play-ad-button {
    background-color: #ff4444;
    color: white;
    border: none;
    padding: 15px 30px;
    font-size: 18px;
    font-weight: bold;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
  }

  .play-ad-button:hover {
    background-color: #ff6666;
    transform: scale(1.05);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
  }

  .play-ad-button:active {
    transform: scale(0.95);
  }

  /* Hide ads on desktop */
  @media (min-width: 768px) {
    .ad-container {
      display: none;
    }
  }
</style>
