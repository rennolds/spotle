<script>
  import { createEventDispatcher } from "svelte";

  export let visibleRounds = [];
  export let effectiveRound = 1;
  export let roundNames = {};
  export let canNavigateBack = false;
  export let canNavigateForward = false;
  export let currentRound = 0;
  export let getRoundDate = () => "";

  const dispatch = createEventDispatcher();

  function handleNavigateBack() {
    if (canNavigateBack) {
      dispatch("navigateBack");
    }
  }

  function handleNavigateForward() {
    if (canNavigateForward) {
      dispatch("navigateForward");
    }
  }
</script>

<div class="nav-bar">
  <button
    class="nav-arrow nav-arrow-left"
    on:click={handleNavigateBack}
    disabled={!canNavigateBack}
    aria-label="Previous rounds"
  >
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path
        d="M16 5L8 12L16 19V5Z"
        fill="currentColor"
        transform="translate(-1, 0)"
      />
    </svg>
  </button>

  <!-- Mobile: Single round header -->
  <div class="mobile-round-header">
    {#each visibleRounds as roundNum}
      {#if roundNum && roundNum === effectiveRound}
        <h2>{roundNames[roundNum] || `Round ${roundNum}`}</h2>
        <span class="round-date">{getRoundDate(roundNum)}</span>
      {/if}
    {/each}
  </div>

  <!-- Desktop: All three round headers -->
  <div class="desktop-round-headers">
    {#each visibleRounds as roundNum}
      {#if roundNum === 6}
        <div class="round-nav-item">
          <h2>{roundNames[6]}</h2>
          <span class="round-date">
            {currentRound === 6 ? getRoundDate(5) : "TBD"}
          </span>
        </div>
      {:else if roundNum}
        <div class="round-nav-item">
          <h2>{roundNames[roundNum] || `Round ${roundNum}`}</h2>
          <span class="round-date">{getRoundDate(roundNum)}</span>
        </div>
      {:else}
        <div class="round-nav-item empty"></div>
      {/if}
    {/each}
  </div>

  <button
    class="nav-arrow nav-arrow-right"
    on:click={handleNavigateForward}
    disabled={!canNavigateForward}
    aria-label="Next rounds"
  >
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path
        d="M8 5L16 12L8 19V5Z"
        fill="currentColor"
        transform="translate(1, 0)"
      />
    </svg>
  </button>
</div>

<style>
  .nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    padding: 0 1rem;
    margin: 0 auto 2rem auto;
    max-width: 1500px;
  }

  .mobile-round-header {
    display: none; /* Hidden on desktop */
  }

  .desktop-round-headers {
    display: flex;
    gap: 2rem;
    flex: 1;
    justify-content: space-around;
  }

  .round-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.25rem;
    flex: 1;
  }

  /* Desktop-only: Align left and right column labels */
  @media (min-width: 900px) {
    .round-nav-item:first-child:not(:only-child) {
      margin-left: -4rem;
    }

    .round-nav-item:first-child:not(:only-child) h2 {
      text-align: left;
    }

    .round-nav-item:last-child:not(:only-child) {
      margin-right: -4rem;
    }

    .round-nav-item:last-child:not(:only-child) h2 {
      text-align: right;
    }

    /* Dates stay centered under their labels */
    .round-nav-item .round-date {
      text-align: center;
    }
  }

  .round-nav-item h2 {
    font-size: 1.2rem;
    margin: 0;
    color: #aaa;
  }

  .round-nav-item .round-date {
    font-size: 0.8rem;
    color: #777;
    display: block;
  }

  .round-nav-item.empty {
    visibility: hidden;
  }

  .nav-arrow {
    background-color: #cbff70;
    border: none;
    color: #121212;
    padding: 0;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    visibility: visible;
    opacity: 1;
  }

  .nav-arrow:hover:not(:disabled) {
    background-color: #b8e654;
    transform: scale(1.1);
  }

  .nav-arrow:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    visibility: visible;
    display: flex;
  }

  /* Mobile Styles */
  @media (max-width: 899px) {
    .nav-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0 1rem;
      margin-bottom: 1.5rem;
    }

    .mobile-round-header {
      flex: 1;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .mobile-round-header h2 {
      font-size: 1.3rem;
      margin: 0;
      color: #cbff70;
    }

    .mobile-round-header .round-date {
      display: block;
      font-size: 0.9rem;
      color: #777;
    }

    .desktop-round-headers {
      display: none; /* Hide on mobile */
    }

    .nav-arrow {
      margin-top: 0;
      width: 32px;
      height: 32px;
      flex-shrink: 0;
    }
  }
</style>
