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
    export let isGameOver = false; // Control from parent component
    export let useDeepCuts = false; // Whether to use the deep cuts list
    
    const dispatch = createEventDispatcher();
    let timer;
    let minutes = Math.floor(timeRemaining / 60);
    let seconds = timeRemaining % 60;
    let jamOver = false; // Local state to track if jam is over
    let shareButtonText = "SHARE RESULT"; // State for share button text
    
    // New property to track free guess
    let hasFreeGuess = false;
    
    // New property to show intro screen
    let showIntro = true;

    // New properties for time adjustments
    let showTimeBonus = false;
    let showTimePenalty = false;
    let timeBonusTimer;
    let timePenaltyTimer;
    
    // Function to start the game
    function startJam() {
        showIntro = false;
        initTimer(); // Start the timer when the user clicks start
        
        // Send mode to parent
        dispatch('startWithMode', { useDeepCuts });
        
        if (browser && typeof gtag === 'function') {
            gtag('event', 'jam_mode_start_confirmed', {
                'mode': useDeepCuts ? 'deep_cuts' : 'standard'
            });
        }
    }
    
    // Toggle deep cuts mode is now handled directly by the bind:checked
    
    // Computed property for effective guess count (excluding free guess)
    $: effectiveGuessCount = hasFreeGuess ? gameGuesses.length - 1 : gameGuesses.length;
    
    // Sync local jamOver state with parent isGameOver prop
    $: {
      jamOver = isGameOver;
      if (isGameOver && timer) {
        clearInterval(timer);
      }
    }
    
    // Format time as MM:SS
    $: formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update minutes and seconds when timeRemaining changes
    $: {
      minutes = Math.floor(timeRemaining / 60);
      seconds = timeRemaining % 60;
    }
    
    // Handle artist search/selection
    function handleArtistSearch(event) {
      if (jamOver) return; // Don't process guesses if jam is over
      
      const artistName = event.detail;
      dispatch('guess', { artistName });
    }

    // Handle skipping the current artist
    function handleSkipArtist() {
      if (jamOver) return; // Don't skip if jam is over
      
      // Apply time penalty (-15 seconds)
      timeRemaining = Math.max(1, timeRemaining - 15); // Don't go below 1 second
      
      // Show the time penalty notification
      showTimePenalty = true;
      clearTimeout(timePenaltyTimer);
      timePenaltyTimer = setTimeout(() => {
        showTimePenalty = false;
      }, 2000);
      
      // Tell the parent to skip to the next artist
      dispatch('skipArtist');
    }
    
    // Function to handle artist guess limit reached - separate from solve
    function handleGuessLimitReached() {
        if (jamOver) return; // Prevent multiple calls
        
        jamOver = true;
        dispatch('timeUp'); // Notify parent component
        
        if (browser && typeof gtag === 'function') {
            gtag('event', 'jam_mode_complete', {
              'artists_solved': jamIndex,
              'reason': 'guess_limit',
              'failed_artist': currentArtist?.name || 'unknown',
              'mode': useDeepCuts ? 'deep_cuts' : 'standard'
            });
        }
        
        // Stop the timer when game is over
        if (timer) {
            clearInterval(timer);
        }
    }

    // Make sure to call this function when EFFECTIVE guess count reaches 10
    $: if (effectiveGuessCount >= 10 && !jamOver) {
        handleGuessLimitReached();
    }
    
    // Function to handle sharing results
    function handleShareResult() {
      let shareText = `I solved ${jamIndex} artist${jamIndex !== 1 ? 's' : ''} in this Spotle Jam`;
      
      // Add mode info to share text
      if (useDeepCuts) {
        shareText += " (Deep Cuts mode)";
      }
      
      // Add the artist the user got stumped by if they didn't solve the current one
      if (currentArtist) {
        shareText += `. I got stumped by ${currentArtist.name}.`;
      }
      
      shareText += ` Can you do better?\n\nspotle.io`;
      
      function isMobile() {
        const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
        return regex.test(navigator.userAgent);
      }
      
      if (browser) {
        if (typeof gtag === 'function') {
          gtag('event', 'jam_share_result', {
            'artists_solved': jamIndex,
            'mode': useDeepCuts ? 'deep_cuts' : 'standard'
          });
        }
        
        if (isMobile()) {
          if (navigator.share) {
            navigator.share({
              text: shareText,
            })
            .then(() => {
              console.log("Thanks for sharing!");
            })
            .catch(console.error);
          } else {
            shareButtonText = "COPIED RESULT";
            navigator.clipboard.writeText(shareText)
            .then(() => {
              console.log("copied");
            })
            .catch((error) => {
              alert(`Copy failed! ${error}`);
            });
          }
        } else {
          shareButtonText = "COPIED RESULT";
          navigator.clipboard.writeText(shareText);
        }
      }
    }
    
    // Function to restart jam mode
    function handleRestartJam() {
      shareButtonText = "SHARE RESULT"; // Reset button text
      dispatch('restart', { useDeepCuts }); // Pass the current mode when restarting
    }
    
    // Initialize or reset the timer
    function initTimer() {
      // Clear any existing timer first
      if (timer) {
        clearInterval(timer);
      }
      
      // Only start if game is not over and intro is not showing
      if (!jamOver && !showIntro) {
        timer = setInterval(() => {
          if (timeRemaining > 0) {
            timeRemaining--;
            minutes = Math.floor(timeRemaining / 60);
            seconds = timeRemaining % 60;
          } else {
            // Time's up!
            clearInterval(timer);
            jamOver = true;
            dispatch('timeUp'); // Notify parent
            
            if (browser && typeof gtag === 'function') {
              gtag('event', 'jam_mode_complete', {
                'artists_solved': jamIndex,
                'reason': 'time_up',
                'mode': useDeepCuts ? 'deep_cuts' : 'standard'
              });
            }
          }
        }, 1000);
      }
    }
    
    // Listen for changes to gameGuesses to detect if free guess was added
    $: {
      // If first guess is from a previously solved artist, mark it as a free guess
      if (gameGuesses.length === 1 && solvedArtists.length > 0) {
        const latestSolvedArtist = solvedArtists[solvedArtists.length - 1];
        if (latestSolvedArtist && gameGuesses[0].name === latestSolvedArtist.name) {
          hasFreeGuess = true;
        }
      } else if (gameGuesses.length === 0) {
        // Reset free guess status when guesses are cleared
        hasFreeGuess = false;
      }
    }

    // Use this function to explicitly apply the time bonus
    function applyTimeBonus() {
      if (!jamOver && !showIntro) {
        // Add 15 seconds to remaining time
        timeRemaining += 15;
        
        // Show the time bonus notification
        showTimeBonus = true;
        clearTimeout(timeBonusTimer);
        timeBonusTimer = setTimeout(() => {
          showTimeBonus = false;
        }, 2000);
        
        console.log("Time bonus applied: +15 seconds");
      }
    }
    
    // Watch jamIndex for changes to detect when an artist is solved correctly
    let previousJamIndex = 0;
    $: {
      // If jamIndex has increased, a new artist was solved
      if (jamIndex > previousJamIndex && !jamOver && !showIntro) {
        applyTimeBonus();
        previousJamIndex = jamIndex;
      }
    }
    
    onMount(() => {
      // Don't automatically start the timer - wait for user to click START
      if (!showIntro) {
        initTimer();
      }
      
      // Initialize previousJamIndex with current value
      previousJamIndex = jamIndex;
    });
    
    // Force timer reset when component props change
    $: if (currentArtist && !jamOver && !showIntro) {
      initTimer();
    }
    
    onDestroy(() => {
      // Clear timer when component is destroyed
      if (timer) clearInterval(timer);
      if (timeBonusTimer) clearTimeout(timeBonusTimer);
      if (timePenaltyTimer) clearTimeout(timePenaltyTimer);
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
      <div class="time-display">
        <span class="jam-value">{formattedTime}</span>
        {#if showTimeBonus}
          <span class="time-bonus" transition:fly={{ y: -20, duration: 300 }}>+15</span>
        {/if}
        {#if showTimePenalty}
          <span class="time-penalty" transition:fly={{ y: -20, duration: 300 }}>-15</span>
        {/if}
      </div>
    </div>

    <div class="skip-button-container">
    <button 
        class="skip-button" 
        on:click={handleSkipArtist}
        disabled={showIntro || jamOver}
    >
        SKIP
    </button>
    </div>
    
    <div class="jam-stat guesses">
      <span class="jam-label">Guesses</span>
      <!-- Updated to show effective guess count -->
      <span class="jam-value">{effectiveGuessCount + 1} of 10</span>
    </div>
  </div>
  
  <!-- Intro overlay - Only shown before game starts -->
  {#if showIntro}
    <div class="jam-intro-overlay" in:fly={{ y: 20, duration: 300 }}>
      <div class="intro-content">
        <h2 class="intro-title">Spotle Jam</h2>
        <ul class="jam-rules-list">
          <li>Solve as many Spotles as you can in 3 minutes</li>
          <li>Skip an artist if you get stuck, but you'll lose 15 seconds</li>
          <li>Solve a Spotle, get 15 seconds back and a free guess!</li>
          <li>Don't run out of guesses or time, or it's over!</li>
          <li>Only the most popular artists will show up in the Jam, unless you play with Deep Cuts...</li>
        </ul>
        
        <!-- Deep Cuts toggle -->
        <div class="deep-cuts-toggle">
          <div class="toggle-header">
            <span class="toggle-label">DEEP CUTS</span>
            <button
              class="toggle-button {useDeepCuts ? 'active' : ''}"
              on:click={() => useDeepCuts = !useDeepCuts}
            >
              {useDeepCuts ? 'ON' : 'OFF'}
            </button>
          </div>
          <p class="toggle-description">Jam with a wider range of artists. Basically, hard mode.</p>
        </div>
        
        <button class="styled-btn start-btn" on:click={startJam}>
          START
        </button>
      </div>
    </div>
  {/if}
  
  <!-- Skip button - now above search bar -->
  
  <!-- Search bar for guessing -->
  <div class="search-controls">
    <div class="search-bar-container">
      <SearchBar 
        disabled={jamOver || effectiveGuessCount >= 10 || showIntro}
        on:search={handleArtistSearch} 
      />
    </div>
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
    <p>You solved {jamIndex} Spotle{jamIndex !== 1 ? "'s" : ""} in this jam{useDeepCuts ? " (Deep Cuts)" : ""}.</p>
    
    <!-- Add this section to show the artist that stumped the user -->
    <div class="stumped-artist">
        <p>You got stumped by:</p>
        <div class="artist-reveal">
            <img src={currentArtist.image_uri} alt={currentArtist.name} />
            <span>{currentArtist.name}</span>
        </div>
    </div>
    
    <!-- Share button -->
    <button class="styled-btn share-btn" on:click={handleShareResult}>
      {shareButtonText}
    </button>
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
  {#if effectiveGuessCount >= 10 && !jamOver}
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
    position: relative;
    padding-bottom: 100px; /* Add space at the bottom for better scrolling */
  }
  
  .jam-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: -10px;
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

  /* Time display with bonus/penalty */
  .time-display {
    position: relative;
    display: flex;
    align-items: center;
  }
  
  .time-bonus {
    position: absolute;
    top: 1.75px;
    right: -27.5px;
    color: #43a865; /* Green */
    font-weight: bold;
    font-size: 16px;
  }
  
  .time-penalty {
    position: absolute;
    top: 1.75px;
    right: -27.5px;
    color: #e74c3c; /* Red */
    font-weight: bold;
    font-size: 16px;
  }
  
  /* Search controls with Skip button */
  .search-controls {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 5px 0;
  }
  
  .search-bar-container {
    width: 100%;
    position: relative;
    z-index: 50;
  }
  
  .skip-button-container {
    margin-top: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .skip-button {
    background-color: #e74c3c;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 4px 8px;
    font-weight: bold;
    cursor: pointer;
    font-size: 12px;
    transition: transform 0.2s, background-color 0.2s;
    margin-top: 4px;
  }
  
  .skip-button:hover {
    background-color: #c0392b;
    transform: scale(1.05);
  }
  
  .skip-button:disabled {
    background-color: #7f8c8d;
    cursor: not-allowed;
    transform: none;
    opacity: 0.6;
  }

  /* Updated Intro overlay styling */
  .jam-intro-overlay {
    position: absolute;
    top: 70px;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 10px;
    z-index: 200;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 20px;
    width: 100%;
    max-width: 340px;
    margin: 0 auto;
    padding-bottom: 100px; /* Add space at the bottom for better scrolling */
  }
  
  .intro-content {
    text-align: left;
    max-width: 280px;
  }
  
  .intro-title {
    color: #8370de;
    font-size: 28px;
    margin-bottom: 15px;
    font-weight: 700;
    text-align: left;
    width: 100%;
  }
  
  .jam-rules-list {
    text-align: left;
    list-style-type: disc;
    padding-left: 20px;
    margin-bottom: 20px;
  }
  
  .jam-rules-list li {
    color: #b5b5b5;
    margin-bottom: 10px;
    font-size: 15px;
    line-height: 1.4;
  }
  
  .deep-cuts-toggle {
    margin: 20px 0;
    width: 100%;
    background-color: rgba(131, 112, 222, 0.2);
    border-radius: 8px;
    padding: 15px;
    border: 1px solid rgba(131, 112, 222, 0.4);
  }
  
  .toggle-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  
  .toggle-label {
    font-weight: bold;
    color: #fff;
    font-size: 16px;
  }
  
  .toggle-button {
    background-color: #333;
    color: #fff;
    border: none;
    border-radius: 15px;
    padding: 5px 12px;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.2s;
  }
  
  .toggle-button:hover {
    transform: scale(1.05);
  }
  
  .toggle-button.active {
    background-color: #8370de;
  }
  
  .toggle-description {
    font-size: 14px !important;
    color: #b5b5b5 !important;
    text-align: left !important;
    margin: 0 !important;
  }
  
  .start-btn {
    margin-top: 20px;
    padding: 0 30px;
    font-size: 16px;
    align-self: center;
    display: block;
    margin-left: auto;
    margin-right: auto;
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
  
  /* New style for free guess indicator */
  .free-guess-indicator {
    background-color: rgba(131, 112, 222, 0.2);
    border: 1px solid #8370de;
    border-radius: 8px;
    padding: 8px 12px;
    margin: 8px 0;
    text-align: center;
    width: 100%;
  }
  
  .free-guess-indicator span {
    color: #8370de;
    font-weight: 600;
    font-size: 14px;
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
  
  /* NEW: Added styles for share and run-it-back buttons */
  .share-btn {
    margin: 10px auto 5px;
  }
  
  .run-it-back-btn {
    margin: 5px auto 10px;
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