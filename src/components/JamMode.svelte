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
    
    // Format time as MM:SS
    $: formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Handle artist search/selection
    function handleArtistSearch(event) {
      const artistName = event.detail;
      dispatch('guess', { artistName });
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
          dispatch('timeUp');
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
        disabled={timeRemaining <= 0} 
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
    
    <!-- Display guesses -->
    <GuessList
      guesses={gameGuesses}
      mysteryArtist={currentArtist}
      isGameOver={timeRemaining <= 0}
      normalGame={false}
    />
    
    {#if timeRemaining <= 0}
      <div class="time-up-message" in:fly={{ y: 20, duration: 300 }}>
        <h2>Time's Up!</h2>
        <p>You solved {jamIndex} artists in the time limit.</p>
        <button class="styled-btn" on:click={() => dispatch('restart')}>
          Play Again
        </button>
      </div>
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
    
    .time-up-message {
      text-align: center;
      margin-top: 20px;
      padding: 20px;
      background-color: rgba(0, 0, 0, 0.8);
      border-radius: 10px;
      width: 100%;
    }
    
    .time-up-message h2 {
      color: #8370de;
      margin-bottom: 10px;
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
  </style>