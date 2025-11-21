<script>
  import { onMount } from "svelte";
  import { createEventDispatcher, afterUpdate } from "svelte";
  import { fly } from "svelte/transition";
  import moment from "moment";
  import "moment-timezone";
  import { completedDates } from "../routes/store.js";
  import { isRewardAdReady, showRewardAd } from "$lib/rewardAds.js";

  export let dates = []; // Array of dates in MM/DD/YYYY format
  export let currentIndex = 0; // Active date index
  export let lastSixDaysArtists = []; // Array containing the artists objects for each date

  // Force animation refresh on date change
  let animationKey = 0;
  let dateSelectionCount = 1;

  $: {
    // Increment animation key when currentIndex changes
    // This will cause the animation to replay
    if (currentIndex !== undefined) {
      animationKey++;
    }
  }

  $: sortedDates = [...dates];

  const dispatch = createEventDispatcher();

  // Function to handle date selection
  async function selectDate(index) {
    if (index !== currentIndex) {
      dispatch("selectDate", { index });
      dateSelectionCount++;
      if (dateSelectionCount % 2 === 0 && isRewardAdReady()) {
        try {
          await showRewardAd("Continue to Rewind in");
        } catch (error) {

        }
      }
    }
  }

  // Function to format the date for display (MM/DD)
  function formatDate(dateString) {
    const date = moment(dateString, "MM/DD/YYYY");
    return date.format("M/D");
  }

  // Function to check if a date has been completed
  function isDateCompleted(dateString) {
    return $completedDates.includes(dateString);
  }

  // Function to get artist image for a completed date
  function getArtistImage(index) {
    if (lastSixDaysArtists && lastSixDaysArtists[index]) {
      return lastSixDaysArtists[index].image_uri;
    }
    return null;
  }

</script>

<div class="rewind-selector">
  <div class="date-circles">
    {#each sortedDates as date, index (index + "-" + animationKey)}
      <div
        class="date-circle-container"
        on:click={() => selectDate(index)}
        in:fly={{ y: 20, duration: 300, delay: index * 50 }}
      >
        <div class="date-circle {currentIndex === index ? 'active' : ''}">
          {#if isDateCompleted(date) && getArtistImage(index)}
            <!-- Show artist image for completed dates -->
            <img
              src={getArtistImage(index)}
              alt="Completed"
              class="artist-image"
            />
          {:else}
            <!-- Show question mark for incomplete dates -->
            <span class="question-mark">?</span>
          {/if}
        </div>
        <div class="date-label">
          {formatDate(date)}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .rewind-selector {
    width: 100%;
    margin: 15px 0 10px 0;
  }

  .date-circles {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    overflow-x: auto;
    padding: 5px 0;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .date-circles::-webkit-scrollbar {
    display: none;
  }

  .date-circle-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    margin: 0 5px;
  }

  .date-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #454545;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 5px;
    transition: all 0.2s ease;
    overflow: hidden; /* Added to ensure artist images are within circle */
  }

  .date-circle:hover {
    transform: scale(1.05);
    background-color: #555555;
  }

  .date-circle.active {
    background-color: #8370de;
    box-shadow: 0 0 10px rgba(131, 112, 222, 0.5);
  }

  .question-mark {
    color: white;
    font-size: 20px;
    font-weight: bold;
  }

  .date-label {
    font-size: 12px;
    color: #b5b5b5;
    margin-top: 2px;
  }

  .artist-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
