<script>
  import Guess from "../Guess.svelte";

  export let guesses = [];
  export let mysteryArtist;
  export let isGameOver = false;
  export let normalGame = false;
</script>

<div class="guess-container">
  {#if normalGame}
    {#each [...guesses].reverse() as guess (guess.name)}
      <Guess artist={guess} {mysteryArtist}></Guess>
    {/each}
  {:else}
    {#each [...guesses].reverse() as guess (guess.name)}
      <Guess artist={guess} {mysteryArtist}></Guess>
    {/each}
  {/if}
</div>

<style>
  .guess-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 340px;
    margin: 0 auto;
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
    overflow: auto;
  }

  .guess-container::-webkit-scrollbar {
    display: none;
  }

  .in-game-text {
    width: 320px;
    margin: auto;
    text-align: center;
    color: #fff;
  }
</style>
