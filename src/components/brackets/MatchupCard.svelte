<script>
  import { createEventDispatcher } from "svelte";
  import MatchupItem from "./MatchupItem.svelte";

  export let matchup;
  export let currentRound = 0;
  export let roundNum = 0;
  export let votedMatchups = new Set();
  export let selections = new Map();
  export let activeAudioItemId = null;

  const dispatch = createEventDispatcher();

  $: isVoted = votedMatchups.has(matchup.id) || currentRound === 6;
  $: isCurrent = currentRound == roundNum && currentRound !== 6;
  $: isClickable = !isVoted && isCurrent;

  function handleItemSelect(itemId) {
    if (isClickable) {
      dispatch("select", { matchupId: matchup.id, itemId });
    }
  }

  function handleTogglePlay(item) {
    dispatch("togglePlay", { item });
  }

  function handleAudioPlay(itemId) {
    dispatch("audioPlay", { itemId });
  }

  function handleAudioPause(itemId) {
    dispatch("audioPause", { itemId });
  }
</script>

<div
  class="matchup-card"
  class:current={isCurrent}
  class:voted={isVoted}
  class:results-mode={currentRound === 6}
>
  <MatchupItem
    item={matchup.item1}
    isSelected={selections.get(matchup.id) === matchup.item1.id}
    isWinner={matchup.winnerId === matchup.item1.id}
    isLoser={matchup.winnerId && matchup.winnerId !== matchup.item1.id}
    isLeading={currentRound == roundNum &&
      matchup.item1Votes > matchup.item2Votes}
    isTrailing={currentRound == roundNum &&
      matchup.item1Votes < matchup.item2Votes}
    showResults={roundNum <= currentRound ||
      votedMatchups.has(matchup.id) ||
      currentRound === 6}
    percentage={matchup.item1Percentage}
    {activeAudioItemId}
    {currentRound}
    {isClickable}
    on:select={(e) => handleItemSelect(e.detail.itemId)}
    on:togglePlay={(e) => handleTogglePlay(e.detail.item)}
    on:audioPlay={(e) => handleAudioPlay(e.detail.itemId)}
    on:audioPause={(e) => handleAudioPause(e.detail.itemId)}
  />

  <MatchupItem
    item={matchup.item2}
    isSelected={selections.get(matchup.id) === matchup.item2.id}
    isWinner={matchup.winnerId === matchup.item2.id}
    isLoser={matchup.winnerId && matchup.winnerId !== matchup.item2.id}
    isLeading={currentRound == roundNum &&
      matchup.item2Votes > matchup.item1Votes}
    isTrailing={currentRound == roundNum &&
      matchup.item2Votes < matchup.item1Votes}
    showResults={roundNum <= currentRound ||
      votedMatchups.has(matchup.id) ||
      currentRound === 6}
    percentage={matchup.item2Percentage}
    {activeAudioItemId}
    {currentRound}
    {isClickable}
    on:select={(e) => handleItemSelect(e.detail.itemId)}
    on:togglePlay={(e) => handleTogglePlay(e.detail.item)}
    on:audioPlay={(e) => handleAudioPlay(e.detail.itemId)}
    on:audioPause={(e) => handleAudioPause(e.detail.itemId)}
  />
</div>

<style>
  .matchup-card {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 250px;
    overflow: visible;
  }

  .matchup-card.results-mode {
    pointer-events: none;
  }

  /* Mobile Styles */
  @media (max-width: 899px) {
    .matchup-card {
      width: 75%;
      max-width: none;
      margin: 0;
      position: relative;
      gap: 1rem;
    }

    /* Bracket connector lines on mobile */
    /* Horizontal lines from each item to the vertical connector */
    .matchup-card :global(.item::after) {
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
  }
</style>
