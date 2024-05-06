<script>
  import { createEventDispatcher } from "svelte";
  import step01 from "$lib/assets/howtoplay01.svg?raw";
  import step02 from "$lib/assets/howtoplay02.svg?raw";
  import step03 from "$lib/assets/howtoplay03.svg?raw";

  const dispatch = createEventDispatcher();

  function closeOverlay() {
    dispatch("close");
  }

  let showHowToPlay = true;

  function toggleSection() {
    showHowToPlay = !showHowToPlay;
  }
</script>

<div class="overlay">
  <div class="content">
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

    <div class="selector">
      <button on:click={toggleSection} class={showHowToPlay ? "active" : ""}
        >HOW TO PLAY</button
      >
      <button on:click={toggleSection} class={!showHowToPlay ? "active" : ""}
        >ATTRIBUTES</button
      >
    </div>

    {#if showHowToPlay}
      <div class="step">
        <div class="step-content">
          <div class="step-text">
            <div class="step-number">01</div>
            <h2 class="step-name">Make another guess trying to get closer!</h2>
          </div>
        </div>
        <div class="help-svg">
          {@html step01}
        </div>
      </div>

      <div class="step">
        <div class="step-content">
          <div class="step-text">
            <div class="step-number">02</div>
            <h2 class="step-name">Guess an artist.</h2>
          </div>
        </div>
        <div class="help-svg">
          {@html step02}
        </div>
      </div>

      <div class="step">
        <div class="step-content">
          <div class="step-text">
            <div class="step-number">03</div>
            <h2 class="step-name">
              Keep going until you guess the mystery artist. A new Spotle will
              appear every day!
            </h2>
          </div>
        </div>
        <div class="help-svg">
          {@html step03}
        </div>
      </div>
    {:else}
      <div class="attribute">
        <div class="attribute-content">
          <div class="attribute-header-wrapper">
            <h2 class="attribute-header">Debut Album</h2>
            <p class="attribute-text">
              The year the artists debut album released. If they have no albums,
              first mixtape or EP.
            </p>
          </div>
          <div class="attribute-svg"></div>
        </div>
      </div>

      <div class="attribute">
        <div class="attribute-content">
          <div class="attribute-header-wrapper">
            <h2 class="attribute-header">Members</h2>
            <p class="attribute-text">
              The number of members in the group. If members have come and gone,
              it will be the most well-known lineup.
            </p>
          </div>
          <div class="attribute-svg"></div>
        </div>
      </div>

      <div class="attribute">
        <div class="attribute-content">
          <div class="attribute-header-wrapper">
            <h2 class="attribute-header">Popularity</h2>
            <p class="attribute-text">
              How popular the artist is compared to other artists. Taylor Swift
              is #1.
            </p>
          </div>
          <div class="attribute-svg"></div>
        </div>
      </div>

      <div class="attribute">
        <div class="attribute-content">
          <div class="attribute-header-wrapper">
            <h2 class="attribute-header">Gender</h2>
            <p class="attribute-text">
              The artist's gender. If it's a group with men and women, it will
              say Mixed.
            </p>
          </div>
          <div class="attribute-svg"></div>
        </div>
      </div>

      <div class="attribute">
        <div class="attribute-content">
          <div class="attribute-header-wrapper">
            <h2 class="attribute-header">Genre</h2>
            <p class="attribute-text">
              The artists genre. The options are: Rock, Pop, Hip Hop, Country,
              Alternative, R&B, Latin, Classical, Jazz, Metal, and Electronic.
            </p>
          </div>
          <div class="attribute-svg"></div>
        </div>
      </div>

      <div class="attribute">
        <div class="attribute-content">
          <div class="attribute-header-wrapper">
            <h2 class="attribute-header">Nationality</h2>
            <p class="attribute-text">The artists nationality.</p>
          </div>
          <div class="attribute-svg"></div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .selector {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
    margin-top: 30px;
  }

  .selector button {
    background: none;
    border: none;
    padding: 10px 20px;
    margin: 0 10px;
    cursor: pointer;
    color: #fff;
  }

  .selector button.active {
    background-color: #6ad074;
    border-radius: 5px;
  }

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: start;
    z-index: 9999;
    overflow-y: scroll;
    overflow-x: none;
    background: rgba(18, 18, 18, 0.8);
    backdrop-filter: blur(5px);
  }

  .content {
    position: relative;
    color: #fff;
    margin: 0;
    /* display: flex;
    justify-content: center; */
    place-items: center;
    min-width: 320px;
    min-height: 100vh;
    max-width: 360px;
    margin: 0 auto;
    text-align: center;
    position: relative;
    overflow-x: none;
  }

  .close-button {
    position: absolute;
    top: 10px;
    right: -10px;
    cursor: pointer;
    background: none;
    border: none;
  }

  .step h2 {
    color: #b3b3b3;
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
  }

  .step {
    display: flex;
    align-items: center;
    flex-direction: column;
    margin-bottom: 20px; /* Adjust as needed */
  }

  .step-text {
    display: flex;
    flex-direction: row;
  }

  .step-number {
    color: #fff;
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    flex-shrink: 0;
    margin-right: 10px; /* Adjust as needed */
  }

  .step-content {
    display: flex;
    justify-content: flex-start; /* Adjusted from center to flex-start */
    flex-grow: 1;
  }

  .step-name {
    margin-top: 0;
    margin-bottom: 5px; /* Adjust as needed */
  }

  .help-svg {
    text-align: center;
  }

  .attribute-header {
    color: #fff;
    font-size: 16px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
  }

  .attribute-text {
    color: #fff;
    font-size: 12px;
    font-style: normal;
    font-weight: 300;
    line-height: normal;
  }

  .attribute {
    display: flex;
    align-items: center; /* Center vertically */
  }

  .attribute-header-wrapper {
    flex: 1; /* Take remaining space */
    text-align: left; /* Align text to the left */
  }

  .attribute-text {
    margin: 0; /* Remove default margin */
  }

  .attribute-svg {
    margin: 0 auto; /* Center horizontally */
    background-color: blue;
    width: 100px;
    height: 100px;
  }
</style>
