<script>
  import { onMount, onDestroy } from "svelte";
  import moment from "moment-timezone";
  import SoundCloudPlayer from "../../../components/SoundCloudPlayer.svelte";

  /** @type {import('./$types').PageData} */
  export let data;

  let { bracket, fullBracket, currentRound, pageError, userVoteMap } = data;

  let displayedRound = currentRound > 0 ? currentRound : 1;
  let votedMatchups = new Set(userVoteMap.keys());
  let selections = new Map(); // Map<matchupId, itemId>
  let isSubmitting = false;
  let timeRemaining = "";
  let intervalId;

  let audioPlayers = {};
  let activeAudioItemId = null;

  const roundNames = {
    1: "Round 1",
    2: "Sweet Sixteen",
    3: "Elite Eight",
    4: "Final Four",
    5: "Friday Finals",
  };

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

  onMount(() => {
    updateCountdown();
    intervalId = setInterval(updateCountdown, 1000);
    return () => clearInterval(intervalId);
  });

  function setDisplayedRound(round) {
    displayedRound = parseInt(round);
  }

  function handleSelect(matchupId, chosenItemId) {
    if (votedMatchups.has(matchupId)) return;

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
          userVoteMap.set(matchupId, chosenItemId);
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
      <h1>{bracket.title}</h1>
      {#if pageError}
        <p class="page-error">{pageError}</p>
      {:else if currentRound > 0}
        <div class="status-container">
          {#if !hasVotedInCurrentRound}
            <p>
              Vote for your favorite songs, everyday. Winners move on every 24
              hours.
            </p>
          {:else}
            <p>Your votes are in!</p>
          {/if}
          <p>Next round starts in:</p>
          <p class="countdown">{timeRemaining}</p>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Round selector for mobile -->
  <div class="round-selector">
    {#each Object.keys(fullBracket) as roundNum}
      <button
        class:active={displayedRound == roundNum}
        on:click={() => setDisplayedRound(roundNum)}
        disabled={roundNum > currentRound && currentRound > 0}
      >
        {roundNum == 5 ? "Final" : `R${roundNum}`}
      </button>
    {/each}
  </div>

  {#if Object.keys(fullBracket).length > 0}
    <div class="bracket-container">
      {#each Object.entries(fullBracket) as [roundNum, matchups]}
        <div
          class="round-container"
          id="round-{roundNum}"
          data-displayed-mobile={displayedRound == roundNum}
          class:active-round={currentRound == roundNum}
        >
          <div class="round-header">
            <h2>{roundNames[roundNum] || `Round ${roundNum}`}</h2>
            <span class="round-date">{getRoundDate(roundNum)}</span>
          </div>
          <div class="matchups-column">
            {#each matchups as matchup}
              <div
                class="matchup-card"
                class:current={currentRound == roundNum}
                class:voted={votedMatchups.has(matchup.id)}
              >
                <div
                  class="item"
                  class:winner={matchup.winnerId === matchup.item1.id}
                  class:selected={selections.get(matchup.id) ===
                    matchup.item1.id ||
                    userVoteMap.get(matchup.id) === matchup.item1.id}
                  class:leading={currentRound == roundNum &&
                    matchup.item1Votes > matchup.item2Votes}
                  class:trailing={currentRound == roundNum &&
                    matchup.item1Votes < matchup.item2Votes}
                  class:show-results={roundNum < currentRound ||
                    votedMatchups.has(matchup.id)}
                  on:click={() => handleSelect(matchup.id, matchup.item1.id)}
                  on:keydown={(e) =>
                    e.key === "Enter" &&
                    handleSelect(matchup.id, matchup.item1.id)}
                  role="button"
                  tabindex="0"
                >
                  <div
                    class="percentage-fill"
                    style="width: {matchup.item1Percentage}%"
                  />
                  <div class="item-content">
                    <span class="seed">{matchup.item1.seed}</span>
                    <img
                      src={matchup.item1.image_url}
                      alt={matchup.item1.label}
                    />
                    <div class="item-details">
                      <span class="label">{matchup.item1.label}</span>
                      {#if matchup.item1.sublabel}
                        <span class="sublabel">{matchup.item1.sublabel}</span>
                      {/if}
                    </div>
                    {#if matchup.item1.audio_url}
                      <SoundCloudPlayer
                        bind:this={audioPlayers[matchup.item1.id]}
                        trackId={matchup.item1.audio_url}
                        on:play={() => (activeAudioItemId = matchup.item1.id)}
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
                            width="20"
                            height="20"
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
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M8 5V19L19 12L8 5Z" fill="white" />
                          </svg>
                        {/if}
                      </button>
                    {:else}
                      <div class="play-button-placeholder" />
                    {/if}
                  </div>
                </div>
                <div
                  class="item"
                  class:winner={matchup.winnerId === matchup.item2.id}
                  class:selected={selections.get(matchup.id) ===
                    matchup.item2.id ||
                    userVoteMap.get(matchup.id) === matchup.item2.id}
                  class:leading={currentRound == roundNum &&
                    matchup.item2Votes > matchup.item1Votes}
                  class:trailing={currentRound == roundNum &&
                    matchup.item2Votes < matchup.item1Votes}
                  class:show-results={roundNum < currentRound ||
                    votedMatchups.has(matchup.id)}
                  on:click={() => handleSelect(matchup.id, matchup.item2.id)}
                  on:keydown={(e) =>
                    e.key === "Enter" &&
                    handleSelect(matchup.id, matchup.item2.id)}
                  role="button"
                  tabindex="0"
                >
                  <div
                    class="percentage-fill"
                    style="width: {matchup.item2Percentage}%"
                  />
                  <div class="item-content">
                    <span class="seed">{matchup.item2.seed}</span>
                    <img
                      src={matchup.item2.image_url}
                      alt={matchup.item2.label}
                    />
                    <div class="item-details">
                      <span class="label">{matchup.item2.label}</span>
                      {#if matchup.item2.sublabel}
                        <span class="sublabel">{matchup.item2.sublabel}</span>
                      {/if}
                    </div>
                    {#if matchup.item2.audio_url}
                      <SoundCloudPlayer
                        bind:this={audioPlayers[matchup.item2.id]}
                        trackId={matchup.item2.audio_url}
                        on:play={() => (activeAudioItemId = matchup.item2.id)}
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
                            width="20"
                            height="20"
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
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M8 5V19L19 12L8 5Z" fill="white" />
                          </svg>
                        {/if}
                      </button>
                    {:else}
                      <div class="play-button-placeholder" />
                    {/if}
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>

    {#if currentRound > 0 && !hasVotedInCurrentRound && !isSubmitting}
      <div class="submit-bar">
        <span>
          {#if selections.size > 0}
            {selections.size}/{matchupsInCurrentRound} picks selected
          {:else}
            Make your picks for Round {currentRound}
          {/if}
        </span>
        <button on:click={handleSubmitVotes} disabled={selections.size === 0}
          >Submit</button
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
    color: #fff;
    max-width: 100%;
    overflow-x: auto;
  }
  .bracket-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  .page-error {
    background-color: #333;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    display: inline-block;
  }
  .bracket-container {
    display: flex;
    gap: 2rem;
    margin-bottom: 2rem; /* Add space for the submit bar */
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
    background-color: #1e1e1e;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 0.75rem 0.75rem 0.75rem 0;
    width: 250px; /* Default width for desktop */
    transition: all 0.2s ease;
    overflow: hidden; /* For the background fill */
  }
  .item {
    padding: 0.5rem 0.5rem 0.5rem 0;
    border-radius: 4px;
    position: relative; /* For z-indexing content above the fill */
    border: 2px solid transparent; /* Add transparent border */
  }
  .item-content {
    display: flex;
    align-items: center;
    width: 100%;
    position: relative;
    z-index: 2;
  }
  .item:first-child {
    margin-bottom: 0.5rem;
    border-bottom: 1px solid #2a2a2a;
  }
  .item.winner {
    font-weight: bold;
    background-color: #2a2a2a;
  }
  .seed {
    font-size: 0.8rem;
    color: #888;
    width: 2rem;
    text-align: right;
    flex-shrink: 0;
    margin-right: 0.5rem;
  }
  .item img {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    object-fit: cover;
    flex-shrink: 0;
    margin-right: 0.5rem;
  }
  .item-details {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    text-align: left;
    flex-grow: 1; /* Allow details to take up space */
  }
  .label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .sublabel {
    font-size: 0.7rem;
    color: #888;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .play-button,
  .play-button-placeholder {
    background: transparent;
    border: none;
    padding: 0;
    margin-left: auto;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    transition: background-color 0.2s;
  }

  .play-button-placeholder {
    cursor: default;
  }
  .play-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  .item.selected {
    border-color: #cbff70; /* Change color on selection */
  }
  .submit-bar {
    position: sticky;
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
    background-color: #cbff70;
    color: #121212;
    padding: 1rem;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: calc(100% - 2rem);
    max-width: 500px;
    margin: 1.5rem auto 0;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  }
  .submit-bar button {
    background-color: #121212;
    color: #cbff70;
    border: none;
    padding: 0.5rem 1.5rem;
    border-radius: 20px;
    font-weight: 600;
    cursor: pointer;
    transition:
      background-color 0.2s,
      color 0.2s;
  }
  .submit-bar button:disabled {
    background-color: #333;
    color: #777;
    cursor: not-allowed;
  }

  .status-container {
    margin-top: 1rem;
    padding: 0.75rem;
  }
  .countdown {
    font-size: 1.5rem;
    font-weight: 600;
    color: #cbff70;
    margin-top: 0.25rem;
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

  /* Mobile Styles */
  @media (max-width: 899px) {
    .bracket-container {
      flex-direction: column;
      gap: 0;
    }
    .round-selector {
      display: flex;
    }
    .round-container {
      display: none;
    }
    .round-container[data-displayed-mobile="true"] {
      display: flex;
    }
    .round-container h2 {
      display: none;
    }
    .round-date {
      display: block; /* Show on mobile */
    }
    .matchups-column {
      align-items: center;
    }
    .matchup-card {
      width: 300px; /* Wider on mobile */
    }
  }

  /* Desktop Styles */
  @media (min-width: 900px) {
    .round-date {
      display: block; /* Show on desktop */
    }
  }
</style>
