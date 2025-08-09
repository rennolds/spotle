<script>
  import { browser } from "$app/environment";
  import Navbar from "../../components/Navbar.svelte";
  import Ramp from "../Ramp.svelte";
  import BracketTournament from "../../components/BracketTournament.svelte";

  // Constants
  const PUB_ID = 1025391;
  const WEBSITE_ID = 75339;

  function handleMenuClick() {
    // This will be handled by the parent component
  }

  function toggleHelp() {
    // This will be handled by the parent component
  }

  function handleStatsClick() {
    // This will be handled by the parent component
  }
</script>

<main>
  <div class="backdrop"></div>
  <Ramp {PUB_ID} {WEBSITE_ID} />
  <Navbar
    playingJam={false}
    playingRewind={false}
    on:menu={handleMenuClick}
    on:help={toggleHelp}
    on:stats={handleStatsClick}
  />

  <div class="outer-container">
    <div class="container">
      <BracketTournament />
    </div>
  </div>
</main>

<style>
  .outer-container {
    position: relative;
    justify-content: center;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .container {
    position: relative;
    justify-content: center;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .brackets-content {
    text-align: center;
    padding: 40px 20px;
    color: white;
  }

  .brackets-content h1 {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 20px;
  }

  .brackets-content p {
    font-size: 18px;
    color: #b5b5b5;
  }

  /* Override container positioning */
  :global(.outer-container) {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    height: auto !important;
    min-height: 100vh !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: flex-start !important;
  }

  :global(.container) {
    position: relative !important;
    top: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 auto !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: flex-start !important;
  }

  /* Ensure main element is properly positioned */
  main {
    position: relative !important;
    width: 100% !important;
    height: auto !important;
    min-height: 100vh !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: flex-start !important;
  }
</style>
