<script>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
  let audio;

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
      <div class="step-text">
        <h2 class="step-number">01 &nbsp;</h2>
        <h2 class="step-name">Guess an artist</h2>
      </div>
      <div class="help-svg"></div>
    </div>
    <div class="step">
      <div class="step-text">
        <h2 class="step-number">01 &nbsp;</h2>
        <h2 class="step-name">Guess an artist</h2>
      </div>
      <div class="help-svg"></div>
    </div>
    <div class="step">
      <div class="step-text">
        <h2 class="step-number">01 &nbsp;</h2>
        <h2 class="step-name">Guess an artist</h2>
      </div>
      <div class="help-svg"></div>
    </div>
    {:else}
      <h2>DEBUT ALBUM YEAR</h2>
      <p>
        Debut album year will turn yellow when within 5 years of the mystery
        artist's debut album year. A down arrow indicates the mystery artists
        album came out earlier than your guess, and vice versa.
      </p>
      <h2>GROUP SIZE</h2>
      <p>
        Group Size indicates how many members are in the group (example, Justin
        Bieber is solo, The Beatles are group size four).
      </p>
      <h2>LISTENER RANK</h2>
      <p>
        The artists ranking on Spotify by all-time streams. An up arrow
        indicates the mystery artist is more popular than your guess is. Yellow
        indicates your guess was within 50 of the mystery artist.
      </p>
      <h2>GENDER</h2>
      <p>When the band has men and women, gender will say mixed.</p>
      <h2>GENRE</h2>
      <p>
        We've limited the genres to keep the game simple: Rock, Pop, Hip Hop,
        Country, Alternative, R&B, K-Pop, Latin, Classical, Jazz, Metal, and
        Electronic. This happened cause our friends argued about Green Day being
        punk or rock.
      </p>
      <h2>NATIONALITY</h2>
      <p>
        Nationality will turn yellow when the nationality of the artist you
        guessed is on the same continent as the mystery artist's nationality.
      </p>
    {/if}
  </div>
</div>

<style>
  .selector {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
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
  }

  .content {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 10px;
    background: rgba(18, 18, 18, 0.8);
    backdrop-filter: blur(5px);
    padding: 20px;
    color: #fff;
  }

  .close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    cursor: pointer;
    background: none;
    border: none;
  }

  h2 {
    color: #6ad074;
    display: flex;
    flex-direction: start;
    font-size: 20px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
  }

  p {
    margin-top: -5px;
    color: #fff;
    display: flex;
    flex-direction: start;
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
  }

  .step-text {
    display: flex;
    flex-direction: row;
  }

  .step-text .step-number {
    color: #b3b3b3;
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
  }

  .step-text .step-name {
    color: #fff;
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
  }
</style>
