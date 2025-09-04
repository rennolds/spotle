<script>
  import { createEventDispatcher } from "svelte";
  import { onMount } from "svelte";
  import SearchBar from "./SearchBar.svelte";
  import GameInfo from "./GameInfo.svelte";
  import { browser } from "$app/environment";
  import { isRewardAdReady, showRewardAd } from "$lib/rewardAds.js";

  export let selectedArtist = null;

  let createNote = "";
  let createShareBtnText = "CREATE GAME";
  let showResults = false;
  let shareURL = "";
  let copyButtonText = "COPY";
  const dispatch = createEventDispatcher();

  onMount(() => {
    console.log("CreateGame mounted");
    window.ramp.spaNewPage('show-rewarded-video');
  });

  function handleSearch(event) {
    dispatch("selectArtist", event.detail);
  }

  async function handleCreateGame() {
    if (!selectedArtist) return;

    // Try to show reward ad first
    if (isRewardAdReady()) {
      try {
        await showRewardAd("Your share link will be ready in");
        console.log("User watched reward ad before creating game!");
      } catch (error) {
        console.log(
          "Reward ad failed or was skipped, continuing anyway:",
          error
        );
      }
    }

    // Generate the share URL
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
    shareURL = `${currentUrl}?artist=${encodedArtistName}&note=${encodedNote}`;

    if (browser) {
      // Analytics event if available
      if (typeof gtag === "function") {
        gtag("event", "custom_game_created", {
          artist: selectedArtist.name,
        });
      }
    }

    // Show the results page
    showResults = true;
  }

  function handlePlayNow() {
    if (browser && shareURL) {
      window.open(shareURL, "_blank");

      if (typeof gtag === "function") {
        gtag("event", "custom_game_play_now", {
          artist: selectedArtist?.name,
        });
      }
    }
  }

  function handleCopy() {
    if (browser) {
      navigator.clipboard
        .writeText(shareURL)
        .then(() => {
          copyButtonText = "COPIED!";
          setTimeout(() => {
            copyButtonText = "COPY";
          }, 2000);
        })
        .catch((error) => {
          console.error("Copy failed:", error);
        });
    }
  }

  function handleShare() {
    const shareText =
      "I made this Spotle for you! Guess the artist in 10 tries.\n\n" +
      shareURL;

    if (browser && navigator.share) {
      navigator
        .share({
          text: shareText,
        })
        .then(() => {
          console.log("Thanks for sharing!");
        })
        .catch(console.error);
    } else {
      // Fallback to copy
      handleCopy();
    }
  }

  function isMobile() {
    if (!browser) return false;
    const regex =
      /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return regex.test(navigator.userAgent);
  }

  function handleBackToCreate() {
    showResults = false;
    createShareBtnText = "CREATE GAME";
    copyButtonText = "COPY";
  }
</script>

<div class="create-game-container">
  {#if !showResults}
    <GameInfo mode="create" />

    <!-- Create Game Page -->
    <!-- Always show the search bar - Important change here -->
    <div class="search-bar-container">
      <SearchBar
        placeholder="Search for an artist..."
        on:search={handleSearch}
      />
    </div>

    <!-- Selected artist display (only shown when an artist is selected) -->
    {#if selectedArtist}
      <div class="selected-artist-container">
        <div class="header-row">
          <img src={selectedArtist.image_uri} alt={selectedArtist.name} />
          <h2>{selectedArtist.name}</h2>
        </div>

        <div class="create-game-text">
          <p>2.</p>
          <h3>Leave a note for your friend.</h3>
        </div>

        <textarea
          class="create-form"
          placeholder="Write a hint or message here..."
          bind:value={createNote}
        ></textarea>

        <button class="styled-btn" on:click={handleCreateGame}
          >{createShareBtnText}</button
        >
      </div>
    {/if}

    <div class="ad-space"></div>
  {:else}
    <!-- Results Page -->
    <div class="results-container">
      <h2 class="results-title">Your link is ready!</h2>

      <div class="url-container">
        <input type="text" class="url-input" value={shareURL} readonly />
      </div>

      <div class="action-buttons">
        <button class="play-now-btn" on:click={handlePlayNow}>
          PLAY NOW
        </button>

        {#if isMobile()}
          <button class="share-btn" on:click={handleShare}> SHARE </button>
        {:else}
          <button class="copy-btn" on:click={handleCopy}>
            {copyButtonText}
          </button>
        {/if}
      </div>

      <button class="back-btn" on:click={handleBackToCreate}>
        ← Create Another
      </button>
    </div>
  {/if}
</div>

<style>
  .create-game-container {
    width: 100%;
    max-width: 340px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .search-bar-container {
    width: 100%;
    margin: 5px 0; /* reduced margin */
    position: relative;
    z-index: 50;
  }

  .selected-artist-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start; /* Changed from center to flex-start */
    margin-top: 10px; /* reduced margin */
  }

  .header-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    color: #fff;
    margin: 15px 0 5px 0; /* reduced margins */
    width: 100%;
  }

  .header-row img {
    margin-right: 0.8rem;
    border-radius: 50%;
    object-fit: cover;
    width: 80px;
    height: 80px;
  }

  .header-row h2 {
    color: #fff;
    font-size: 24px;
    font-weight: 700;
    text-align: left; /* Added text alignment */
  }

  .create-game-text {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 10px 0; /* reduced margins */
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

  .create-form {
    width: 320px;
    border-radius: 5px;
    height: 100px;
    padding: 10px;
    font-size: 16px;
    margin-bottom: 15px;
    resize: none;
  }

  .styled-btn {
    width: 170px;
    height: 47px;
    color: black;
    text-align: center;
    font-size: 15px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    background-color: #cbff70;
    border-radius: 100px;
    margin-top: 5px;
    cursor: pointer;
    border: none;
    align-self: center; /* Added to center the button */
  }

  .styled-btn:hover {
    transform: scale(1.05);
  }

  .ad-space {
    height: 60px; /* reduced height */
    margin-top: 15px; /* reduced margin */
  }

  /* Results Page Styles */
  .results-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 20px;
  }

  .results-title {
    color: #fff;
    font-size: 24px;
    font-weight: 700;
    text-align: center;
    margin-bottom: 30px;
  }

  .url-container {
    width: 100%;
    margin-bottom: 20px;
  }

  .url-input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #333;
    border-radius: 8px;
    background-color: #1a1a1a;
    color: #fff;
    font-size: 14px;
    font-family: monospace;
    text-align: center;
    box-sizing: border-box;
  }

  .url-input:focus {
    outline: none;
    border-color: #cbff70;
  }

  .action-buttons {
    display: flex;
    gap: 15px;
    margin-bottom: 30px;
    width: 100%;
    justify-content: center;
  }

  .play-now-btn {
    background-color: #cbff70;
    color: #121212;
    border: none;
    border-radius: 100px;
    padding: 12px 24px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  .play-now-btn:hover {
    transform: scale(1.05);
  }

  .copy-btn,
  .share-btn {
    background-color: transparent;
    color: #cbff70;
    border: 2px solid #cbff70;
    border-radius: 100px;
    padding: 12px 24px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 110px; /* Fixed width to prevent stretching when text changes to COPIED! */
    text-align: center;
  }

  .copy-btn:hover,
  .share-btn:hover {
    transform: scale(1.05);
    background-color: rgba(203, 255, 112, 0.1);
  }

  .back-btn {
    background-color: transparent;
    color: #888;
    border: none;
    font-size: 16px;
    cursor: pointer;
    transition: color 0.2s ease;
    margin-top: 20px;
  }

  .back-btn:hover {
    color: #cbff70;
  }
</style>
