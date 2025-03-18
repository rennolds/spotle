<script>
  import { createEventDispatcher } from "svelte";
  import { fly } from "svelte/transition";
  import { solveList, currentStreak, maxStreak, bestGuessImages, played } from "./store.js";
  import { browser } from "$app/environment";

  const dispatch = createEventDispatcher();

  function closeOverlay() {
    dispatch("close");
  }

  // Compute statistics
  $: totalPlayed = browser ? ($played || $solveList.length) : 0;
  $: wins = browser ? $solveList.filter(result => result > 0).length : 0;
  $: winPercentage = totalPlayed > 0 ? Math.round((wins / totalPlayed) * 100) : 0;

  // Get guess distribution
  function getGuessDistribution() {
    const distribution = {
      "1-2": 0,
      "3-4": 0,
      "5-6": 0,
      "7-8": 0,
      "9-10": 0
    };
    
    $solveList.forEach(guesses => {
      if (guesses === 0) return; // Skip losses
      
      if (guesses <= 2) distribution["1-2"]++;
      else if (guesses <= 4) distribution["3-4"]++;
      else if (guesses <= 6) distribution["5-6"]++;
      else if (guesses <= 8) distribution["7-8"]++;
      else if (guesses <= 10) distribution["9-10"]++;
    });
    
    return distribution;
  }
  
  // Get top performance guess counts (from solveList)
  function getTopPerformanceCounts() {
    // Create a copy of solveList with only wins (> 0)
    const winsList = $solveList.filter(result => result > 0);
    
    // Sort by guess count (ascending)
    winsList.sort((a, b) => a - b);
    
    // Return first 3 (or fewer if not enough wins)
    return winsList.slice(0, 3);
  }

  $: distribution = browser ? getGuessDistribution() : { "1-2": 0, "3-4": 0, "5-6": 0, "7-8": 0, "9-10": 0 };
  $: maxDistributionValue = browser ? Math.max(...Object.values(distribution), 1) : 1;
  $: topPerformances = browser ? getTopPerformanceCounts() : [];
</script>

