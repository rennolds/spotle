<script>
  import SoundCloudPlayer from "../../../../components/SoundCloudPlayer.svelte";
  import { bracketRoundGradient } from "../../../store.js";

  /** @type {import('./$types').PageData} */
  export let data;

  let { bracket, items, fullBracket } = data;

  const itemsById = new Map(items.map((item) => [item.id, item]));
  const tbdItem = {
    id: "TBD",
    label: "TBD",
    seed: "",
    image_url: "/resources/cd.png",
  };

  let userPicks = new Map();
  let userBracket = JSON.parse(JSON.stringify(fullBracket));

  let audioPlayers = {};
  let activeAudioItemId = null;

  let displayedRound = 1;

  const roundNames = {
    1: "Round 1",
    2: "Sweet Sixteen",
    3: "Elite Eight",
    4: "Final Four",
    5: "The Finals",
  };

  // Round-specific gradients
  const roundGradients = {
    1: "linear-gradient(180deg, #48937D 0%, rgba(18, 18, 18, 0) 39.9%)",
    2: "linear-gradient(180deg, #5D5D00 0%, rgba(18, 18, 18, 0) 39.9%)",
    3: "linear-gradient(180deg, #B200A7 0%, rgba(18, 18, 18, 0) 39.9%)",
    4: "linear-gradient(180deg, #364460 0%, rgba(53, 68, 95, 0) 39.9%)",
    5: "linear-gradient(180deg, #6D6D6D 0%, rgba(109, 109, 109, 0) 39.9%)",
  };

  // Update the gradient store when the displayed round changes
  $: $bracketRoundGradient = roundGradients[displayedRound] || roundGradients[1];

  function updateBracketWithPicks() {
    const newBracket = JSON.parse(JSON.stringify(fullBracket));
    for (let roundNum = 2; roundNum <= 5; roundNum++) {
      const prevRoundMatchups = newBracket[roundNum - 1];
      const currentRoundMatchups = newBracket[roundNum];
      if (!prevRoundMatchups || !currentRoundMatchups) continue;

      for (let i = 0; i < currentRoundMatchups.length; i++) {
        const parentMatchup1 = prevRoundMatchups[i * 2];
        const parentMatchup2 = prevRoundMatchups[i * 2 + 1];
        const winner1Id = userPicks.get(parentMatchup1.id);
        const winner2Id = userPicks.get(parentMatchup2.id);
        currentRoundMatchups[i].item1 = itemsById.get(winner1Id) || tbdItem;
        currentRoundMatchups[i].item2 = itemsById.get(winner2Id) || tbdItem;
      }
    }
    userBracket = newBracket;
  }

  function handleSelect(matchup, chosenItemId) {
    if (userPicks.get(matchup.id) === chosenItemId) {
      userPicks.delete(matchup.id);
    } else {
      userPicks.set(matchup.id, chosenItemId);
    }
    userPicks = new Map(userPicks);
    updateBracketWithPicks();
  }

  function setDisplayedRound(round) {
    displayedRound = parseInt(round);
  }

  function advanceToNextRound() {
    if (displayedRound < 5) {
      setDisplayedRound(displayedRound + 1);
    } else {
      // Logic to show champion view, handled by the reactive `champion` variable
    }
  }

  $: matchupsInCurrentRound = userBracket[displayedRound] || [];
  $: allPicksMadeInCurrentRound = matchupsInCurrentRound.every((m) =>
    userPicks.has(m.id)
  );

  $: champion =
    userPicks.has(userBracket[5]?.[0]?.id) &&
    itemsById.get(userPicks.get(userBracket[5][0].id));

  function handleTogglePlay(item) {
    if (!item || item.id === "TBD") return;
    if (activeAudioItemId === item.id) {
      audioPlayers[item.id]?.pause();
    } else {
      if (activeAudioItemId) {
        audioPlayers[activeAudioItemId]?.pause();
      }
      audioPlayers[item.id]?.play();
    }
  }
</script>

