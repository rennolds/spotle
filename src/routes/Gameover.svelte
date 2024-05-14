<script>
  import { createEventDispatcher } from "svelte";
  import { onMount } from "svelte";
  import { Confetti } from "svelte-confetti";
  import { fade } from "svelte/transition";

  export let artist;
  export let result;
  export let guessCount;
  export let spotleNumber;
  export let muted;
  export let playingChallenge = false;

  const dispatch = createEventDispatcher();
  let audio;

  onMount(() => {
    if (!muted) {
      audio.volume = 0.5;
      audio.play();
    }
  });

  const winningMessages = {
    1: [
      "Wow. Are they your favorite?",
      "A once in a lifetime moment...",
      "Go buy a lottery ticket.",
      "Have you been waiting for this?",
    ],
    2: [
      "Did you cheat...?",
      "This may never happen again.",
      "Speechless.",
      "Pop the champagne!",
    ],
    3: [
      "You're a savant!",
      "Amazing performance.",
      "Immaculate.",
      "Savor this moment.",
    ],
    4: [
      "4/10...incredible!",
      "Anotha victory for da OG",
      "You are seriously good at this.",
      "You're an all star!",
    ],
    5: ["Five. Impressive.", "Wooo!!", "Amazing!", "Let's GOO!"],
    6: [
      "Tell your friends!",
      "Another day, another Spotle.",
      "A respectable performance.",
      "Way to close it out.",
    ],
    7: ["Congrats!", "Nice job!", "Not bad.", "Way to get it done."],
    8: [
      "8 guesses...it'll pass.",
      "Pretty good.",
      "Congratulations!",
      "It was looking dicey for a second.",
    ],
    9: [
      "Nice, that was close!",
      "Could've gone worse.",
      "A win is a win.",
      "Were you nervous?",
    ],
    10: [
      "On the buzzer!",
      "We never doubted you.",
      "You got it when it mattered most.",
      "Ice in the veins.",
    ],
  };

  function getRandomMessage(guessCount) {
    const messages = winningMessages[guessCount];
    if (messages) {
      const randomIndex = Math.floor(Math.random() * messages.length);
      return messages[randomIndex];
    } else {
      return "Congratulations!";
    }
  }

  function closeOverlay() {
    dispatch("close");
  }

  let shareBtnText = "SHARE RESULT";
  let timeUntilMidnight = 0;
  let timer = null;

  function updateTimer() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(4, 0, 0, 0); // 4 AM UTC = Midnight ET

    if (now > midnight) {
      midnight.setDate(midnight.getDate() + 1); // Increment to next day
    }

    timeUntilMidnight = midnight - now;
  }

  function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  function startTimer() {
    timer = setInterval(updateTimer, 50);
  }

  startTimer();
  let emojis = "";
  let header;
  let shareHeader = "Spotle #" + spotleNumber + "🎧\n\n";

  if (playingChallenge) {
    shareHeader = "Spotle Challenge 🎧\n\n";
  }

  if (result == "W") {
    header = getRandomMessage(guessCount);
    if (playingChallenge) {
      shareHeader = "Spotle Challenge 🎧\n\n";
      header = "Tell your friend it was too easy...";
    }

    for (let i = 0; i < guessCount; i++) {
      emojis = emojis.concat("", "⬜");
    }
    emojis = emojis.concat("", "🟩\n");
  }

  if (result == "L") {
    header = "Tough luck...";
    emojis = "⬜⬜⬜⬜⬜⬜⬜⬜⬜❌\n";
  }

  const shareText = shareHeader + emojis + "\n" + "spotle.io";

  console.log(shareText);

  function handleShare() {
    navigator.clipboard.writeText(shareText);

    function isMobile() {
      const regex =
        /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      return regex.test(navigator.userAgent);
    }
    if (isMobile()) {
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
        // congratulations.innerHTML = "Text copied to clipboard.\t";
        shareBtnText = "COPIED RESULT";
        navigator.clipboard
          .writeText(shareText)
          .then(() => {
            console.log("copied");
          })
          .catch((error) => {
            alert(`Copy failed! ${error}`);
          });
      }
    } else {
      // congratulations.innerHTML = "Text copied to clipboard.\t";
      shareBtnText = "COPIED RESULT";
      navigator.clipboard.writeText(shareText);
    }
  }
</script>

<audio class="hidden" src={artist.song_uri} bind:this={audio}></audio>
<div class="confetti">
  <Confetti duration="3000" amount="250" y={[-1, 2]} x={[-1.25, 1.25]} />
</div>
<div in:fade={{ y: 0, duration: 4000 }} class="overlay">
  <div class="content">
    <div class="header">{header}</div>
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
    <div class="image-container">
      {#if !playingChallenge}
        <div class="image-header">Today's artist is...</div>
      {:else}
        <div class="image-header">The artist is...</div>
      {/if}
      <img
        class="image"
        src={artist.image_uri}
        alt="{artist.artist} Album Cover"
      />
    </div>
    <div class="sub-header">{artist.artist}</div>
    <div class="buttons">
      <button on:click={handleShare} class="button">{shareBtnText}</button>
      {#if !playingChallenge}
        <button class="button purple"
          ><a href="https://harmonies.io" target="_blank">PLAY HARMONIES</a
          ></button
        >
      {:else}
        <button class="button"
          ><a href="https://spotle.io">PLAY TODAYS</a></button
        >
      {/if}
    </div>
    <div class="centered">
      {#if !playingChallenge}
        <div>Next Spotle</div>
        <div>{formatTime(timeUntilMidnight)}</div>
      {/if}
    </div>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }

  .content {
    position: relative;
    width: 320px;
    height: 590px;
    border-radius: 10px;
    background: rgba(48, 48, 48, 0.95);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    color: #fff;
  }

  .header {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 20px;
    text-align: center;
    color: #fff;
    margin-top: 2px;
    width: 85%;
  }

  .close-button {
    position: absolute;
    top: 0.9em;
    right: 0.5em;
    cursor: pointer;
    background: none;
    border: none;
  }

  .image-container {
    margin-bottom: 20px;
    text-align: center;
  }

  .image {
    width: 212px;
    height: 200px;
  }

  .image-header {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
    text-align: left;
    flex-direction: start;
  }

  .sub-header {
    font-size: 18px;
    margin-bottom: 20px;
    text-align: center;
  }

  .buttons {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    flex-direction: column; /* Changed to stack buttons vertically */
    align-items: center; /* Center buttons horizontally */
  }

  .button {
    width: 202.46px;
    height: 43px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
    border-radius: 40px;
    background-color: #8370de;
    color: #fff;
    cursor: pointer;
    margin-bottom: 10px; /* Added margin between buttons */

    text-align: center;
    font-size: 15px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
  }

  .button:hover {
    transform: scale(1.1) perspective(1px);
  }

  .button a {
    color: #fff;
    text-decoration: none; /* no underline */
  }

  .centered {
    text-align: center;
    font-size: 20px;
  }

  .hidden {
    display: none;
  }

  .confetti {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 9999;
  }
</style>
