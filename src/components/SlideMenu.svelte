<script>
  import { createEventDispatcher, onMount, onDestroy } from "svelte";
  import { fly } from "svelte/transition";
  import { browser } from "$app/environment";
  import { highContrast } from "../routes/store.js";

  const dispatch = createEventDispatcher();

  onMount(() => {
    if (browser) {
      document.body.style.overflow = "hidden";
    }
    if (window.ramp && typeof window.ramp.spaNewPage === "function") {
      window.ramp.spaNewPage("show-rewarded-video");
    }
  });

  onDestroy(() => {
    if (browser) {
      document.body.style.overflow = "auto";
    }
  });

  // Close the slide menu
  function handleClose() {
    dispatch("close");
  }

  // Navigate to different sections
  function handleHome() {
    dispatch("navigate", { destination: "home" });
  }

  function handleRewind() {
    dispatch("navigate", { destination: "rewind" });
  }

  function handleJamMode() {
    dispatch("navigate", { destination: "jam" });
  }

  function handleCreateGame() {
    dispatch("navigate", { destination: "create" });
  }

  function handleFollowUs() {
    if (browser) {
      window.open("https://twitter.com/Spotle_io", "_blank");
    }
  }

  function handlePrivacy() {
    if (browser) {
      window.open("./privacy", "_blank");
    }
  }

  function handleHarmonies() {
    if (browser) {
      window.open("https://harmonies.io", "_blank");
    }
  }

  function handleCrosstune() {
    if (browser) {
      window.open("https://crosstune.io", "_blank");
    }
  }
</script>

<div class="slide-menu-overlay" on:click={handleClose}>
  <div
    class="slide-menu"
    on:click|stopPropagation
    transition:fly={{ x: -300, duration: 300 }}
  >
    <div class="menu-content">
      <div class="menu-navigation">
        <button class="menu-item" on:click={handleHome}>Home</button>
        <button class="menu-item" on:click={handleFollowUs}>Follow Us</button>
        <button class="menu-item" on:click={handlePrivacy}>Privacy</button>
        <div class="menu-item">
          <span>Colorblind Mode</span>
          <label class="switch">
            <input type="checkbox" bind:checked={$highContrast} />
            <span class="slider round"></span>
          </label>
        </div>
      </div>

      <div class="menu-section">
        <h3 class="section-header">Need more Spotle?</h3>
        <button class="menu-item sub-item" on:click={handleRewind}>
          <div class="menu-item-content">
            <div class="menu-item-title">Rewind</div>
            <div class="menu-item-subtitle">Play the last week of Spotle</div>
          </div>
        </button>
        <button class="menu-item sub-item" on:click={handleJamMode}>
          <div class="menu-item-content">
            <div class="menu-item-title">
              <span>Jam</span>
              <!-- <span class="new-badge-container">
                            <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="22" height="16" rx="5" fill="white"/>
                                <path d="M2 16C1.45 16 0.979333 15.8043 0.588 15.413C0.196667 15.0217 0.000666667 14.5507 0 14V2C0 1.45 0.196 0.979333 0.588 0.588C0.98 0.196666 1.45067 0.000666667 2 0H20C20.55 0 21.021 0.196 21.413 0.588C21.805 0.98 22.0007 1.45067 22 2V14C22 14.55 21.8043 15.021 21.413 15.413C21.0217 15.805 20.5507 16.0007 20 16H2ZM2.5 11H3.75V7.5L6.3 11H7.5V5H6.25V8.5L3.75 5H2.5V11ZM8.5 11H12.5V9.75H10V8.65H12.5V7.4H10V6.25H12.5V5H8.5V11ZM14.5 11H18.5C18.7833 11 19.021 10.904 19.213 10.712C19.405 10.52 19.5007 10.2827 19.5 10V5H18.25V9.5H17.15V6H15.9V9.5H14.75V5H13.5V10C13.5 10.2833 13.596 10.521 13.788 10.713C13.98 10.905 14.2173 11.0007 14.5 11Z" fill="#FF6A00"/>
                            </svg>
                        </span> -->
            </div>
            <div class="menu-item-subtitle">
              Solve Spotles as fast as you can
            </div>
          </div>
        </button>
        <button class="menu-item sub-item" on:click={handleCreateGame}>
          <div class="menu-item-content">
            <div class="menu-item-title">Create</div>
            <div class="menu-item-subtitle">
              Make a Spotle for your friends!
            </div>
          </div>
        </button>
      </div>

      <div class="menu-section">
        <h3 class="section-header">Our Games</h3>

        <button class="game-card" on:click={handleHarmonies}>
          <div class="game-image harmonies-image"></div>
          <div class="game-title">Harmonies: Music Connections</div>
        </button>

        <button class="game-card" on:click={handleCrosstune}>
          <div class="new-indicator">
            <div class="line"></div>
            <span class="new-badge-container">
              <svg
                width="22"
                height="16"
                viewBox="0 0 22 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="22" height="16" rx="5" fill="white" />
                <path
                  d="M2 16C1.45 16 0.979333 15.8043 0.588 15.413C0.196667 15.0217 0.000666667 14.5507 0 14V2C0 1.45 0.196 0.979333 0.588 0.588C0.98 0.196666 1.45067 0.000666667 2 0H20C20.55 0 21.021 0.196 21.413 0.588C21.805 0.98 22.0007 1.45067 22 2V14C22 14.55 21.8043 15.021 21.413 15.413C21.0217 15.805 20.5507 16.0007 20 16H2ZM2.5 11H3.75V7.5L6.3 11H7.5V5H6.25V8.5L3.75 5H2.5V11ZM8.5 11H12.5V9.75H10V8.65H12.5V7.4H10V6.25H12.5V5H8.5V11ZM14.5 11H18.5C18.7833 11 19.021 10.904 19.213 10.712C19.405 10.52 19.5007 10.2827 19.5 10V5H18.25V9.5H17.15V6H15.9V9.5H14.75V5H13.5V10C13.5 10.2833 13.596 10.521 13.788 10.713C13.98 10.905 14.2173 11.0007 14.5 11Z"
                  fill="#FF6A00"
                />
              </svg>
            </span>
            <div class="line"></div>
          </div>
          <div class="game-image crosstune-image"></div>
          <div class="game-title">Crosstune: A music crossword</div>
        </button>
      </div>
    </div>

    <div class="menu-footer">
      <div class="footer-text">made by flatwhite studios</div>
      <div class="footer-email">inquiries: company@flatwhite-studios.com</div>
    </div>
  </div>
