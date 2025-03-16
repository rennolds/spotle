<script>
    export let mode = 'normal'; // 'normal', 'challenge', 'rewind', 'create', 'rush'
    export let guessCount = 0;
    export let maxGuesses = 10;
    export let rushIndex = 0;
  </script>
  
  <div class="game-info-container">
    {#if mode === 'rush'}
      <div class="solved-spotles">
        Solved Spotles: {rushIndex}
      </div>
    {/if}
    <div class="guesses-remaining">
      {#if mode === 'normal' || mode === 'challenge' || mode === 'rewind'}
        {#if guessCount === maxGuesses}
          Guess {maxGuesses} of {maxGuesses}
        {:else}
          Guess {guessCount + 1} of {maxGuesses}
        {/if}
      {/if}
      {#if mode === 'create'}
        <div class="create-game-text">
          <p>1.</p>
          <h3>Pick an artist for your friend to guess.</h3>
        </div>
      {/if}
      {#if mode === 'rush'}
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
      align-self: flex-end;
      margin-bottom: 2px;
      margin-right: 12.5px;
      font-size: 15px;
    }
    
    .create-game-text {
      display: flex;
      flex-direction: row;
      align-items: center;
      width: 100%;
    }
  
    .create-game-text h3 {
      color: #fff;
      font-size: 18px;
      font-style: normal;
      font-weight: 700;
      line-height: normal;
    }
  
    .create-game-text p {
      color: #888;
      font-size: 18px;
      font-style: normal;
      font-weight: 700;
      line-height: normal;
      margin-right: 10px;
    }
  </style>