<div class="gallery-bracket-page">
  <div class="bracket-header">
    <h1>{bracket.title}</h1>
    <p>Make your personal picks for this bracket.</p>
  </div>

  <!-- Round selector for mobile -->
  <div class="round-selector">
    {#each Object.keys(userBracket) as roundNum}
      <button
        class:active={displayedRound == roundNum}
        on:click={() => setDisplayedRound(roundNum)}
      >
        {roundNum == 5 ? "Final" : `R${roundNum}`}
      </button>
    {/each}
  </div>

  <div class="bracket-container">
    {#each Object.entries(userBracket) as [roundNum, matchups]}
      <div
        class="round-container"
        id="round-{roundNum}"
        data-displayed-mobile={displayedRound == roundNum}
      >
        <div class="round-header">
          <h2>{roundNames[roundNum]}</h2>
        </div>
        <div class="matchups-column">
          {#each matchups as matchup}
            <div class="matchup-card">
              <div
                class="item"
                class:selected={userPicks.get(matchup.id) === matchup.item1.id}
                class:unselected={userPicks.has(matchup.id) &&
                  userPicks.get(matchup.id) !== matchup.item1.id}
                on:click={() => handleSelect(matchup, matchup.item1.id)}
                on:keydown={(e) =>
                  e.key === "Enter" && handleSelect(matchup, matchup.item1.id)}
                role="button"
                tabindex={matchup.item1.id === "TBD" ? -1 : 0}
              >
                <span class="seed">{matchup.item1.seed}</span>
                <img src={matchup.item1.image_url} alt={matchup.item1.label} />
                <div class="item-details">
                  <span class="label">{matchup.item1.label}</span>
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
                      <svg width="20" height="20" viewBox="0 0 24 24"
                        ><path
                          d="M6 19H10V5H6V19ZM14 5V19H18V5H14Z"
                          fill="white"
                        /></svg
                      >
                    {:else}
                      <svg width="20" height="20" viewBox="0 0 24 24"
                        ><path d="M8 5V19L19 12L8 5Z" fill="white" /></svg
                      >
                    {/if}
                  </button>
                {/if}
              </div>
              <div
                class="item"
                class:selected={userPicks.get(matchup.id) === matchup.item2.id}
                class:unselected={userPicks.has(matchup.id) &&
                  userPicks.get(matchup.id) !== matchup.item2.id}
                on:click={() => handleSelect(matchup, matchup.item2.id)}
                on:keydown={(e) =>
                  e.key === "Enter" && handleSelect(matchup, matchup.item2.id)}
                role="button"
                tabindex={matchup.item2.id === "TBD" ? -1 : 0}
              >
                <span class="seed">{matchup.item2.seed}</span>
                <img src={matchup.item2.image_url} alt={matchup.item2.label} />
                <div class="item-details">
                  <span class="label">{matchup.item2.label}</span>
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
                      <svg width="20" height="20" viewBox="0 0 24 24"
                        ><path
                          d="M6 19H10V5H6V19ZM14 5V19H18V5H14Z"
                          fill="white"
                        /></svg
                      >
                    {:else}
                      <svg width="20" height="20" viewBox="0 0 24 24"
                        ><path d="M8 5V19L19 12L8 5Z" fill="white" /></svg
                      >
                    {/if}
                  </button>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  {#if champion}
    <div class="champion-display">
      <h2>Your Champion!</h2>
      <div class="champion-card">
        <img src={champion.image_url} alt="Champion {champion.label}" />
        <h3>{champion.label}</h3>
      </div>
      <button class="share-button">Share Your Bracket</button>
    </div>
  {/if}

  <!-- Mobile navigation bar -->
  {#if !champion}
    <div class="mobile-nav-bar">
      <span>
        {#if !allPicksMadeInCurrentRound}
          Make your picks to continue
        {:else if displayedRound < 5}
          All set for Round {displayedRound}!
        {:else}
          Ready to see your champion?
        {/if}
      </span>
      <button
        on:click={advanceToNextRound}
        disabled={!allPicksMadeInCurrentRound}
      >
        {#if displayedRound < 5}
          Continue to {roundNames[displayedRound + 1]}
        {:else}
          See Champion
        {/if}
      </button>
    </div>
  {/if}
</div>

<style>
  .gallery-bracket-page {
    padding: 1rem;
    color: #fff;
    max-width: 100%;
    overflow-x: auto;
  }
  .bracket-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  .bracket-container {
    display: flex;
    gap: 2rem;
    padding-bottom: 1rem;
    margin-bottom: 80px; /* Space for mobile nav */
  }
  .round-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  .round-header h2 {
    text-align: center;
    font-size: 1.2rem;
    color: #aaa;
    white-space: nowrap;
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
    padding: 0.75rem;
    width: 250px; /* Consistent width */
  }
  .item {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    border-radius: 4px;
    gap: 0.5rem;
    position: relative;
    z-index: 2;
    border: 2px solid transparent;
    transition: all 0.2s ease;
  }
  .item:first-child {
    margin-bottom: 0.5rem;
    border-bottom: 1px solid #2a2a2a;
  }
  .item[tabindex="-1"] {
    cursor: default;
    opacity: 0.6; /* Dim TBD items */
  }
  .item:not([tabindex="-1"]) {
    cursor: pointer;
  }
  .item:hover:not([tabindex="-1"]) {
    background-color: #2a2a2a;
  }
  .item.selected {
    border-color: #cbff70;
    background-color: #283316;
  }
  .item.unselected {
    opacity: 0.4;
  }
  .seed {
    font-size: 0.8rem;
    color: #888;
    width: 1.5em;
    text-align: right;
  }
  .item img {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    object-fit: cover;
  }
  .item-details {
    flex-grow: 1;
    overflow: hidden;
    text-align: left;
  }
  .label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .play-button {
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
  .play-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .champion-display {
    text-align: center;
    margin-top: 2rem;
    margin-bottom: 2rem;
  }
  .champion-card {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    background-color: #1e1e1e;
    padding: 2rem;
    border-radius: 12px;
    border: 1px solid #cbff70;
    box-shadow: 0 0 20px rgba(203, 255, 112, 0.3);
  }
  .champion-card img {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 1rem;
  }
  .share-button {
    margin-top: 1.5rem;
    background-color: #cbff70;
    color: #121212;
    border: none;
    padding: 0.75rem 2rem;
    font-size: 1.1rem;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
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

  .mobile-nav-bar {
    display: none; /* Hidden on desktop */
  }

  /* Mobile Styles */
  @media (max-width: 899px) {
    .bracket-container {
      flex-direction: column;
      gap: 0;
      margin-bottom: 100px; /* Ensure space for the nav bar */
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
    .round-header h2 {
      display: none;
    }
    .matchups-column {
      align-items: center;
    }
    .matchup-card {
      width: 300px; /* Wider on mobile */
    }

    .mobile-nav-bar {
      position: fixed;
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
      margin: 0 auto;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
      z-index: 100;
    }
    .mobile-nav-bar button {
      background-color: #121212;
      color: #cbff70;
      border: none;
      padding: 0.5rem 1.5rem;
      border-radius: 20px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .mobile-nav-bar button:disabled {
      background-color: #333;
      color: #777;
      cursor: not-allowed;
    }
  }
</style>
