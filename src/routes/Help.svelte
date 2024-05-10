<script>
  import { createEventDispatcher } from "svelte";
  import { Confetti } from "svelte-confetti";
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
      <div class="how-to-play-top">
        <div class="how-to-play-header">Guess the artist in 10 tries.</div>
        <div class="how-to-play-list">
          <p>Each guess reveals the attributes of artist.</p>
          <p>
            The color of the tiles will change to show how close your guess was.
          </p>
        </div>
      </div>
      <!-- <div class="how-to-play-description">
        The mystery artist is one of the top 1000 most popular artists. When you
        make a guess, the attributes of your guess that match the mystery artist
        will turn green.
      </div> -->

      <div class="step">
        <div class="step-content">
          <div class="step-text">
            <div class="step-number">Step 1</div>
            <h2 class="step-name">Guess an artist using the search bar.</h2>
          </div>
        </div>
        <div class="help-svg">
          {@html step01}
        </div>
      </div>

      <div class="step">
        <div class="step-content">
          <div class="step-text">
            <div class="step-number">Step 2</div>
            <h2 class="step-name">
              Make another guess based off the new information.
            </h2>
          </div>
        </div>
        <div class="help-svg">
          {@html step02}
        </div>
      </div>

      <div class="step">
        <div class="step-content">
          <div class="step-text">
            <div class="step-number">Step 3</div>
            <h2 class="step-name">
              Keep going until you guess the mystery artist. A new Spotle will
              appear every day!
            </h2>
            <div class="confetti">
              <Confetti
                iterationCount="infinite"
                fallDistance="0px"
                x={[-1.25, 1.25]}
                y={[-0.2, 1]}
                amount="400"
                duration="5000"
              />
            </div>
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
          <div class="attribute-blocks">
            <div class="block incorrect">Incorrect</div>
            <div class="block close">Within 5 years</div>
            <div class="block correct">Correct</div>
          </div>
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
          <div class="attribute-blocks">
            <div class="block incorrect">Incorrect</div>
            <div class="block correct">Correct</div>
          </div>
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
          <div class="attribute-blocks">
            <div class="block incorrect">Incorrect</div>
            <div class="block close">Within 50 spots</div>
            <div class="block correct">Correct</div>
          </div>
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
          <div class="attribute-blocks">
            <div class="block incorrect">Incorrect</div>
            <div class="block correct">Correct</div>
          </div>
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
          <div class="attribute-blocks">
            <div class="block incorrect">Incorrect</div>
            <div class="block correct">Correct</div>
          </div>
        </div>
      </div>

      <div class="attribute">
        <div class="attribute-content">
          <div class="attribute-header-wrapper">
            <h2 class="attribute-header">Nationality</h2>
            <p class="attribute-text">The artists nationality.</p>
          </div>
          <div class="attribute-blocks">
            <div class="block incorrect">Incorrect</div>
            <div class="block close">Same continent</div>
            <div class="block correct">Correct</div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .selector {
    display: flex;
    justify-content: center;
    margin-bottom: 50px;
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
    background-color: #00b011;
    border-radius: 5px;
  }

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    align-items: start;
    z-index: 9999;
    overflow-y: scroll;
    overflow-x: hidden;
    background: black;
    /* backdrop-filter: blur(30px); */
  }

  .content {
    position: relative;
    color: #fff;
    margin: 0;
    place-items: center;
    padding: 0;
    margin: 0 auto;
    text-align: center;
    position: relative;
    overflow-x: hidden;
  }

  @media only screen and (min-width: 768px) {
    /* For desktop: */
    .content {
      width: 400px;
      margin-top: 25px;
      padding-bottom: 50px;
    }
  }

  .close-button {
    position: absolute;
    top: 12px;
    right: 12px;
    cursor: pointer;
    background: none;
    border: none;
  }

  .how-to-play-top {
    padding-left: 5%;
    padding-right: 5%;
  }

  .how-to-play-header {
    color: #fff;
    font-size: 24px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    margin-bottom: 0px;
  }

  .how-to-play-list {
    color: #777;
    text-align: center;
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    margin-bottom: 40px;
  }

  .step {
    margin-bottom: 40px;
  }

  .step-text {
    display: flex;
    flex-direction: column;
    padding-left: 10%;
    padding-right: 10%;
  }

  .step-number {
    color: #fff;
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    flex-shrink: 0;
  }

  .step-content {
    display: flex;
    justify-content: center;
  }

  .step-name {
    align-self: center;
    color: #777;
    font-size: 18px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    margin-top: 0px;
  }

  .help-svg {
    text-align: center;
  }

  .attribute-header {
    color: #fff;
    font-size: 17px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    margin-left: 5px;
  }

  .attribute-text {
    color: #fff;
    font-size: 13px;
    font-style: normal;
    font-weight: 300;
    line-height: normal;
    margin: 0; /* Remove default margin */
    width: 95%;
    margin-left: 5px;
  }

  .attribute {
    display: flex;
    align-items: center; /* Center vertically */
    margin-left: 10px;
  }

  .attribute-header-wrapper {
    flex: 1; /* Take remaining space */
    text-align: left; /* Align text to the left */
  }

  .attribute-blocks {
    display: flex;
    flex-direction: flex-start;
    margin-top: 10px;
  }

  .block {
    display: flex;
    width: 100px;
    height: 50px;
    flex-direction: column;
    justify-content: center;
    flex-shrink: 0;
    color: #fff;
    text-align: center;
    font-size: 16px;
    font-style: normal;
    font-weight: 300;
    line-height: normal;
    margin-left: 5px;
    margin-right: 5px;
    border-radius: 5px;
  }

  .incorrect {
    background-color: #454545;
  }

  .close {
    background-color: rgba(255, 245, 0, 0.7);
  }

  .correct {
    background-color: #00b011;
  }

  .confetti {
    position: absolute;
    top: 95%;
    width: 100vw;
    left: 50%;
    z-index: 9999;
  }
</style>
