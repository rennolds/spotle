<script>
  import { createEventDispatcher } from 'svelte';
  
  // Props
  export let disabled = false;
  export let placeholder = "Type a guess here...";
  
  // Internal state
  let searchTerm = "";
  let filteredArtists = [];
  let resultsVisible = false;
  
  // Event handling
  const dispatch = createEventDispatcher();
  
  // Import artistList only if we're in the browser
  import { browser } from "$app/environment";
  import { onMount } from 'svelte';
  
  let artistNames = [];
  
  onMount(async () => {
    if (browser) {
      // Import artist list dynamically
      const { default: artistList } = await import('$lib/artists.json');
      artistNames = artistList.map(artist => artist.artist);
    }
  });
  
  function fuzzySearch(input) {
    if (input == "") {
      return [];
    }

    if (input.toLowerCase() == "bach") {
      return ["Johann Sebastian Bach"];
    }
    
    input = input.toLowerCase();
    const results = [];

    for (let item of artistNames) {
      const temp_item = item;
      item = item.toLowerCase();

      if (item.startsWith(input)) {
        results.push({ temp_item, score: 1 });
        continue;
      }

      let inputLength = input.length;
      let currentItemLength = item.length;
      let matrix = [];

      // Initialize the matrix with distances
      for (let i = 0; i <= currentItemLength; i++) {
        matrix[i] = [i];
      }
      for (let j = 0; j <= inputLength; j++) {
        matrix[0][j] = j;
      }

      // Fill in the matrix with distances
      for (let i = 1; i <= currentItemLength; i++) {
        for (let j = 1; j <= inputLength; j++) {
          if (item[i - 1] === input[j - 1]) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
          }
        }
      }

      // Calculate similarity score based on Levenshtein distance
      let maxDistance = Math.max(currentItemLength, inputLength);
      let distance = matrix[currentItemLength][inputLength];
      let similarity = 1 - distance / maxDistance;

      if (similarity >= 0.5) {
        results.push({ temp_item, score: similarity });
      }
    }

    results.sort((a, b) => b.score - a.score);

    return results.slice(0, 10).map((result) => result.temp_item);
  }

  $: {
    filteredArtists = fuzzySearch(searchTerm);
    resultsVisible = filteredArtists.length > 0 && searchTerm.length > 0;
  }
  
  function handleSearch(artistName) {
    if (filteredArtists.length == 0) {
      return;
    }
    
    if (artistName === null) {
      return;
    }
    
    dispatch('search', artistName);
    searchTerm = "";
    resultsVisible = false;
  }

  function handleClickOutside(event) {
    if (event.target.closest('.search-container')) return;
    resultsVisible = false;
  }

  onMount(() => {
    if (browser) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  });
</script>

<div class="search-container">
  <input
    type="text"
    name="search"
    id="search"
    {placeholder}
    autocomplete="off"
    {disabled}
    bind:value={searchTerm}
    on:keydown={(e) => {
      if (e.key === "Enter" && filteredArtists.length > 0) handleSearch(filteredArtists[0]);
    }}
  />
  <button
    class="guess-btn"
    on:click={() => filteredArtists.length > 0 && handleSearch(filteredArtists[0])}
  >
    <!-- Magnifying glass SVG icon -->
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M15.7 14.3L11.9 10.5C12.9 9.3 13.5 7.7 13.5 6C13.5 2.7 10.8 0 7.5 0C4.2 0 1.5 2.7 1.5 6C1.5 9.3 4.2 12 7.5 12C9.2 12 10.8 11.4 12 10.4L15.8 14.2C15.9 14.3 16 14.4 16 14.5C16 14.6 15.9 14.7 15.8 14.8L15.3 15.3C15.2 15.4 15.1 15.5 15 15.5C14.9 15.5 14.8 15.4 14.7 15.3L14.3 14.9L14.3 14.9C14.1 14.7 14.1 14.5 14.3 14.3C14.5 14.1 14.7 14.1 14.9 14.3L14.3 14.9L14.9 14.3L15.1 14.5L15.1 14.5L15.1 14.5L15.5 14.9L15.5 14.9L15.7 14.3ZM7.5 10.5C5 10.5 3 8.5 3 6C3 3.5 5 1.5 7.5 1.5C10 1.5 12 3.5 12 6C12 8.5 10 10.5 7.5 10.5Z" 
        fill="#6d7b98"
      />
    </svg>
  </button>
  {#if resultsVisible}
    <ul class="results">
      {#each filteredArtists as artist}
        <li on:click={() => handleSearch(artist)}>
          {artist}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .search-container {
    position: relative;
    width: 100%;
    max-width: 340px;
    border-radius: 1.625rem;
    margin: 0 auto;
    background-color: inherit;
    border: none;
    box-shadow: 0px 1px 5px 3px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
  }

  .guess-btn {
    position: absolute;
    right: 15px;
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  input {
    width: 100%;
    border: none;
    height: 40px;
    border-radius: 1.625rem;
    font-size: 18px;
    box-sizing: border-box;
    padding-left: 1rem;
    padding-right: 3rem;
    box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.1);
  }

  input:focus {
    outline: none;
  }
  
  .results {
    position: absolute;
    background-color: #ffff;
    opacity: 90%;
    max-width: 320px;
    width: 100%;
    top: 100%;
    left: 0;
    right: 0;
    border-radius: 4px;
    z-index: 1000;
    padding: 10px;
    margin: 2px auto 0;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
    max-height: 300px;
    overflow-y: auto;
  }

  li {
    list-style: none;
    font-size: 120%;
    margin-top: 2px;
    display: flex;
    flex-direction: row;
    justify-content: left;
    color: black;
    padding: 4px 8px;
    border-radius: 4px;
  }

  li:hover {
    background: #ececec;
    cursor: pointer;
  }
</style>