<div in:fly={{ y: 20, duration: 300 }} class="overlay">
  <div class="stats-content">
    <button on:click={closeOverlay} class="close-button">
      <svg
        width="20"
        height="18"
        viewBox="0 0 20 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M19.2099 1.7625L17.3417 0L9.93491 6.9875L2.52816 0L0.659912 1.7625L8.06666 8.75L0.659912 15.7375L2.52816 17.5L9.93491 10.5125L17.3417 17.5L19.2099 15.7375L11.8032 8.75L19.2099 1.7625Z"
          fill="white"
        />
      </svg>
    </button>
    
    <h2 class="stats-title">STATISTICS</h2>
    
    <div class="stats-row">
      <div class="stat-item">
        <div class="stat-value">{totalPlayed}</div>
        <div class="stat-label">Played</div>
      </div>
      
      <div class="stat-item">
        <div class="stat-value">{winPercentage}%</div>
        <div class="stat-label">Win %</div>
      </div>
      
      <div class="stat-item">
        <div class="stat-value">{$currentStreak}</div>
        <div class="stat-label">Current Streak</div>
      </div>
      
      <div class="stat-item">
        <div class="stat-value">{$maxStreak}</div>
        <div class="stat-label">Max Streak</div>
      </div>
    </div>
    
    {#if $bestGuessImages && $bestGuessImages.length > 0}
      <div class="top-performances">
        <h3>TOP PERFORMANCES</h3>
        <div class="top-artists">
          {#each $bestGuessImages as imageUrl, index}
            {#if imageUrl}
              <div class="top-artist">
                <img src={imageUrl} alt="Top artist" />
                <div class="guess-number">
                  {#if topPerformances[index] == 1}
                   {topPerformances[index] || '-'} guess
                  {:else}
                    {topPerformances[index] || '-'} guesses
                  {/if}
                </div>
              </div>
            {/if}
          {/each}
        </div>
      </div>
    {/if}
    
    <div class="guess-distribution">
      <h3>GUESS DISTRIBUTION</h3>
      
      <div class="distribution-container">
        <div class="distribution-row">
          <div class="guess-label">1-2</div>
          <div class="guess-bar-container">
            <div 
              class="guess-bar" 
              style="width: {(distribution['1-2'] / maxDistributionValue) * 100}%"
            >
              <span class="bar-value">{distribution['1-2']}</span>
            </div>
          </div>
        </div>
        
        <div class="distribution-row">
          <div class="guess-label">3-4</div>
          <div class="guess-bar-container">
            <div 
              class="guess-bar"
              style="width: {(distribution['3-4'] / maxDistributionValue) * 100}%"
            >
              <span class="bar-value">{distribution['3-4']}</span>
            </div>
          </div>
        </div>
        
        <div class="distribution-row">
          <div class="guess-label">5-6</div>
          <div class="guess-bar-container">
            <div 
              class="guess-bar"
              style="width: {(distribution['5-6'] / maxDistributionValue) * 100}%"
            >
              <span class="bar-value">{distribution['5-6']}</span>
            </div>
          </div>
        </div>
        
        <div class="distribution-row">
          <div class="guess-label">7-8</div>
          <div class="guess-bar-container">
            <div 
              class="guess-bar"
              style="width: {(distribution['7-8'] / maxDistributionValue) * 100}%"
            >
              <span class="bar-value">{distribution['7-8']}</span>
            </div>
          </div>
        </div>
        
        <div class="distribution-row">
          <div class="guess-label">9-10</div>
          <div class="guess-bar-container">
            <div 
              class="guess-bar"
              style="width: {(distribution['9-10'] / maxDistributionValue) * 100}%"
            >
              <span class="bar-value">{distribution['9-10']}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9000;
  }
  
  .stats-content {
    position: relative;
    width: 90%;
    max-width: 400px;
    max-height: 80vh;
    border-radius: 10px;
    background: rgba(48, 48, 48, 0.95);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    color: #fff;
    overflow-y: auto;
  }
  
  .close-button {
    position: absolute;
    top: 12px;
    right: 12px;
    cursor: pointer;
    background: none;
    border: none;
    z-index: 10000;
  }
  
  .stats-title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 20px;
    margin-top: 10px;
  }
  
  .stats-row {
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 30px;
  }
  
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
  }
  
  .stat-value {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .stat-label {
    font-size: 12px;
    color: #b5b5b5;
    text-align: center;
  }
  
  .top-performances {
    width: 100%;
    margin-bottom: 30px;
  }
  
  .top-performances h3 {
    font-size: 16px;
    margin-bottom: 15px;
    text-align: left;
  }
  
  .top-artists {
    display: flex;
    justify-content: space-around;
    width: 100%;
  }
  
  .top-artist {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .top-artist img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 5px;
  }
  
  .guess-number {
    font-size: 14px;
    color: #b5b5b5;
    margin-top: 5px;
    background-color: #CBFF70;
    padding: 3px 8px;
    border-radius: 12px;
    color: black;
  }
  
  .guess-distribution {
    width: 100%;
  }
  
  .guess-distribution h3 {
    font-size: 16px;
    margin-bottom: 15px;
    text-align: left;
  }
  
  .distribution-container {
    width: 100%;
  }
  
  .distribution-row {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    width: 100%;
  }
  
  .guess-label {
    width: 40px;
    text-align: right;
    margin-right: 10px;
    font-size: 14px;
    color: #b5b5b5;
  }
  
  .guess-bar-container {
    flex: 1;
    height: 24px;
    background-color: #454545;
    border-radius: 4px;
  }
  
  .guess-bar {
    height: 100%;
    background-color: #8370de;
    border-radius: 4px;
    display: flex;
    align-items: center;
    padding-left: 10px;
    min-width: 24px; /* Ensure room for the number */
    transition: width 0.5s ease;
  }
  
  .bar-value {
    color: white;
    font-weight: bold;
    font-size: 14px;
  }
</style>