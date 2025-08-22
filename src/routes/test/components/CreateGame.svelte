<script>
  import { createEventDispatcher } from "svelte";
  import SearchBar from "./SearchBar.svelte";
  import GameInfo from "./GameInfo.svelte";
  import { browser } from "$app/environment";
  import { isRewardAdReady, showRewardAd } from "$lib/rewardAds.js";

  export let selectedArtist = null;

  let createNote = "";
  let createShareBtnText = "SHARE";
  const dispatch = createEventDispatcher();

  function handleSearch(event) {
    dispatch("selectArtist", event.detail);
  }

  async function handleCreateShare() {
    if (!selectedArtist) return;

    // Try to show reward ad first
    if (isRewardAdReady()) {
      try {
        await showRewardAd("Your share link will be ready in");
        console.log("User watched reward ad before sharing Create Game!");
      } catch (error) {
        console.log(
          "Reward ad failed or was skipped, continuing anyway:",
          error
        );
      }
    }

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
      if (typeof gtag === "function") {
        gtag("event", "custom_game_share", {
          artist: selectedArtist.name,
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

  <!-- Always show the search bar - Important change here -->
  <div class="search-bar-container">
    <SearchBar placeholder="Search for an artist..." on:search={handleSearch} />
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

      <button class="styled-btn" on:click={handleCreateShare}
        >{createShareBtnText}</button
      >
    </div>
  {/if}

  <div class="ad-space"></div>
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
</style>
