<script>
  import { createEventDispatcher } from "svelte";
  import MatchupItem from "./MatchupItem.svelte";

  export let matchup;
  export let currentRound = 0;
  export let votedMatchups = new Set();
  export let selections = new Map();
  export let activeAudioItemId = null;
  export let topFinishers = { champion: null };
  export let audioPlayers = {};

  const dispatch = createEventDispatcher();

  $: isVoted = votedMatchups.has(matchup.id);
  $: showResults = isVoted || currentRound === 6;
  $: selectedItemId = selections.get(matchup.id);
  $: isClickable = !isVoted && currentRound === 5;

  $: item1IsWinner = matchup.winnerId && matchup.winnerId === matchup.item1?.id;
  $: item2IsWinner = matchup.winnerId && matchup.winnerId === matchup.item2?.id;

  $: item1IsLeading =
    !matchup.winnerId &&
    matchup.item1Votes > matchup.item2Votes &&
    matchup.totalVotes > 0;
  $: item2IsLeading =
    !matchup.winnerId &&
    matchup.item2Votes > matchup.item1Votes &&
    matchup.totalVotes > 0;

  function handleSelectItem1() {
    if (isClickable) {
      dispatch("select", { matchupId: matchup.id, itemId: matchup.item1.id });
    }
  }

  function handleSelectItem2() {
    if (isClickable) {
      dispatch("select", { matchupId: matchup.id, itemId: matchup.item2.id });
    }
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

<div class="finals-layout desktop-only">
  <!-- Left Column: Item 1 -->
  <div class="finalist-column left">
    <MatchupItem
      item={matchup.item1}
      isSelected={selectedItemId === matchup.item1.id}
      isWinner={item1IsWinner}
      isLoser={item2IsWinner}
      isLeading={item1IsLeading}
      isTrailing={item2IsLeading}
      {showResults}
      percentage={matchup.item1Percentage || 0}
      {activeAudioItemId}
      {currentRound}
      {isClickable}
      on:select={handleSelectItem1}
      on:togglePlay={handleTogglePlay}
      on:audioPlay={handleAudioPlay}
      on:audioPause={handleAudioPause}
    />
  </div>

  <!-- Right Column: Item 2 -->
  <div class="finalist-column right">
    <MatchupItem
      item={matchup.item2}
      isSelected={selectedItemId === matchup.item2.id}
      isWinner={item2IsWinner}
      isLoser={item1IsWinner}
      isLeading={item2IsLeading}
      isTrailing={item1IsLeading}
      {showResults}
      percentage={matchup.item2Percentage || 0}
      {activeAudioItemId}
      {currentRound}
      {isClickable}
      on:select={handleSelectItem2}
      on:togglePlay={handleTogglePlay}
      on:audioPlay={handleAudioPlay}
      on:audioPause={handleAudioPause}
    />
  </div>

  <!-- Center Column: Winner/TBD -->
  <div class="winner-column">
    <div class="winner-item-wrapper">
      <div class="item winner-item">
        <span class="seed">
          {currentRound === 6 && topFinishers.champion
            ? topFinishers.champion.seed
            : ""}
        </span>
        <div class="item-content">
          <div class="image-wrapper">
            <img
              src={currentRound === 6 && topFinishers.champion
                ? topFinishers.champion.image_url
                : "/resources/cd.png"}
              alt={currentRound === 6 && topFinishers.champion
                ? topFinishers.champion.label
                : "TBD"}
            />
          </div>
          <div class="item-details">
            <span class="label">
              {currentRound === 6 && topFinishers.champion
                ? topFinishers.champion.label
                : "TBD"}
            </span>
            {#if currentRound === 6 && topFinishers.champion && topFinishers.champion.sublabel}
              <span class="sublabel">{topFinishers.champion.sublabel}</span>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .finals-layout {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: auto auto;
    gap: 2rem;
    width: 100%;
    max-width: 1500px;
    margin: 0 auto;
  }

  .finalist-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
  }

  .finalist-column.left {
    grid-column: 1;
    grid-row: 1;
  }

  .finalist-column.right {
    grid-column: 3;
    grid-row: 1;
  }

  .winner-column {
    grid-column: 2;
    grid-row: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding-top: 2rem;
  }

  .winner-item-wrapper {
    width: 250px;
  }

  .winner-item {
    cursor: default;
    pointer-events: none;
    width: 100%;
    background: linear-gradient(
      135deg,
      rgba(40, 40, 40, 0.9) 0%,
      rgba(20, 20, 20, 0.95) 100%
    );
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 0;
    border-radius: 10px;
    position: relative;
    transition: all 0.2s ease;
    overflow: visible;
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
    overflow: hidden;
    border-radius: 10px;
  }

  .image-wrapper {
    position: relative;
    flex-shrink: 0;
    width: 68px;
    height: 100%;
    padding: 4px;
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

  .desktop-only {
    display: grid;
  }

  /* Hide on mobile - will use normal RoundColumn instead */
  @media (max-width: 899px) {
    .desktop-only {
      display: none !important;
    }
  }
</style>

