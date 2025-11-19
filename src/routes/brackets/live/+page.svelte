<script>
  import { onMount, onDestroy } from "svelte";
  import moment from "moment-timezone";
  import SoundCloudPlayer from "../../../components/SoundCloudPlayer.svelte";
  import { bracketView, bracketRoundGradient } from "../../store.js";
  import { page } from "$app/stores";

  /** @type {import('./$types').PageData} */
  export let data;

  let { bracket, fullBracket, currentRound, pageError, userVoteMap, champion } =
    data;

  // Testing override: Allow URL parameter to simulate different rounds
  // Usage: ?testRound=1 for Monday (Round 1), ?testRound=2 for Tuesday, etc.
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

  // Convert userVoteMap from plain object to Map for easier manipulation
  userVoteMap = new Map(Object.entries(userVoteMap || {}));

  let displayedRound =
    currentRound > 0 ? (currentRound === 6 ? 5 : currentRound) : 1;
  let votedMatchups = new Set(userVoteMap.keys());
  let selections = new Map(); // Map<matchupId, itemId>
  let isSubmitting = false;
  let timeRemaining = "";
  let intervalId;

  let audioPlayers = {};
  let activeAudioItemId = null;

  // Navigation state for 3-column view
  let viewOffset = 0; // 0 means show default for current round, -1 means go back, +1 means go forward

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

  $: visibleRounds = (() => {
    // Determine which view to show
    // View 1: [1, 2, 3]   - Monday (Round 1)
    // View 2: [2, 3, 4]   - Tuesday (Sweet Sixteen)
    // View 3: [3, 4, 5]   - Wednesday (Elite Eight)
    // View 4: [4, 5, 6]   - Thursday (Final Four)
    // View 5: [5, 6, null] - Friday+ (Finals)

    if (effectiveRound <= 1) return [1, 2, 3];
    if (effectiveRound === 2) return [2, 3, 4];
    if (effectiveRound === 3) return [3, 4, 5];
    if (effectiveRound === 4) return [4, 5, 6];
    if (effectiveRound >= 5) return [5, 6, null];

    return [1, 2, 3];
  })();

  // Navigation handlers
  $: canNavigateBack = effectiveRound > 1;
  $: canNavigateForward = effectiveRound < 5;

  // Debug logging
  $: {
    console.log("Navigation state:", {
      currentRound,
      viewOffset,
      effectiveRound,
      canNavigateBack,
      canNavigateForward,
      visibleRounds,
      fullBracketKeys: Object.keys(fullBracket),
    });
  }

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

  // Generate TBD matchups for future rounds
  function generateTBDMatchups(roundNum) {
    const matchupCount = Math.pow(2, 5 - roundNum); // Round 1=16, 2=8, 3=4, 4=2, 5=1
    const tbdMatchups = [];

    for (let i = 0; i < matchupCount; i++) {
      tbdMatchups.push({
        id: `tbd-${roundNum}-${i}`,
        item1: {
          id: `tbd-${roundNum}-${i}-1`,
          label: "TBD",
          seed: "",
          image_url: "/resources/cd.png",
        },
        item2: {
          id: `tbd-${roundNum}-${i}-2`,
          label: "TBD",
          seed: "",
          image_url: "/resources/cd.png",
        },
        item1Votes: 0,
        item2Votes: 0,
        totalVotes: 0,
        item1Percentage: 50,
        item2Percentage: 50,
      });
    }

    return tbdMatchups;
  }

  // Get matchups for display, including TBD placeholders
  function getDisplayMatchups(roundNum) {
    if (!roundNum) return null; // For the special null column in final view

    // FIRST check if this is a future round - if so, show TBD regardless of data
    if (roundNum > currentRound && currentRound < 6) {
      return generateTBDMatchups(roundNum);
    }

    // If the round has started/completed and exists in fullBracket, use it
    if (fullBracket[roundNum] && fullBracket[roundNum].length > 0) {
      return fullBracket[roundNum];
    }

    // Otherwise return empty (shouldn't happen in normal flow)
    return [];
  }

  function handleTogglePlay(item) {
    if (activeAudioItemId === item.id) {
      audioPlayers[item.id]?.pause();
    } else {
      if (activeAudioItemId) {
        audioPlayers[activeAudioItemId]?.pause();
      }
      audioPlayers[item.id]?.play();
    }
  }

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
  $: topFinishers = (() => {
    if (currentRound !== 6 || !fullBracket[5] || !fullBracket[5][0]) {
      return { champion: null, second: null, third: null, fourth: null };
    }

    const finalMatchup = fullBracket[5][0];
    const champion =
      finalMatchup.winnerId === finalMatchup.item1.id
        ? finalMatchup.item1
        : finalMatchup.item2;
    const runnerUp =
      finalMatchup.winnerId === finalMatchup.item1.id
        ? finalMatchup.item2
        : finalMatchup.item1;

    // For 3rd and 4th place, we need to look at the semifinal losers
    let third = null;
    let fourth = null;

    if (fullBracket[4] && fullBracket[4].length >= 2) {
      const semifinal1 = fullBracket[4][0];
      const semifinal2 = fullBracket[4][1];

      // Find the losers of the semifinals
      const semifinal1Loser =
        semifinal1.winnerId === semifinal1.item1.id
          ? semifinal1.item2
          : semifinal1.item1;
      const semifinal2Loser =
        semifinal2.winnerId === semifinal2.item1.id
          ? semifinal2.item2
          : semifinal2.item1;

      // Determine 3rd and 4th based on seed (lower seed = better placement)
      if (semifinal1Loser.seed < semifinal2Loser.seed) {
        third = semifinal1Loser;
        fourth = semifinal2Loser;
      } else {
        third = semifinal2Loser;
        fourth = semifinal1Loser;
      }
    }

    return { champion, second: runnerUp, third, fourth };
  })();

  // Calculate champion's total votes across entire bracket
  $: championTotalVotes = (() => {
    if (!topFinishers.champion) return 0;

    return Object.values(fullBracket).reduce((total, roundMatchups) => {
      return (
        total +
        roundMatchups.reduce((roundTotal, matchup) => {
          // Count votes for champion in this matchup
          if (matchup.item1.id === topFinishers.champion.id) {
            return roundTotal + (matchup.item1Votes || 0);
          } else if (matchup.item2.id === topFinishers.champion.id) {
            return roundTotal + (matchup.item2Votes || 0);
          }
          return roundTotal;
        }, 0)
      );
    }, 0);
  })();

  // Helper to calculate date for a given round
  function getRoundDate(roundNum) {
    if (!bracket) return "";
    const startDate = moment(bracket.anchor_sunday).tz("America/New_York");
    return startDate.add(roundNum, "days").format("ddd, MMM D");
  }

  function updateCountdown() {
    if (currentRound > 5 || currentRound === 0) {
      timeRemaining = "";
      return;
    }

    const now = moment.tz("America/New_York");
    const midnight = now.clone().endOf("day");
    const duration = moment.duration(midnight.diff(now));

    const hours = String(duration.hours()).padStart(2, "0");
    const minutes = String(duration.minutes()).padStart(2, "0");
    const seconds = String(duration.seconds()).padStart(2, "0");

    timeRemaining = `${hours}:${minutes}:${seconds}`;
  }

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

  onMount(() => {
    updateCountdown();
    intervalId = setInterval(updateCountdown, 1000);
    return () => clearInterval(intervalId);
  });

  function setDisplayedRound(round) {
    displayedRound = parseInt(round);
  }

  function handleSelect(matchupId, chosenItemId, roundNum) {
    // Only allow selections in the current active round
    if (votedMatchups.has(matchupId) || roundNum !== currentRound) return;

    // Don't allow selecting TBD matchups
    if (matchupId.startsWith("tbd-") || chosenItemId.startsWith("tbd-")) return;

    if (selections.get(matchupId) === chosenItemId) {
      selections.delete(matchupId); // Unselect
    } else {
      selections.set(matchupId, chosenItemId);
    }
    selections = new Map(selections); // Trigger reactivity
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
          userVoteMap.set(matchupId, true); // Mark as voted (we don't track which item)
          votedMatchups.add(matchupId);
        }

        // This is the key change: force all matchups in the round to be treated as 'voted' for UI purposes
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
      // ... error handling
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="live-bracket-page">
  {#if bracket}
    <div class="bracket-header">
      <div class="header-column title-column">
        <h1>{bracket.title}</h1>
        {#if pageError}
          <div class="status-pill error">{pageError}</div>
        {:else if currentRound > 0 && hasVotedInCurrentRound}
          <div class="status-pill voted desktop-only">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"
                fill="currentColor"
              />
            </svg>
            Votes submitted
          </div>
        {/if}
      </div>

      <div class="desktop-stats">
        <div class="header-column votes-column">
          <div class="column-label">Votes</div>
          <div class="column-value">{totalVotes.toLocaleString()}</div>
        </div>

        <div class="header-column timer-column">
          <div class="column-label">Next Round</div>
          <div class="column-value">
            {#if currentRound === 6}
              0:00
            {:else if timeRemaining}
              {timeRemaining}
            {:else}
              0:00
            {/if}
          </div>
        </div>
      </div>

      <div class="mobile-stats">
        <div class="header-column votes-column">
          <div class="column-label">Votes</div>
          <div class="column-value">{totalVotes.toLocaleString()}</div>
        </div>

        <div class="header-column timer-column">
          <div class="column-label">Next Round</div>
          <div class="column-value">
            {#if currentRound === 6}
              0:00
            {:else if timeRemaining}
              {timeRemaining}
            {:else}
              0:00
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Test Mode Indicator -->
  {#if testMode}
    <div class="test-mode-banner">
      ⚠️ TEST MODE: Viewing as Round {currentRound}
      <a href="/brackets/live" class="exit-test">Exit Test Mode</a>
    </div>
  {/if}

  <!-- Results message for Saturday/Sunday -->
  {#if currentRound === 6}
    <div class="results-message">
      The tournament is over. Check back Monday for a new bracket!
    </div>

    <!-- Top 4 Results Container -->
    <div class="results-container">
      <!-- Results Content -->
      <div class="results-content">
        <!-- Champion (left half) -->
        <div class="champion-section">
          <h3 class="section-header">This week's champion</h3>
          {#if topFinishers.champion}
            <div class="finisher-card champion-card">
              <img
                src={topFinishers.champion.image_url}
                alt={topFinishers.champion.label}
              />
              <div class="finisher-details">
                <div class="finisher-label">
                  {topFinishers.champion.label}
                  <span class="finisher-seed"
                    >#{topFinishers.champion.seed}</span
                  >
                </div>
                {#if topFinishers.champion.sublabel}
                  <div class="finisher-sublabel">
                    {topFinishers.champion.sublabel}
                  </div>
                {/if}
                <div class="champion-picks">Picks: {championTotalVotes}</div>
              </div>
            </div>
          {/if}
        </div>

        <!-- Podium (right half) -->
        <div class="podium-section">
          <h3 class="section-header runner-ups-header">Runner Ups</h3>
          <div class="podium-grid">
            <!-- 2nd Place (top) -->
            <div class="podium-top">
              {#if topFinishers.second}
                <div class="finisher-card podium-card">
                  <div class="finisher-rank">2nd</div>
                  <img
                    src={topFinishers.second.image_url}
                    alt={topFinishers.second.label}
                  />
                  <div class="finisher-details">
                    <div class="finisher-label">
                      {topFinishers.second.label}
                      <span class="finisher-seed"
                        >#{topFinishers.second.seed}</span
                      >
                    </div>
                    {#if topFinishers.second.sublabel}
                      <div class="finisher-sublabel">
                        {topFinishers.second.sublabel}
                      </div>
                    {/if}
                  </div>
                </div>
              {/if}
            </div>

            <!-- 3rd and 4th Place (bottom row) -->
            <div class="podium-bottom">
              {#if topFinishers.third}
                <div class="finisher-card podium-card">
                  <div class="finisher-rank">3rd</div>
                  <img
                    src={topFinishers.third.image_url}
                    alt={topFinishers.third.label}
                  />
                  <div class="finisher-details">
                    <div class="finisher-label">
                      {topFinishers.third.label}
                      <span class="finisher-seed"
                        >#{topFinishers.third.seed}</span
                      >
                    </div>
                    {#if topFinishers.third.sublabel}
                      <div class="finisher-sublabel">
                        {topFinishers.third.sublabel}
                      </div>
                    {/if}
                  </div>
                </div>
              {/if}

              {#if topFinishers.fourth}
                <div class="finisher-card podium-card">
                  <div class="finisher-rank">4th</div>
                  <img
                    src={topFinishers.fourth.image_url}
                    alt={topFinishers.fourth.label}
                  />
                  <div class="finisher-details">
                    <div class="finisher-label">
                      {topFinishers.fourth.label}
                      <span class="finisher-seed"
                        >#{topFinishers.fourth.seed}</span
                      >
                    </div>
                    {#if topFinishers.fourth.sublabel}
                      <div class="finisher-sublabel">
                        {topFinishers.fourth.sublabel}
                      </div>
                    {/if}
                  </div>
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}

  {#if Object.keys(fullBracket).length > 0}
    <!-- Navigation Bar (Mobile & Desktop) -->
    <div class="nav-bar">
      <button
        class="nav-arrow nav-arrow-left"
        on:click={navigateBack}
        disabled={!canNavigateBack}
        aria-label="Previous rounds"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 18L9 12L15 6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <!-- Mobile: Single round header -->
      <div class="mobile-round-header">
        {#each visibleRounds as roundNum}
          {#if roundNum && roundNum === effectiveRound}
            <h2>{roundNames[roundNum] || `Round ${roundNum}`}</h2>
            <span class="round-date">{getRoundDate(roundNum)}</span>
          {:else if roundNum === 6 && effectiveRound >= 5}
            <h2>{roundNames[6]}</h2>
            <span class="round-date"
              >{currentRound === 6 ? getRoundDate(5) : "TBD"}</span
            >
          {/if}
        {/each}
      </div>

      <!-- Desktop: All three round headers -->
      <div class="desktop-round-headers">
        {#each visibleRounds as roundNum}
          {#if roundNum === 6}
            <div class="round-nav-item">
              <h2>{roundNames[6]}</h2>
              <span class="round-date"
                >{currentRound === 6 ? getRoundDate(5) : "TBD"}</span
              >
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
        on:click={navigateForward}
        disabled={!canNavigateForward}
        aria-label="Next rounds"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 18L15 12L9 6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>

    <div class="bracket-wrapper">
      <div class="bracket-container" class:compact={$bracketView === "compact"}>
        {#each visibleRounds as roundNum, idx}
          {#if roundNum === 6}
            <!-- Special Champion Column -->
            <div
              class="round-container champion-column"
              class:results-mode={currentRound === 6}
              class:mobile-visible={roundNum === 6 &&
                (effectiveRound >= 5 || currentRound === 6)}
            >
              <div class="round-header">
                <h2>{roundNames[6]}</h2>
                <span class="round-date"
                  >{currentRound === 6 ? getRoundDate(5) : "TBD"}</span
                >
              </div>
              <div class="matchups-column">
                {#if currentRound === 6 && topFinishers.champion}
                  <div class="champion-display">
                    <div class="champion-trophy">🏆</div>
                    <img
                      src={topFinishers.champion.image_url}
                      alt={topFinishers.champion.label}
                    />
                    <div class="champion-info">
                      <div class="champion-name">
                        {topFinishers.champion.label}
                      </div>
                      <div class="champion-seed">
                        Seed #{topFinishers.champion.seed}
                      </div>
                      {#if topFinishers.champion.sublabel}
                        <div class="champion-sublabel">
                          {topFinishers.champion.sublabel}
                        </div>
                      {/if}
                      <div class="champion-votes">
                        {championTotalVotes} total votes
                      </div>
                    </div>
                  </div>
                {:else}
                  <div class="champion-tbd">
                    <div class="tbd-trophy">🏆</div>
                    <div class="tbd-text">Champion TBD</div>
                  </div>
                {/if}
              </div>
            </div>
          {:else if roundNum}
            {@const matchups = getDisplayMatchups(roundNum)}
            {#if matchups && matchups.length > 0}
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
                  {#each matchups as matchup}
                    <div
                      class="matchup-card"
                      class:current={currentRound == roundNum &&
                        currentRound !== 6}
                      class:voted={votedMatchups.has(matchup.id) ||
                        currentRound === 6}
                      class:results-mode={currentRound === 6}
                    >
                      <div
                        class="item"
                        class:winner={matchup.winnerId === matchup.item1.id}
                        class:loser={matchup.winnerId &&
                          matchup.winnerId !== matchup.item1.id}
                        class:selected={selections.get(matchup.id) ===
                          matchup.item1.id}
                        class:leading={currentRound == roundNum &&
                          matchup.item1Votes > matchup.item2Votes}
                        class:trailing={currentRound == roundNum &&
                          matchup.item1Votes < matchup.item2Votes}
                        class:show-results={roundNum <= currentRound ||
                          votedMatchups.has(matchup.id) ||
                          currentRound === 6}
                        on:click={() =>
                          currentRound !== 6 &&
                          handleSelect(
                            matchup.id,
                            matchup.item1.id,
                            Number(roundNum)
                          )}
                        on:keydown={(e) =>
                          currentRound !== 6 &&
                          e.key === "Enter" &&
                          handleSelect(
                            matchup.id,
                            matchup.item1.id,
                            Number(roundNum)
                          )}
                        role="button"
                        tabindex="0"
                      >
                        <div
                          class="percentage-fill"
                          style="width: {matchup.item1Percentage}%"
                        />
                        <span class="seed">{matchup.item1.seed}</span>
                        <div class="item-content">
                          <div class="image-wrapper">
                            <img
                              src={matchup.item1.image_url}
                              alt={matchup.item1.label}
                            />
                            {#if matchup.item1.audio_url}
                              <SoundCloudPlayer
                                bind:this={audioPlayers[matchup.item1.id]}
                                trackId={matchup.item1.audio_url}
                                on:play={() =>
                                  (activeAudioItemId = matchup.item1.id)}
                                on:pause={() => {
                                  if (activeAudioItemId === matchup.item1.id)
                                    activeAudioItemId = null;
                                }}
                              />
                              <button
                                class="play-button"
                                on:click|stopPropagation={() =>
                                  handleTogglePlay(matchup.item1)}
                              >
                                {#if activeAudioItemId === matchup.item1.id}
                                  <svg
                                    width="35"
                                    height="35"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M6 19H10V5H6V19ZM14 5V19H18V5H14Z"
                                      fill="white"
                                    />
                                  </svg>
                                {:else}
                                  <svg
                                    width="35"
                                    height="35"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path d="M8 5V19L19 12L8 5Z" fill="white" />
                                  </svg>
                                {/if}
                              </button>
                            {/if}
                          </div>
                          <div class="item-details">
                            <span class="label">{matchup.item1.label}</span>
                            {#if matchup.item1.sublabel}
                              <span class="sublabel"
                                >{matchup.item1.sublabel}</span
                              >
                            {/if}
                          </div>
                        </div>
                      </div>
                      <div
                        class="item"
                        class:winner={matchup.winnerId === matchup.item2.id}
                        class:loser={matchup.winnerId &&
                          matchup.winnerId !== matchup.item2.id}
                        class:selected={selections.get(matchup.id) ===
                          matchup.item2.id}
                        class:leading={currentRound == roundNum &&
                          matchup.item2Votes > matchup.item1Votes}
                        class:trailing={currentRound == roundNum &&
                          matchup.item2Votes < matchup.item1Votes}
                        class:show-results={roundNum <= currentRound ||
                          votedMatchups.has(matchup.id) ||
                          currentRound === 6}
                        on:click={() =>
                          currentRound !== 6 &&
                          handleSelect(
                            matchup.id,
                            matchup.item2.id,
                            Number(roundNum)
                          )}
                        on:keydown={(e) =>
                          currentRound !== 6 &&
                          e.key === "Enter" &&
                          handleSelect(
                            matchup.id,
                            matchup.item2.id,
                            Number(roundNum)
                          )}
                        role="button"
                        tabindex="0"
                      >
                        <div
                          class="percentage-fill"
                          style="width: {matchup.item2Percentage}%"
                        />
                        <span class="seed">{matchup.item2.seed}</span>
                        <div class="item-content">
                          <div class="image-wrapper">
                            <img
                              src={matchup.item2.image_url}
                              alt={matchup.item2.label}
                            />
                            {#if matchup.item2.audio_url}
                              <SoundCloudPlayer
                                bind:this={audioPlayers[matchup.item2.id]}
                                trackId={matchup.item2.audio_url}
                                on:play={() =>
                                  (activeAudioItemId = matchup.item2.id)}
                                on:pause={() => {
                                  if (activeAudioItemId === matchup.item2.id)
                                    activeAudioItemId = null;
                                }}
                              />
                              <button
                                class="play-button"
                                on:click|stopPropagation={() =>
                                  handleTogglePlay(matchup.item2)}
                              >
                                {#if activeAudioItemId === matchup.item2.id}
                                  <svg
                                    width="35"
                                    height="35"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M6 19H10V5H6V19ZM14 5V19H18V5H14Z"
                                      fill="white"
                                    />
                                  </svg>
                                {:else}
                                  <svg
                                    width="35"
                                    height="35"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path d="M8 5V19L19 12L8 5Z" fill="white" />
                                  </svg>
                                {/if}
                              </button>
                            {/if}
                          </div>
                          <div class="item-details">
                            <span class="label">{matchup.item2.label}</span>
                            {#if matchup.item2.sublabel}
                              <span class="sublabel"
                                >{matchup.item2.sublabel}</span
                              >
                            {/if}
                          </div>
                        </div>
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
          {/if}
        {/each}
      </div>
    </div>

    {#if currentRound > 0 && currentRound !== 6 && !hasVotedInCurrentRound && !isSubmitting}
      <div class="submit-bar">
        <span>{selections.size}/{matchupsInCurrentRound} picks</span>
        <button on:click={handleSubmitVotes} disabled={selections.size === 0}
          >Submit</button
        >
      </div>
    {:else if currentRound > 0 && hasVotedInCurrentRound}
      <!-- Mobile votes submitted bar -->
      <div class="votes-submitted-bar mobile-only">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"
            fill="currentColor"
          />
        </svg>
        <span
          >Your votes are in for {roundNames[currentRound] ||
            `Round ${currentRound}`}!</span
        >
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
    padding-bottom: 6rem; /* Extra space for fixed submit bar */
    color: #fff;
    max-width: 100%;
    overflow-x: hidden;
  }
  .bracket-header {
    background: #000;
    border: 1px solid #666;
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
    margin: 0 auto 1rem auto;
    max-width: 600px;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 1rem;
    align-items: center;
  }

  .desktop-stats {
    display: flex;
    gap: 1rem;
  }

  .mobile-stats {
    display: none;
  }

  .header-column {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .title-column {
    align-items: flex-start;
  }

  .votes-column,
  .timer-column {
    align-items: center;
    text-align: center;
  }

  .bracket-header h1 {
    font-size: 1.4rem;
    margin: 0;
    color: #fff;
    font-weight: 600;
  }

  .column-label {
    font-size: 0.75rem;
    color: #aaa;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .column-value {
    font-size: 1.2rem;
    color: #cbff70;
    font-weight: 700;
    font-family: "Courier New", monospace;
  }

  .timer-column .column-value {
    color: #ff4444;
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

  .results-message {
    background-color: #dc3545;
    color: #fff;
    text-align: center;
    padding: 0.75rem 1rem;
    margin: 0 auto 1rem auto;
    border-radius: 8px;
    font-weight: 600;
    max-width: 600px;
  }

  .results-container {
    max-width: 1000px;
    margin: 0 auto 1rem auto;
  }

  .mobile-only {
    display: none;
  }

  .results-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    align-items: stretch;
  }

  .champion-section {
    display: flex;
    flex-direction: column;
  }

  .champion-section .finisher-card {
    margin-top: 0.5rem;
  }

  .podium-section {
    display: flex;
    flex-direction: column;
  }

  .podium-grid {
    display: grid;
    grid-template-rows: 1fr 1fr;
    gap: 1rem;
    flex: 1;
    margin-top: 0.5rem;
  }

  .podium-bottom {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .podium-top {
    display: flex;
    flex-direction: column;
  }

  .podium-bottom {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .finisher-card {
    background-color: #333;
    border-radius: 8px;
    padding: 0.75rem;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    text-align: left;
    position: relative;
    gap: 0.75rem;
  }

  .champion-card {
    height: 100%;
    padding: 1rem 0.75rem;
    justify-content: space-between;
  }

  .podium-card {
    height: 100%;
  }

  .finisher-rank {
    position: absolute;
    bottom: 0.5rem;
    right: 0.5rem;
    background-color: #cbff70;
    color: #000;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .finisher-card img {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    object-fit: cover;
    flex-shrink: 0;
  }

  .champion-card img {
    width: 200px;
    height: 200px;
    border: 1px solid #cbff70;
    border-radius: 8px;
    object-fit: cover;
  }

  .finisher-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
    justify-content: center;
  }

  .finisher-label {
    font-size: 1rem;
    font-weight: 600;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .champion-card .finisher-label {
    font-size: 1.2rem;
  }

  .finisher-label .finisher-seed {
    font-size: inherit;
    color: #888;
    font-weight: 500;
    margin-left: 0.5rem;
  }

  .finisher-sublabel {
    font-size: 0.8rem;
    color: #aaa;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .finisher-seed {
    font-size: 0.75rem;
    color: #888;
    font-weight: 500;
  }

  .champion-picks {
    font-size: 0.9rem;
    color: #cbff70;
    font-weight: 600;
    margin-top: 0.5rem;
  }

  .section-header {
    font-size: 1.1rem;
    font-weight: 600;
    color: #fff;
    margin: 0;
    text-align: left;
  }

  .runner-ups-header {
    font-weight: 400;
  }

  .status-pill {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
    white-space: nowrap;
  }

  .status-pill.error {
    background-color: #dc3545;
    color: #fff;
  }

  .status-pill.voted {
    background-color: #28a745;
    color: #fff;
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

  .desktop-only {
    display: flex;
  }

  .mobile-only {
    display: none;
  }

  .votes-column,
  .timer-column {
    display: flex;
  }

  /* Navigation Bar - Desktop styles */
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

  .bracket-wrapper {
    display: block;
    margin-bottom: 2rem;
    max-width: 1500px;
    margin-left: auto;
    margin-right: auto;
  }

  .nav-arrow {
    background-color: #333;
    border: none;
    color: #cbff70;
    padding: 0.5rem;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    visibility: visible;
    opacity: 1;
  }

  .nav-arrow:hover:not(:disabled) {
    background-color: #444;
    transform: scale(1.1);
  }

  .nav-arrow:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    visibility: visible;
    display: flex;
  }

  .bracket-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    flex: 1;
  }
  .round-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  .round-container h2 {
    text-align: center;
    font-size: 1.2rem;
    margin-bottom: 0.1rem; /* Reduced space */
    color: #aaa;
  }
  .round-header {
    margin-bottom: 1rem;
  }
  .round-date {
    font-size: 0.8rem; /* Smaller text */
    color: #777; /* More greyed out */
    display: none; /* Hidden on mobile by default */
  }
  .matchups-column {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    justify-content: space-around;
    height: 100%;
  }
  .matchup-card {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 250px; /* Default width for desktop */
    overflow: visible; /* Allow seeds to show outside */
  }
  .item {
    background: linear-gradient(
      135deg,
      rgba(40, 40, 40, 0.9) 0%,
      rgba(20, 20, 20, 0.95) 100%
    );
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 0;
    border-radius: 10px;
    position: relative; /* For z-indexing content above the fill */
    transition: all 0.2s ease;
    overflow: visible; /* Allow seed to show outside */
    min-height: 68px;
    box-shadow:
      inset 0 1px 1px rgba(255, 255, 255, 0.1),
      inset 0 4px 12px rgba(0, 0, 0, 0.6),
      inset 0 -1px 2px rgba(255, 255, 255, 0.08),
      0 2px 8px rgba(0, 0, 0, 0.3);
  }
  .seed {
    position: absolute;
    left: -2rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.85rem;
    color: #888;
    width: 1.5rem;
    text-align: right;
    flex-shrink: 0;
    z-index: 3;
  }
  .item-content {
    display: flex;
    align-items: stretch;
    width: 100%;
    position: relative;
    z-index: 2;
    min-height: 68px;
    overflow: hidden; /* Clip percentage fill within content */
    border-radius: 10px;
  }
  .image-wrapper {
    position: relative;
    flex-shrink: 0;
    width: 68px;
    height: 100%;
    padding: 4px;
  }
  .item.winner {
    font-weight: bold;
    background: rgba(42, 42, 42, 0.8);
  }
  .item.winner .item-content {
    border-radius: 10px;
  }
  .item.loser {
    opacity: 0.6;
  }
  .image-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    border-radius: 6px;
  }
  .item-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    overflow: hidden;
    text-align: left;
    flex-grow: 1;
    padding: 0.5rem;
    justify-content: center;
  }
  .label {
    font-size: 0.95rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .sublabel {
    font-size: 0.8rem;
    color: #888;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .play-button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    transition: opacity 0.2s;
    z-index: 4;
  }
  .play-button:hover {
    opacity: 0.8;
  }
  .item.selected {
    border: 2px solid #cbff70;
    box-shadow:
      inset 0 1px 1px rgba(255, 255, 255, 0.1),
      inset 0 4px 12px rgba(0, 0, 0, 0.6),
      inset 0 -1px 2px rgba(255, 255, 255, 0.08),
      0 2px 8px rgba(0, 0, 0, 0.3),
      0 0 20px rgba(203, 255, 112, 0.3);
  }
  .submit-bar {
    position: fixed;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    background-color: #cbff70;
    color: #121212;
    padding: 0.65rem 1rem;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    width: auto;
    min-width: 200px;
    max-width: 300px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
    z-index: 100;
    font-weight: 600;
    font-size: 0.95rem;
  }
  .submit-bar button {
    background-color: #121212;
    color: #cbff70;
    border: none;
    padding: 0.4rem 1.25rem;
    border-radius: 20px;
    font-weight: 600;
    cursor: pointer;
    font-size: 0.9rem;
    transition:
      background-color 0.2s,
      color 0.2s;
  }
  .submit-bar button:disabled {
    background-color: #333;
    color: #777;
    cursor: not-allowed;
  }

  .round-selector {
    display: none;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }
  .round-selector button {
    background-color: #333;
    color: #fff;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  .round-selector button:hover {
    background-color: #444;
  }
  .round-selector button.active {
    background-color: #cbff70;
    color: #121212;
  }
  .round-selector button:disabled {
    background-color: #2a2a2a;
    color: #555;
    cursor: not-allowed;
  }

  .matchup-card.current .item {
    cursor: pointer;
  }
  .matchup-card.current .item:hover {
    background-color: #2a2a2a;
  }
  .matchup-card.voted .item {
    cursor: default;
    pointer-events: none;
  }

  .percentage-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background-color: #4a4a4a; /* Loser/trailing color */
    opacity: 0; /* Hidden by default */
    z-index: 1;
    border-radius: 10px;
    transition:
      width 0.3s ease,
      opacity 0.3s ease;
  }

  .item.show-results .percentage-fill {
    opacity: 0.7;
  }

  .item.winner .percentage-fill,
  .item.leading.show-results .percentage-fill {
    background-color: #2e7d32; /* Winner/leading color */
  }

  .round-container.active-round .round-header h2 {
    color: #cbff70;
  }

  .round-container.results-mode .round-header h2 {
    color: #fff;
  }

  .matchup-card.results-mode .item {
    cursor: default;
    pointer-events: none;
  }

  .matchup-card.results-mode .item.winner {
    background-color: #2e7d32;
    border-color: #4caf50;
  }

  /* Champion Column Styles */
  .champion-column {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .champion-display {
    background-color: #1e1e1e;
    border: 2px solid #cbff70;
    border-radius: 12px;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    text-align: center;
  }

  .champion-trophy {
    font-size: 3rem;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }

  .champion-display img {
    width: 150px;
    height: 150px;
    border-radius: 12px;
    object-fit: cover;
    border: 3px solid #cbff70;
  }

  .champion-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .champion-name {
    font-size: 1.5rem;
    font-weight: 700;
    color: #cbff70;
  }

  .champion-seed {
    font-size: 1rem;
    color: #888;
  }

  .champion-sublabel {
    font-size: 0.9rem;
    color: #aaa;
  }

  .champion-votes {
    font-size: 1.1rem;
    color: #fff;
    font-weight: 600;
    margin-top: 0.5rem;
  }

  .champion-tbd {
    background-color: #1e1e1e;
    border: 2px dashed #666;
    border-radius: 12px;
    padding: 3rem 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    text-align: center;
  }

  .tbd-trophy {
    font-size: 3rem;
    opacity: 0.3;
  }

  .tbd-text {
    font-size: 1.2rem;
    color: #666;
    font-weight: 600;
  }

  /* TBD Round Styles */
  .tbd-round .item {
    cursor: default;
    pointer-events: none;
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

    /* Mobile navigation bar */
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

    .nav-bar .nav-arrow {
      margin-top: 0;
      width: 44px;
      height: 44px;
      flex-shrink: 0;
    }

    .desktop-only {
      display: none !important;
    }

    .mobile-only {
      display: flex;
    }

    .bracket-header {
      padding: 0.4rem 0.75rem;
      margin: 0.5rem 1rem 0.75rem 1rem;
      max-width: none;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      text-align: left;
    }

    .title-column {
      align-items: flex-start;
    }

    .desktop-stats {
      display: none;
    }

    .mobile-stats {
      display: flex;
      gap: 1rem;
      justify-content: space-between;
    }

    .bracket-header h1 {
      font-size: 1rem;
      margin: 0;
    }

    .column-value {
      font-size: 0.95rem;
    }

    .column-label {
      font-size: 0.65rem;
    }

    .test-mode-banner {
      padding: 0.5rem 0.75rem;
      font-size: 0.85rem;
      margin: 0 0 1rem 0;
      flex-direction: column;
      gap: 0.5rem;
    }

    .results-message {
      padding: 0.5rem 0.75rem;
      font-size: 0.9rem;
      margin: 0 0 1rem 0;
    }

    .results-container {
      margin: 0 0 1rem 0;
    }

    .mobile-only {
      display: block;
      margin-bottom: 0.75rem;
    }

    .podium-section .section-header {
      margin-bottom: 0;
    }

    .results-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .podium-section {
      gap: 1rem;
    }

    .podium-grid {
      gap: 1rem;
      display: flex;
      flex-direction: column;
      margin-top: -1rem;
    }

    .podium-top {
      flex: 1;
    }

    .podium-bottom {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      flex: 1;
    }

    .podium-bottom .finisher-card {
      flex: 1;
    }

    .finisher-card {
      padding: 0.75rem;
    }

    .champion-card {
      padding: 0.75rem;
      justify-content: space-between;
    }

    .finisher-card img {
      width: 50px;
      height: 50px;
    }

    .champion-card img {
      width: 150px;
      height: 150px;
      border: 1px solid #cbff70;
      border-radius: 8px;
      object-fit: cover;
    }

    .finisher-label {
      font-size: 0.9rem;
    }

    .champion-card .finisher-label {
      font-size: 1.1rem;
    }

    .section-header {
      font-size: 1rem;
      margin: 0;
      height: 2rem;
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

    .matchup-card {
      width: 75%;
      max-width: none;
      margin: 0;
      position: relative;
      gap: 1rem;
    }

    /* Bracket connector lines on mobile */
    /* Horizontal lines from each item to the vertical connector */
    .matchup-card .item::after {
      content: "";
      position: absolute;
      right: -30px;
      top: 50%;
      transform: translateY(-50%);
      width: 30px;
      height: 2px;
      background-color: #666;
      pointer-events: none;
      z-index: 1;
    }

    /* Vertical line connecting the two items */
    .matchup-card::before {
      content: "";
      position: absolute;
      right: -30px;
      top: 50%;
      transform: translateY(-50%);
      width: 2px;
      height: calc(100% - 4.7rem);
      background-color: #666;
      pointer-events: none;
      z-index: 0;
    }

    /* Horizontal line extending from center to the right (off screen) */
    .matchup-card::after {
      content: "";
      position: absolute;
      left: 111.5%;
      top: 50%;
      transform: translateY(-50%);
      width: 200px;
      height: 2px;
      background-color: #666;
      pointer-events: none;
      z-index: 1;
    }

    /* Ensure seeds are visible on mobile with proper spacing */
    .seed {
      left: -2rem;
      font-size: 0.8rem;
      width: 1.5rem;
    }

    .item {
      min-height: 75px;
    }

    .item-content {
      min-height: 75px;
    }

    .image-wrapper {
      width: 75px;
    }

    .champion-display {
      padding: 1.5rem;
    }

    .champion-display img {
      width: 120px;
      height: 120px;
    }

    .champion-name {
      font-size: 1.2rem;
    }

    .champion-trophy {
      font-size: 2.5rem;
    }

    /* Submit bar in bottom right on mobile */
    .submit-bar {
      position: fixed;
      bottom: 1rem;
      right: 1rem;
      left: auto;
      transform: none;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      min-width: auto;
      width: auto;
      padding: 0.75rem 1rem;
    }

    .submit-bar span {
      font-size: 0.85rem;
    }

    .submit-bar button {
      width: 100%;
      padding: 0.5rem 1.5rem;
    }
  }

  /* Desktop Styles */
  @media (min-width: 900px) {
    .round-header {
      display: none; /* Hidden on desktop - shown in nav bar instead */
    }
  }

  .bracket-container.compact .matchups-column {
    justify-content: flex-start;
    gap: 1rem;
  }
</style>
