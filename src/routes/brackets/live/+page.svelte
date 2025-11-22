<script>
  import { onMount, onDestroy } from "svelte";
  import moment from "moment-timezone";
  import { bracketView, bracketRoundGradient } from "../../store.js";
  import { page } from "$app/stores";
  import {
    getRoundDate,
    updateCountdown,
    getDisplayMatchups,
    calculateVisibleRounds,
    calculateTopFinishers,
    calculateItemTotalVotes,
  } from "$lib/bracketHelpers.js";
  import BracketHeader from "../../../components/brackets/BracketHeader.svelte";
  import BracketNavigationBar from "../../../components/brackets/BracketNavigationBar.svelte";
  import BracketResultsDisplay from "../../../components/brackets/BracketResultsDisplay.svelte";
  import ChampionColumn from "../../../components/brackets/ChampionColumn.svelte";
  import RoundColumn from "../../../components/brackets/RoundColumn.svelte";
  import SubmitBar from "../../../components/brackets/SubmitBar.svelte";

  /** @type {import('./$types').PageData} */
  export let data;

  let { bracket, fullBracket, currentRound, pageError, userVoteMap, champion } =
    data;

  // Testing override: Allow URL parameter to simulate different rounds
  let testMode = false;
  $: if (typeof window !== "undefined") {
    const testRound = $page.url.searchParams.get("testRound");
    if (testRound) {
      const roundNum = parseInt(testRound);
      if (roundNum >= 1 && roundNum <= 6) {
        currentRound = roundNum;
        testMode = true;
      }
    } else {
      testMode = false;
    }
  }

  // Convert userVoteMap from plain object to Map
  userVoteMap = new Map(Object.entries(userVoteMap || {}));

  let votedMatchups = new Set(userVoteMap.keys());
  let selections = new Map();
  let isSubmitting = false;
  let timeRemaining = "";
  let intervalId;

  let audioPlayers = {};
  let activeAudioItemId = null;

  // Navigation state for 3-column view
  let viewOffset = 0;

  const roundNames = {
    1: "Round 1",
    2: "Sweet Sixteen",
    3: "Elite Eight",
    4: "Final Four",
    5: "Friday Finals",
    6: "Champion",
  };

  // Determine which 3 rounds to display based on current round and navigation offset
  $: effectiveRound = Math.max(1, Math.min(currentRound + viewOffset, 5));
  $: visibleRounds = calculateVisibleRounds(effectiveRound);

  // Navigation handlers
  $: canNavigateBack = effectiveRound > 1;
  $: canNavigateForward = effectiveRound < 5;

  // Round-specific gradients
  const roundGradients = {
    1: "linear-gradient(180deg, #48937D 0%, rgba(18, 18, 18, 0) 39.9%)",
    2: "linear-gradient(180deg, #5D5D00 0%, rgba(18, 18, 18, 0) 39.9%)",
    3: "linear-gradient(180deg, #B200A7 0%, rgba(18, 18, 18, 0) 39.9%)",
    4: "linear-gradient(180deg, #364460 0%, rgba(53, 68, 95, 0) 39.9%)",
    5: "linear-gradient(180deg, #6D6D6D 0%, rgba(109, 109, 109, 0) 39.9%)",
  };

  // Update the gradient store when the effective round changes
  $: $bracketRoundGradient =
    roundGradients[effectiveRound] || roundGradients[1];

  $: matchupsInCurrentRound =
    currentRound > 0 && fullBracket[currentRound]
      ? fullBracket[currentRound].length
      : 0;

  $: currentRoundMatchupIds =
    currentRound > 0 && fullBracket[currentRound]
      ? fullBracket[currentRound].map((m) => m.id)
      : [];

  $: hasVotedInCurrentRound = currentRoundMatchupIds.some((id) =>
    votedMatchups.has(id)
  );

  // Calculate total votes across all matchups
  $: totalVotes = Object.values(fullBracket).reduce((total, roundMatchups) => {
    return (
      total +
      roundMatchups.reduce((roundTotal, matchup) => {
        return roundTotal + (matchup.totalVotes || 0);
      }, 0)
    );
  }, 0);

  // Calculate top 4 finishers for results mode
  $: topFinishers = calculateTopFinishers(currentRound, fullBracket);

  // Calculate champion's total votes across entire bracket
  $: championTotalVotes = topFinishers.champion
    ? calculateItemTotalVotes(fullBracket, topFinishers.champion.id)
    : 0;

  // Helper to get round date
  function getRoundDateHelper(roundNum) {
    return getRoundDate(bracket, roundNum);
  }

  function updateCountdownTimer() {
    timeRemaining = updateCountdown();
  }

  onMount(() => {
    updateCountdownTimer();
    intervalId = setInterval(updateCountdownTimer, 1000);
    return () => clearInterval(intervalId);
  });

  function navigateBack() {
    if (canNavigateBack) {
      viewOffset = viewOffset - 1;
    }
  }

  function navigateForward() {
    if (canNavigateForward) {
      viewOffset = viewOffset + 1;
    }
  }

  function handleSelect(event) {
    const { matchupId, itemId } = event.detail;

    // Only allow selections in the current active round
    if (votedMatchups.has(matchupId) || !matchupId || !itemId) return;

    // Don't allow selecting TBD matchups
    if (matchupId.startsWith("tbd-") || itemId.startsWith("tbd-")) return;

    if (selections.get(matchupId) === itemId) {
      selections.delete(matchupId); // Unselect
    } else {
      selections.set(matchupId, itemId);
    }
    selections = new Map(selections); // Trigger reactivity
  }

  function handleTogglePlay(event) {
    const { item } = event.detail;
    if (activeAudioItemId === item.id) {
      audioPlayers[item.id]?.pause();
    } else {
      if (activeAudioItemId) {
        audioPlayers[activeAudioItemId]?.pause();
      }
      audioPlayers[item.id]?.play();
    }
  }

  function handleAudioPlay(event) {
    activeAudioItemId = event.detail.itemId;
  }

  function handleAudioPause(event) {
    if (activeAudioItemId === event.detail.itemId) {
      activeAudioItemId = null;
    }
  }

  async function handleSubmitVotes() {
    if (isSubmitting || selections.size === 0) return;

    if (selections.size < matchupsInCurrentRound) {
      const confirmed = confirm(
        "Once you've voted, you will not be able to vote again. Only continue if you're sure you don't want to vote on the remaining matchups!"
      );
      if (!confirmed) {
        return;
      }
    }

    isSubmitting = true;

    const votesPayload = Array.from(selections.entries()).map(
      ([matchup_id, chosen_item_id]) => ({
        bracket_id: bracket.id,
        matchup_id,
        chosen_item_id,
      })
    );

    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(votesPayload),
      });

      if (res.ok) {
        for (const [matchupId, chosenItemId] of selections.entries()) {
          userVoteMap.set(matchupId, true);
          votedMatchups.add(matchupId);
        }

        // Force all matchups in the round to be treated as 'voted' for UI purposes
        if (currentRound > 0 && fullBracket[currentRound]) {
          fullBracket[currentRound].forEach((m) => votedMatchups.add(m.id));
        }

        userVoteMap = new Map(userVoteMap);
        votedMatchups = new Set(votedMatchups);

        // Optimistically update vote counts
        for (const [matchupId, chosenItemId] of selections.entries()) {
          const matchup = fullBracket[currentRound].find(
            (m) => m.id === matchupId
          );
          if (matchup) {
            if (chosenItemId === matchup.item1.id) matchup.item1Votes++;
            else matchup.item2Votes++;
            matchup.totalVotes++;
            matchup.item1Percentage =
              (matchup.item1Votes / matchup.totalVotes) * 100;
            matchup.item2Percentage =
              (matchup.item2Votes / matchup.totalVotes) * 100;
          }
        }

        selections.clear();
        selections = new Map(selections);
        fullBracket = { ...fullBracket };
      } else {
        const errorResult = await res.json();
        alert(errorResult.message || "Failed to cast vote.");
      }
    } catch (e) {
      console.error("Error submitting votes:", e);
      alert("An error occurred while submitting your votes.");
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="live-bracket-page">
  <BracketHeader
    {bracket}
    {pageError}
    {currentRound}
    {hasVotedInCurrentRound}
    {totalVotes}
    {timeRemaining}
  />

  <!-- Test Mode Indicator -->
  {#if testMode}
    <div class="test-mode-banner">
      ⚠️ TEST MODE: Viewing as Round {currentRound}
      <a href="/brackets/live" class="exit-test">Exit Test Mode</a>
    </div>
  {/if}

  <!-- Results Display for Saturday/Sunday -->
  {#if currentRound === 6}
    <BracketResultsDisplay {topFinishers} {championTotalVotes} />
  {/if}

  {#if Object.keys(fullBracket).length > 0}
    <!-- Navigation Bar -->
    <BracketNavigationBar
      {visibleRounds}
      {effectiveRound}
      {roundNames}
      {canNavigateBack}
      {canNavigateForward}
      {currentRound}
      getRoundDate={getRoundDateHelper}
      on:navigateBack={navigateBack}
      on:navigateForward={navigateForward}
    />

    <div class="bracket-wrapper">
      <div class="bracket-container" class:compact={$bracketView === "compact"}>
        {#each visibleRounds as roundNum}
          {#if roundNum === 6}
            <!-- Championship Column (Desktop only) -->
            <ChampionColumn
              {topFinishers}
              {currentRound}
              {roundNames}
              getRoundDate={getRoundDateHelper}
            />
          {:else if roundNum}
            {@const matchups = getDisplayMatchups(
              fullBracket,
              roundNum,
              currentRound
            )}
            {#if matchups && matchups.length > 0}
              <RoundColumn
                {roundNum}
                {matchups}
                {roundNames}
                {currentRound}
                {effectiveRound}
                {votedMatchups}
                {selections}
                getRoundDate={getRoundDateHelper}
                {activeAudioItemId}
                on:select={handleSelect}
                on:togglePlay={handleTogglePlay}
                on:audioPlay={handleAudioPlay}
                on:audioPause={handleAudioPause}
              />
            {/if}
          {/if}
        {/each}
      </div>
    </div>

    {#if currentRound > 0 && currentRound !== 6 && !hasVotedInCurrentRound && !isSubmitting}
      <SubmitBar
        selectionsSize={selections.size}
        {matchupsInCurrentRound}
        {isSubmitting}
        on:submit={handleSubmitVotes}
      />
    {:else if currentRound > 0 && hasVotedInCurrentRound}
      <!-- Mobile votes submitted bar -->
      <div class="votes-submitted-bar mobile-only">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"
            fill="currentColor"
          />
        </svg>
        <span>
          Your votes are in for {roundNames[currentRound] ||
            `Round ${currentRound}`}!
        </span>
      </div>
    {/if}
  {:else if !pageError}
    <h1>No Live Bracket</h1>
    <p>There is no live bracket currently active. Please check back later.</p>
  {/if}
</div>

<style>
  .live-bracket-page {
    padding: 1rem;
    padding-bottom: 6rem;
    color: #fff;
    max-width: 100%;
    overflow-x: hidden;
  }

  .test-mode-banner {
    background-color: #ff9800;
    color: #000;
    text-align: center;
    padding: 0.75rem 1rem;
    margin: 0 auto 1rem auto;
    border-radius: 8px;
    font-weight: 600;
    max-width: 600px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  .exit-test {
    background-color: #000;
    color: #ff9800;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    text-decoration: none;
    font-size: 0.85rem;
    font-weight: 600;
    transition: background-color 0.2s;
  }

  .exit-test:hover {
    background-color: #222;
  }

  .mobile-only {
    display: none;
  }

  .votes-submitted-bar {
    position: sticky;
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
    background-color: #28a745;
    color: #fff;
    padding: 1rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: calc(100% - 2rem);
    max-width: 500px;
    margin: 1.5rem auto 0;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
    font-weight: 500;
  }

  .bracket-wrapper {
    display: block;
    margin-bottom: 2rem;
    max-width: 1500px;
    margin-left: auto;
    margin-right: auto;
  }

  .bracket-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 0.75rem;
    flex: 1;
    justify-items: center;
  }

  .bracket-container:has(:global(.round-container:nth-child(3))) {
    grid-template-columns: repeat(3, 1fr);
  }

  .bracket-container:has(:global(.round-container:only-child)) {
    grid-template-columns: 1fr;
    max-width: 400px;
    margin: 0 auto;
  }

  .bracket-container.compact :global(.matchups-column) {
    justify-content: flex-start;
    gap: 1rem;
  }

  /* Mobile Styles */
  @media (max-width: 899px) {
    /* Override global centering that removes our padding */
    :global(body) {
      align-items: stretch !important;
    }

    :global(main) {
      align-items: stretch !important;
    }

    .live-bracket-page {
      padding: 0.5rem 0;
      padding-bottom: 6rem;
      overflow-x: hidden;
      overflow-y: visible;
    }

    .mobile-only {
      display: flex;
    }

    .test-mode-banner {
      padding: 0.5rem 0.75rem;
      font-size: 0.85rem;
      margin: 0 0 1rem 0;
      flex-direction: column;
      gap: 0.5rem;
    }

    .votes-submitted-bar {
      display: block;
      margin-bottom: 0.75rem;
    }

    .bracket-wrapper {
      display: block;
      width: 100%;
      margin: 0;
      padding: 0;
    }

    .bracket-container {
      display: flex;
      flex-direction: column;
      gap: 0;
      width: 100%;
      padding: 0;
      overflow: visible;
    }
  }
</style>
