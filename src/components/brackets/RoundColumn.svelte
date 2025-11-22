<script>
  import { createEventDispatcher } from "svelte";
  import MatchupCard from "./MatchupCard.svelte";

  export let roundNum;
  export let matchups = [];
  export let roundNames = {};
  export let currentRound = 0;
  export let effectiveRound = 1;
  export let votedMatchups = new Set();
  export let selections = new Map();
  export let getRoundDate = () => "";
  export let activeAudioItemId = null;

  const dispatch = createEventDispatcher();

  function handleSelect(event) {
    dispatch("select", event.detail);
  }

  function handleTogglePlay(event) {
    dispatch("togglePlay", event.detail);
  }

  function handleAudioPlay(event) {
    dispatch("audioPlay", event.detail);
  }

  function handleAudioPause(event) {
    dispatch("audioPause", event.detail);
  }
</script>

<div
  class="round-container"
  id="round-{roundNum}"
  class:active-round={currentRound == roundNum}
  class:results-mode={currentRound === 6}
  class:tbd-round={roundNum > currentRound}
  class:mobile-visible={roundNum === effectiveRound}
>
  <div class="round-header">
    <h2>{roundNames[roundNum] || `Round ${roundNum}`}</h2>
    <span class="round-date">{getRoundDate(roundNum)}</span>
  </div>
  <div class="matchups-column">
    {#each matchups as matchup (matchup.id)}
      <MatchupCard
        {matchup}
        {currentRound}
        {roundNum}
        {votedMatchups}
        {selections}
        {activeAudioItemId}
        on:select={handleSelect}
        on:togglePlay={handleTogglePlay}
        on:audioPlay={handleAudioPlay}
        on:audioPause={handleAudioPause}
      />
    {/each}
  </div>
</div>

<style>
  .round-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .round-container h2 {
    text-align: center;
    font-size: 1.2rem;
    margin-bottom: 0.1rem;
    color: #aaa;
  }

  .round-header {
    margin-bottom: 1rem;
  }

  .round-date {
    font-size: 0.8rem;
    color: #777;
    display: none; /* Hidden on mobile by default */
  }

  .matchups-column {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    justify-content: space-around;
    height: 100%;
  }

  .round-container.active-round .round-header h2 {
    color: #cbff70;
  }

  .round-container.results-mode .round-header h2 {
    color: #fff;
  }

  /* TBD Round Styles */
  .tbd-round :global(.item) {
    cursor: default;
    pointer-events: none;
  }

  /* Mobile Styles */
  @media (max-width: 899px) {
    /* Hide all rounds by default on mobile */
    .round-container {
      display: none !important;
      width: 100%;
    }

    /* Show only the mobile-visible round */
    .round-container.mobile-visible {
      display: flex !important;
      flex-direction: column;
      width: 100%;
      align-items: flex-start;
    }

    .round-header {
      display: none; /* Hidden on mobile - shown in top nav bar instead */
    }

    .matchups-column {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 2rem;
      padding: 0 1rem 2rem 3rem;
      width: 100%;
      box-sizing: border-box;
    }
  }

  /* Desktop Styles */
  @media (min-width: 900px) {
    .round-header {
      display: none; /* Hidden on desktop - shown in nav bar instead */
    }

    /* Increase spacing between items in middle and right columns */
    .round-container:nth-child(2) :global(.matchup-card) {
      gap: 7rem;
    }

    .round-container:nth-child(3) :global(.matchup-card) {
      gap: 18rem;
    }
  }
</style>