</div>

<style>
  .slide-menu-overlay {
    position: fixed;
    top: 100px;
    left: 0;
    width: 100vw;
    height: calc(100vh - 100px);
    background: rgba(0, 0, 0, 0.7);
    z-index: 9999;
    display: flex;
    justify-content: center;
  }

  .slide-menu {
    width: 100%;
    height: 100%;
    background: #1e1e1e;
    overflow-y: auto;
    position: relative;
    padding: 20px;
    display: flex;
    flex-direction: column;
  }

  .menu-content {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .menu-navigation {
    margin-top: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .menu-item {
    color: white;
    font-size: 18px;
    padding: 5px 0;
    cursor: pointer;
    text-align: left;
    width: 100%;
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: none;
    border: none;
    font-family: inherit;
  }

  .menu-item:hover {
    color: #8370de;
  }

  .sub-item {
    font-size: 16px;
    padding: 5px 0;
    padding-left: 10px;
  }

  .menu-item-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    transition: transform 0.2s ease;
  }

  .sub-item:hover .menu-item-content {
    transform: translateX(3px);
  }

  .menu-item-title {
    color: white;
    font-size: 16px;
    font-weight: 600;
    display: flex;
    align-items: center;
  }

  .menu-item-title span {
    margin-right: 10px;
  }

  .sub-item:hover .menu-item-title {
    color: #8370de;
  }

  .menu-item-subtitle {
    color: #b5b5b5;
    font-size: 14px;
    font-weight: 400;
    margin-top: 2px;
  }

  /* Toggle Switch Styles */
  .switch {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.4s;
  }

  input:checked + .slider {
    background-color: #f5793a;
  }

  input:checked + .slider:before {
    transform: translateX(20px);
  }

  .slider.round {
    border-radius: 24px;
  }

  .slider.round:before {
    border-radius: 50%;
  }

  .new-badge {
    width: 40px;
    height: 20px;
    margin-left: 10px;
    vertical-align: middle;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }

  .section-header {
    color: white;
    font-size: 20px;
    font-weight: 700;
    margin: 24px 0 16px 0;
    text-align: left;
  }

  .menu-section {
    width: 100%;
  }

  /* Adjust padding and spacing for better appearance */
  .menu-section .sub-item {
    margin-bottom: 8px;
  }

  .game-card {
    margin-bottom: 20px;
    cursor: pointer;
    width: 100%;
    transition: transform 0.2s ease;
    position: relative;
    background: none;
    border: none;
    padding: 0;
  }

  .game-card:hover {
    transform: scale(1.02);
  }

  .game-image {
    width: 100%;
    height: 100px;
    width: 250px;
    border-radius: 8px;
    margin-bottom: 8px;
    background-size: cover;
    background-position: center;
  }

  .harmonies-image {
    background-image: url("/resources/harmonies2.png");
  }

  .crosstune-image {
    background-image: url("/resources/crosstune.png");
  }

  .game-title {
    color: white;
    font-size: 16px;
    font-weight: 600;
    text-align: left;
    margin-top: 6px;
  }

  .new-indicator {
    width: 250px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
    gap: 8px;
  }

  .line {
    flex: 1;
    height: 1px;
    background-color: rgba(255, 255, 255, 0.2);
  }

  .new-badge-container {
    animation: pulse 2s infinite;
    flex-shrink: 0;
  }

  .menu-footer {
    margin-top: auto;
    padding: 20px 0;
    text-align: left;
  }

  .footer-text {
    color: white;
    font-size: 14px;
    margin-bottom: 5px;
  }

  .footer-email {
    color: #888;
    font-size: 12px;
  }

  /* Mobile styles (default) */
  .slide-menu {
    max-width: 100%;
  }

  /* Desktop styles */
  @media (min-width: 768px) {
    .slide-menu-overlay {
      top: 50px;
      height: calc(100vh - 50px);
    }
    .slide-menu {
      max-width: 500px;
      margin: 0 auto;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
    }
  }

  @media (max-width: 768px) {
    .slide-menu {
      padding-bottom: 50px;
    }

    .menu-footer {
      margin-bottom: 25px;
    }
  }
</style>
