<script>
  export let mode = "normal"; // 'normal', 'challenge', 'rewind', 'create', 'rush'
  export let guessCount = 0;
  export let maxGuesses = 10;
</script>

<div class="game-info-container">
  <div class="guesses-remaining">
    {#if mode === "normal" || mode === "challenge" || mode === "rewind"}
      <!-- {#if mode === "normal"}
        <span class="new-game-link"
          >check out our <a
            href="https://crosstune.io"
            target="_blank"
            rel="noopener noreferrer">new game!</a
          ></span
        >
      {/if} -->
      <span class="guess-count">
        {#if guessCount === maxGuesses}
          Guess {maxGuesses} of {maxGuesses}
        {:else}
          Guess {guessCount + 1} of {maxGuesses}
        {/if}
      </span>
    {/if}
    {#if mode === "create"}
      <div class="create-game-text">
        <p>1.</p>
        <h3>Pick an artist for your friend to guess.</h3>
      </div>
    {/if}
    {#if mode === "rush"}
      Guess {guessCount + 1} of 30
    {/if}
  </div>
</div>

<style>
  .game-info-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: -2px;
  }

  .solved-spotles {
    color: #fff;
    align-self: flex-start;
    margin-bottom: 5px;
  }

  .guesses-remaining {
    color: #fff;
    width: 100%;
    margin-bottom: -5px;
    padding: 0 12.5px;
    font-size: 15px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .guess-count {
    color: #fff;
  }

  .create-game-text {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    text-align: left; /* Added text alignment */
    justify-content: flex-start; /* Added for proper alignment */
  }

  .create-game-text h3 {
    color: #fff;
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    text-align: left; /* Added text alignment */
  }

  .create-game-text p {
    color: #888;
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    margin-right: 10px;
    text-align: left; /* Added text alignment */
  }

  .new-game-link {
    color: rgba(255, 255, 255, 0.7);
    font-weight: 400;
  }

  .new-game-link a {
    color: #cbff70;
    text-decoration: none;
    font-weight: 400;
  }

  .new-game-link a:hover {
    text-decoration: underline;
  }
</style>
