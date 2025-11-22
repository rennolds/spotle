<script>
  import { createEventDispatcher } from "svelte";
  import SoundCloudPlayer from "../SoundCloudPlayer.svelte";

  export let item;
  export let isSelected = false;
  export let isWinner = false;
  export let isLoser = false;
  export let isLeading = false;
  export let isTrailing = false;
  export let showResults = false;
  export let percentage = 0;
  export let activeAudioItemId = null;
  export let currentRound = 0;
  export let isClickable = true;

  const dispatch = createEventDispatcher();

  let audioPlayer;

  function handleClick() {
    if (isClickable && currentRound !== 6) {
      dispatch("select", { itemId: item.id });
    }
  }

  function handleKeydown(e) {
    if (e.key === "Enter" && isClickable && currentRound !== 6) {
      dispatch("select", { itemId: item.id });
    }
  }

  function handleTogglePlay(e) {
    e.stopPropagation();
    dispatch("togglePlay", { item });
  }

  function handleAudioPlay() {
    dispatch("audioPlay", { itemId: item.id });
  }

  function handleAudioPause() {
    dispatch("audioPause", { itemId: item.id });
  }
</script>

<div
  class="item"
  class:winner={isWinner}
  class:loser={isLoser}
  class:selected={isSelected}
  class:leading={isLeading}
  class:trailing={isTrailing}
  class:show-results={showResults}
  class:clickable={isClickable}
  on:click={handleClick}
  on:keydown={handleKeydown}
  role="button"
  tabindex={isClickable ? "0" : "-1"}
>
  <div class="percentage-fill" style="width: {percentage}%" />
  <span class="seed">{item.seed || ""}</span>

  <div class="item-content">
    <div class="image-wrapper">
      <img src={item.image_url} alt={item.label} />

      {#if item.audio_url}
        <SoundCloudPlayer
          bind:this={audioPlayer}
          trackId={item.audio_url}
          on:play={handleAudioPlay}
          on:pause={handleAudioPause}
        />
        <button class="play-button" on:click={handleTogglePlay}>
          {#if activeAudioItemId === item.id}
            <svg
              width="35"
              height="35"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M6 19H10V5H6V19ZM14 5V19H18V5H14Z" fill="white" />
            </svg>
          {:else}
            <svg
              width="35"
              height="35"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M8 5V19L19 12L8 5Z" fill="white" />
            </svg>
          {/if}
        </button>
      {/if}
    </div>

    <div class="item-details">
      <span class="label">{item.label}</span>
      {#if item.sublabel}
        <span class="sublabel">{item.sublabel}</span>
      {/if}
    </div>
  </div>
</div>

<style>
  .item {
    background: linear-gradient(
      135deg,
      rgba(40, 40, 40, 0.9) 0%,
      rgba(20, 20, 20, 0.95) 100%
    );
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 0;
    border-radius: 10px;
    position: relative;
    transition: all 0.2s ease;
    overflow: visible;
    min-height: 68px;
    box-shadow:
      inset 0 1px 1px rgba(255, 255, 255, 0.1),
      inset 0 4px 12px rgba(0, 0, 0, 0.6),
      inset 0 -1px 2px rgba(255, 255, 255, 0.08),
      0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .item.clickable {
    cursor: pointer;
  }

  .item.clickable:hover {
    background-color: #2a2a2a;
  }

  .item.winner {
    font-weight: bold;
    background: rgba(42, 42, 42, 0.8);
  }

  .item.winner .item-content {
    border-radius: 10px;
  }

  .item.loser {
    opacity: 0.6;
  }

  .item.selected {
    border: 2px solid #cbff70;
    box-shadow:
      inset 0 1px 1px rgba(255, 255, 255, 0.1),
      inset 0 4px 12px rgba(0, 0, 0, 0.6),
      inset 0 -1px 2px rgba(255, 255, 255, 0.08),
      0 2px 8px rgba(0, 0, 0, 0.3),
      0 0 20px rgba(203, 255, 112, 0.3);
  }

  .seed {
    position: absolute;
    left: -2rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.85rem;
    color: #888;
    width: 1.5rem;
    text-align: right;
    flex-shrink: 0;
    z-index: 3;
  }

  .item-content {
    display: flex;
    align-items: stretch;
    width: 100%;
    position: relative;
    z-index: 2;
    min-height: 68px;
    overflow: hidden;
    border-radius: 10px;
  }

  .image-wrapper {
    position: relative;
    flex-shrink: 0;
    width: 68px;
    height: 100%;
    padding: 4px;
  }

  .image-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    border-radius: 6px;
  }

  .item-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    overflow: hidden;
    text-align: left;
    flex-grow: 1;
    padding: 0.5rem;
    justify-content: center;
  }

  .label {
    font-size: 0.95rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sublabel {
    font-size: 0.8rem;
    color: #888;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .play-button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    transition: opacity 0.2s;
    z-index: 4;
  }

  .play-button:hover {
    opacity: 0.8;
  }

  .percentage-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background-color: #4a4a4a; /* Loser/trailing color */
    opacity: 0; /* Hidden by default */
    z-index: 1;
    border-radius: 10px;
    transition:
      width 0.3s ease,
      opacity 0.3s ease;
  }

  .item.show-results .percentage-fill {
    opacity: 0.7;
  }

  .item.winner .percentage-fill,
  .item.leading.show-results .percentage-fill {
    background-color: #2e7d32; /* Winner/leading color */
  }

  /* Mobile Styles */
  @media (max-width: 899px) {
    .seed {
      left: -2rem;
      font-size: 0.8rem;
      width: 1.5rem;
    }

    .item {
      min-height: 75px;
    }

    .item-content {
      min-height: 75px;
    }

    .image-wrapper {
      width: 75px;
    }
  }
</style>
