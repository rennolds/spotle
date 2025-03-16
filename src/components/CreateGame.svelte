<script>
    import { createEventDispatcher } from 'svelte';
    import SearchBar from './SearchBar.svelte';
    import GameInfo from './GameInfo.svelte';
    import { browser } from "$app/environment";
    
    export let selectedArtist = null;
    
    let createNote = "";
    let createShareBtnText = "SHARE";
    const dispatch = createEventDispatcher();
    
    function handleSearch(event) {
      dispatch('selectArtist', event.detail);
    }
    
    function handleCreateShare() {
      if (!selectedArtist) return;
      
      const artistUint8Array = new TextEncoder().encode(selectedArtist.name);
      const noteUint8Array = new TextEncoder().encode(createNote);
  
      // Encode the Uint8Array to Base64
      const encodedArtistName = btoa(
        String.fromCharCode.apply(null, artistUint8Array)
      );
      const encodedNote = btoa(String.fromCharCode.apply(null, noteUint8Array));
  
      // Generate the URL with encoded parameters
      let currentUrl = "";
      if (browser) {
        currentUrl = window.location.href;
      }
      const shareURL = `${currentUrl}?artist=${encodedArtistName}&note=${encodedNote}`;
  
      if (browser) {
        // Analytics event if available
        if (typeof gtag === 'function') {
          gtag('event', 'custom_game_share', {
            'artist': selectedArtist.name,
          });
        }
      }
  
      const shareText =
        "I made this Spotle for you! Guess the artist in 10 tries.\n\n" +
        shareURL;
  
      // Share or copy based on device capabilities
      function isMobile() {
        const regex =
          /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
        return regex.test(navigator.userAgent);
      }
      
      if (isMobile() && browser) {
        if (navigator.share) {
          navigator
            .share({
              text: shareText,
            })
            .then(() => {
              console.log("Thanks for sharing!");
            })
            .catch(console.error);
        } else {
          createShareBtnText = "COPIED RESULT";
          navigator.clipboard
            .writeText(shareText)
            .then(() => {
              console.log("copied");
            })
            .catch((error) => {
              alert(`Copy failed! ${error}`);
            });
        }
      } else if (browser) {
        createShareBtnText = "COPIED RESULT";
        navigator.clipboard.writeText(shareText);
      }
    }
  </script>
  
  <div class="create-game-container">
    <GameInfo mode="create" />
  
    <!-- Artist search section (if no artist is selected) -->
    {#if !selectedArtist}
      <SearchBar 
        placeholder="Search for an artist..." 
        on:search={handleSearch} 
      />
    {:else}
      <!-- Selected artist display -->
      <div class="header-row">
        <img
          src={selectedArtist.image_uri}
          alt={selectedArtist.name}
        />
        <h2>{selectedArtist.name}</h2>
      </div>
  
      <div class="create-game-text">
        <p>2.</p>
        <h3>Leave a note for your friend.</h3>
      </div>
      
      <input
        class="create-form"
        placeholder="Write a hint or message here..."
        bind:value={createNote}
      />
      
      <p></p>
      
      <button
        class="styled-btn"
        on:click={handleCreateShare}
      >{createShareBtnText}</button>
    {/if}
  
    <div class="ad-space"></div>
  </div>
  
  <style>
    .create-game-container {
      margin-top: 20px;
    }
    
    .header-row {
      display: flex;
      flex-direction: row;
      align-items: center;
      color: #fff;
      margin-bottom: 5px;
      margin-top: 50px;
    }
  
    .header-row img {
      margin-right: 0.8rem;
      border-radius: 50%;
      object-fit: cover;
      width: 80px;
      height: 80px;
    }
  
    .create-game-text {
      display: flex;
      flex-direction: flex-start;
      margin-top: 30px;
      margin-bottom: 15px;
    }
  
    .create-game-text h3 {
      color: #fff;
      font-size: 18px;
      font-style: normal;
      font-weight: 700;
      line-height: normal;
      display: flex;
    }
  
    .create-game-text p {
      color: #888;
      font-size: 18px;
      font-style: normal;
      font-weight: 700;
      line-height: normal;
      margin-right: 10px;
    }
    
    .create-form {
      width: 320px;
      border-radius: 5px;
      height: 100px;
      padding: 10px;
      font-size: 16px;
    }
    
    .styled-btn {
      width: 170px;
      height: 47px;
      color: #fff;
      text-align: center;
      font-size: 18px;
      font-style: normal;
      font-weight: 700;
      line-height: normal;
      background-color: #8370de;
      font-size: 15px;
      position: relative;
      border-radius: 100px;
      margin-top: 15px;
      cursor: pointer;
      border: none;
    }
    
    .styled-btn:hover {
      transform: scale(1.05);
    }
    
    .ad-space {
      height: 100px;
    }
  </style>