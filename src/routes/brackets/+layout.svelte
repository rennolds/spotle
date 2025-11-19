<script>
  import Navbar from "../../components/Navbar.svelte";
  import SlideMenu from "../../components/SlideMenu.svelte";
  import Help from "../Help.svelte";
  import Stats from "../Stats.svelte";
  import Ramp from "../Ramp.svelte";
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { bracketRoundGradient } from "../store.js";

  const PUB_ID = 1025391;
  const WEBSITE_ID = 75339;

  let showSlideMenu = false;
  let showHelp = false;
  let showStats = false;

  function handleMenuClick() {
    showSlideMenu = true;
  }

  function handleCloseSlideMenu() {
    showSlideMenu = false;
  }

  function toggleHelp() {
    showHelp = !showHelp;
  }

  function handleStatsClick() {
    showStats = true;
  }

  function handleSlideMenuNavigation(event) {
    const { destination } = event.detail;
    showSlideMenu = false;

    if (browser) {
      switch (destination) {
        case "home":
          goto("/");
          break;
        case "rewind":
        case "jam":
        case "create":
          sessionStorage.setItem("spotle_intended_mode", destination);
          goto("/");
          break;
        case "brackets-live":
          goto("/brackets/live");
          break;
        case "brackets-gallery":
          goto("/brackets/gallery");
          break;
      }
    }
  }
</script>

<div class="brackets-layout" style="background: {$bracketRoundGradient}; background-attachment: fixed;">
  <Ramp {PUB_ID} {WEBSITE_ID} />
  <Navbar
    showMute={false}
    showStats={false}
    on:menu={handleMenuClick}
    on:help={toggleHelp}
    on:stats={handleStatsClick}
  />

  {#if showSlideMenu}
    <SlideMenu
      on:close={handleCloseSlideMenu}
      on:navigate={handleSlideMenuNavigation}
    />
  {/if}

  {#if showStats}
    <Stats on:close={() => (showStats = false)} />
  {/if}

  {#if showHelp}
    <div class="help-overlay">
      <Help on:close={toggleHelp} />
    </div>
  {/if}

  <main>
    <slot />
  </main>
</div>

<style>
  .brackets-layout {
    min-height: 100vh;
    width: 100%;
  }

  main {
    padding-bottom: 100px; /* Space for banner ad */
  }

  .help-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9998;
  }
</style>
