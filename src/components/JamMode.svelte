<script>
    import { createEventDispatcher, onMount, onDestroy } from 'svelte';
    import { fly } from 'svelte/transition';
    import SearchBar from './SearchBar.svelte';
    import GuessList from './GuessList.svelte';
    import { browser } from "$app/environment";
    
    export let currentArtist = null; // The current mystery artist
    export let gameGuesses = []; // Current game guesses
    export let jamIndex = 0; // Current index in jam mode (number of solved)
    export let timeRemaining = 180; // Default to 3 minutes (180 seconds)
    export let solvedArtists = []; // Array of already solved artists
    
    const dispatch = createEventDispatcher();
    let timer;
    let minutes = Math.floor(timeRemaining / 60);
    let seconds = timeRemaining % 60;
    let jamOver = false; // New state to track if jam is over
    
    // Format time as MM:SS
    $: formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Handle artist search/selection
    function handleArtistSearch(event) {
      if (jamOver) return; // Don't process guesses if jam is over
      
      const artistName = event.detail;
      dispatch('guess', { artistName });
    }
    
    // Function to handle artist guess limit reached - separate from solve
    function handleGuessLimitReached() {
        jamOver = true;
        
        if (browser && typeof gtag === 'function') {
            gtag('event', 'jam_mode_complete', {
            'artists_solved': jamIndex,
            'reason': 'guess_limit',
            'failed_artist': currentArtist.name
            });
        }
        
        // Stop the timer when game is over
        if (timer) {
            clearInterval(timer);
        }
        }

        // Make sure to call this function when gameGuesses.length reaches 10
        // This can be added as a reactive statement
        $: if (gameGuesses.length >= 10 && !jamOver) {
        handleGuessLimitReached();
        }
    
    // Function to restart jam mode
    function handleRestartJam() {
      dispatch('restart');
    }
    
    onMount(() => {
      // Start the timer
      timer = setInterval(() => {
        if (timeRemaining > 0) {
          timeRemaining--;
          minutes = Math.floor(timeRemaining / 60);
          seconds = timeRemaining % 60;
        } else {
          // Time's up!
          clearInterval(timer);
          jamOver = true;
          
          if (browser && typeof gtag === 'function') {
            gtag('event', 'jam_mode_complete', {
              'artists_solved': jamIndex,
            });
          }
        }
      }, 1000);
    });
    
    onDestroy(() => {
      // Clear timer when component is destroyed
      if (timer) clearInterval(timer);
    });
</script>

<div class="jam-container">
  <!-- Time and score tracking header -->
  <div class="jam-header">
    <div class="jam-stat solved">
      <span class="jam-label">Solved</span>
      <span class="jam-value">{jamIndex}</span>
    </div>
    
    <div class="jam-stat time">
      <span class="jam-label">Time Remaining</span>
      <span class="jam-value">{formattedTime}</span>
    </div>
    
    <div class="jam-stat guesses">
      <span class="jam-label">Guesses</span>
      <span class="jam-value">{gameGuesses.length + 1} of 10</span>
    </div>
  </div>
  
  <!-- Search bar for guessing -->
  <div class="search-bar-container">
    <SearchBar 
      disabled={jamOver || gameGuesses.length >= 10}
      on:search={handleArtistSearch} 
    />
  </div>
  
  <!-- Solved artists gallery -->
  {#if solvedArtists.length > 0}
    <div class="solved-artists">
      {#each solvedArtists as artist, i (i)}
        <div class="solved-artist-thumbnail" in:fly={{ y: 20, duration: 300 }}>
          <img src={artist.image_uri} alt={artist.name} />
        </div>
      {/each}
    </div>
  {/if}
  
  <!-- Game over message - shown when time is up or reached max guesses -->
  {#if jamOver}
  <div class="jam-over-message" in:fly={{ y: 20, duration: 300 }}>
    <h2>Game over!</h2>
    <p>You solved {jamIndex} Spotle{jamIndex !== 1 ? "'s" : ""} in this jam.</p>
    
    <!-- Add this section to show the artist that stumped the user -->
    {#if gameGuesses.length >= 10}
      <div class="stumped-artist">
        <p>You got stumped by:</p>
        <div class="artist-reveal">
          <img src={currentArtist.image_uri} alt={currentArtist.name} />
          <span>{currentArtist.name}</span>
        </div>
      </div>
    {/if}
    
    <button class="styled-btn run-it-back-btn" on:click={handleRestartJam}>
      RUN IT BACK
    </button>
  </div>
{:else}
  <!-- Display guesses - don't reveal answer in Jam mode -->
  <GuessList
    guesses={gameGuesses}
    mysteryArtist={currentArtist}
    isGameOver={false}
    normalGame={false}
  />
  
  <!-- Show guess limit reached message if at 10 guesses but not game over yet -->
  {#if gameGuesses.length >= 10}
    <div class="guess-limit-message" in:fly={{ y: 20, duration: 300 }}>
      <p>You've used all 10 guesses!</p>
      <p>Game over!</p>
    </div>
  {/if}
{/if}
</div>

<style>
  .jam-container {
    width: 100%;
    max-width: 340px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .jam-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .jam-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .jam-label {
    font-size: 14px;
    color: #b5b5b5;
  }
  
  .jam-value {
    font-size: 18px;
    font-weight: bold;
    color: #fff;
  }
  
  .time .jam-value {
    color: #8370de; /* Purple for time */
  }
  
  .search-bar-container {
    width: 100%;
    margin: 5px 0;
    position: relative;
    z-index: 50;
  }
  
  .solved-artists {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    width: 100%;
    margin: 10px 0;
    max-height: 100px;
    overflow-y: auto;
  }
  
  .solved-artist-thumbnail {
    width: 40px;
    height: 40px;
    margin: 2px;
    border-radius: 50%;
    overflow: hidden;
  }
  
  .solved-artist-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .jam-over-message {
    text-align: center;
    margin-top: 20px;
    padding: 20px;
    background-color: rgba(0, 0, 0, 0.8);
    border-radius: 10px;
    width: 100%;
  }
  
  .jam-over-message h2 {
    color: #8370de;
    margin-bottom: 10px;
  }
  
  .jam-over-message p {
    margin-bottom: 20px;
    color: #fff;
  }
  
  .styled-btn {
    width: 170px;
    height: 47px;
    color: #fff;
    text-align: center;
    font-size: 15px;
    font-weight: 700;
    background-color: #8370de;
    border-radius: 100px;
    margin-top: 15px;
    cursor: pointer;
    border: none;
  }
  
  .styled-btn:hover {
    transform: scale(1.05);
  }
  
  .run-it-back-btn {
    margin: 10px auto;
  }
  
  .guess-limit-message {
    text-align: center;
    margin-top: 15px;
    padding: 15px;
    background-color: rgba(0, 0, 0, 0.7);
    border-radius: 10px;
    width: 100%;
  }
  
  .guess-limit-message p {
    margin: 5px 0;
    color: #fff;
  }

  .stumped-artist {
  margin: 15px 0;
  text-align: center;
}

.stumped-artist p {
  font-size: 16px;
  margin-bottom: 10px;
  color: #b5b5b5;
}

.artist-reveal {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px 0 20px;
}

.artist-reveal img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 10px;
  border: 2px solid #8370de;
}

.artist-reveal span {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
}
</style>