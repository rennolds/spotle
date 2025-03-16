<script>
    import { createEventDispatcher } from 'svelte';
    
    // Props
    export let disabled = false;
    export let placeholder = "Type a guess here...";
    
    // Internal state
    let searchTerm = "";
    let filteredArtists = [];
    
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
  
    $: filteredArtists = fuzzySearch(searchTerm);
    
    function handleSearch(artistName) {
      if (filteredArtists.length == 0) {
        return;
      }
      
      if (artistName === null) {
        return;
      }
      
      dispatch('search', artistName);
      searchTerm = "";
    }
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
        if (e.key === "Enter") handleSearch(filteredArtists[0]);
      }}
    />
    <button
      class="guess-btn"
      on:click={() => handleSearch(filteredArtists[0])}
      ><i class="fa fa-search fa-lg"></i></button
    >
    <ul
      class="results"
      style="display: {filteredArtists.length > 0 ? 'block' : 'none'}"
    >
      {#each filteredArtists as artist}
        <li on:click={() => handleSearch(artist)}>
          {artist}
        </li>
      {/each}
    </ul>
  </div>
  
  <style>
    .search-container {
      position: relative;
      width: 340px;
      border-radius: 1.625rem;
      margin: auto;
      background-color: inherit;
      border: none;
      box-shadow: 0px 1px 5px 3px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;
    }
  
    .guess-btn {
      margin-right: 15px;
    }
  
    input::value {
      margin-left: 2rem;
    }
  
    input {
      width: 100%;
      border: none;
      height: 40px;
      border-radius: 1.625rem;
      font-size: 18px;
      box-sizing: border-box;
      padding-left: 1rem;
      box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.1);
    }
  
    input:focus {
      outline: none;
    }
  
    button {
      position: absolute;
      border: none;
      background: none;
    }
  
    button:focus {
      outline: none;
    }
  
    button i {
      color: #6d7b98;
      cursor: pointer;
    }
    
    .results {
      position: absolute;
      background-color: #ffff;
      opacity: 90%;
      max-width: 320px;
      width: 100%;
      top: 100%;
      border-radius: 4px;
      z-index: 1;
      padding: 10px;
    }
  
    li {
      list-style: none;
      font-size: 120%;
      margin-top: 2.5px;
      display: flex;
      flex-direction: start;
      justify-content: left;
      color: black;
    }
  
    li:hover {
      background: #ececec;
      cursor: pointer;
    }
  </style>