<script>
    import { createEventDispatcher } from 'svelte';
    import SearchBar from './SearchBar.svelte';
    import GuessList from './GuessList.svelte';
    import GameInfo from './GameInfo.svelte';
    import RewindControls from './RewindControls.svelte';
    import { gameMode, gameStatus, mysteryArtist, guesses, tempGuesses } from '../lib/gameState';
    
    // Props for the component
    export let mode = 'normal'; // Default to normal game mode
    export let currentArtist = null; // The current mystery artist
    export let gameGuesses = []; // Current game guesses
    export let isGameOver = false; // Whether the game is over
    export let rewindDates = []; // Dates for rewind mode
    export let rewindIndex = 0; // Current index in rewind mode
    export let rushIndex = 0; // Current index in rush mode
    export let blurResults = false; // Whether to blur the results
    export let challengeNote = ''; // Note for challenge mode
    
    const dispatch = createEventDispatcher();
    
    // Handle artist search/selection
    function handleArtistSearch(event) {
      const artistName = event.detail;
      dispatch('guess', { artistName });
    }
    
    // Handle rewind navigation
    function handlePrevious() {
      dispatch('rewindPrevious');
    }
    
    function handleNext() {
      dispatch('rewindNext');
    }
</script>
  
<div class="game-container" style={blurResults ? "filter: blur(3px)" : ""}>
  <!-- Game info (e.g., guess count) -->
  <GameInfo 
    {mode} 
    guessCount={gameGuesses.length} 
    maxGuesses={10}
    {rushIndex}
  />
  
  <!-- Rewind controls (only in rewind mode) -->
  {#if mode === 'rewind'}
    <RewindControls 
      currentIndex={rewindIndex}
      maxIndex={rewindDates.length - 1}
      dates={rewindDates}
      on:previous={handlePrevious}
      on:next={handleNext}
    />
  {/if}
  
  <!-- Search bar for guessing -->
  <div class="search-bar-container">
    <SearchBar 
      disabled={isGameOver} 
      on:search={handleArtistSearch} 
    />
  </div>
  
  <!-- Challenge hint display -->
  {#if mode === 'challenge' && gameGuesses.length === 0 && challengeNote !== ''}
    <p class="in-game-text">
      A hint from your friend: {challengeNote}
    </p>
  {/if}
  
  <!-- Display guesses -->
  {#if mode !== 'create'}
    <GuessList
      guesses={gameGuesses}
      mysteryArtist={currentArtist}
      {isGameOver}
      normalGame={mode === 'normal'}
    />
  {/if}
  
  <!-- First time instructions -->
  {#if mode === 'normal' && gameGuesses.length === 0}
    <p class="in-game-text">Guess the artist of the day.</p>
    <p class="in-game-text">
      Search for an artist to make your first guess.
    </p>
  {/if}
  
  <!-- Instruction graphic for first-time users -->
  {#if mode === 'normal' && gameGuesses.length === 1 && !isGameOver}
    <!-- SVG instruction graphic will be added by you -->
    <div class="instruction-graphic-placeholder">
      <!-- The SVG instruction graphic will go here -->
    </div>
  {/if}
  
  {#if mode === 'normal' && gameGuesses.length == 1 && !isGameOver}
    <p class="in-game-text">
      Use the matching attributes to make more guesses. Good luck!
    </p>
  {/if}
  
  <div class="ad-space"></div>
</div>
  
<style>
  .game-container {
    width: 100%;
    max-width: 340px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .search-bar-container {
    width: 100%;
    margin: 10px 0 5px 0;
    position: relative;
    z-index: 50;
  }
  
  .in-game-text {
    width: 320px;
    margin: 10px auto;
    text-align: center;
    color: #fff;
  }
  
  .instruction-graphic-placeholder {
    display: block;
    margin: 15px auto;
    height: 44px;
    width: 275px;
  }
  
  .ad-space {
    height: 100px;
    margin-top: 20px;
  }
</style>