<script>
    import { createEventDispatcher, onMount } from 'svelte';
    import GameModeTile from './GameModeTile.svelte';
    import { browser } from "$app/environment";
    
    export let yesterdaysArtist = null;
    
    let isHovered = false;
    const dispatch = createEventDispatcher();
    
    function handlePlay() {
      dispatch('play', { mode: 'normal' });
    }
    
    function handleCreate() {
      dispatch('play', { mode: 'create' });
    }
    
    function handleRewind() {
      dispatch('play', { mode: 'rewind' });
    }
    
    function handleHelp() {
      dispatch('showHelp');
    }
    
    function handleHarmoniesClick() {
      if (browser) {
        window.open("https://harmonies.io", "_blank");
      }
    }
  </script>
  
  <div class="splash-screen">
    <!-- Logo SVG is already in the header -->
    
    <div class="tagline">
      <p>10 guesses, 1000 artists</p>
      <p>Will you win today?</p>
    </div>
    
    <button class="styled-btn main-btn" on:click={handlePlay}>PLAY</button>
    <p></p>
    <p class="learn-btn" on:click={handleHelp}>How to Play</p>
    <p></p>
    
    <div
      class="yesterdays-artist {isHovered ? 'hovered' : ''}"
      on:mouseover={() => (isHovered = true)}
      on:mouseout={() => (isHovered = false)}
    >
      <img
        class="artist-image"
        src={isHovered ? yesterdaysArtist.image_uri : "resources/cd.png"}
        alt="Artist Image"
      />
      <p class="artist-name">
        {isHovered ? yesterdaysArtist.name : "yesterday's"}
      </p>
    </div>
    
    <div class="module-list">
      <h2 class="module-list-header">Need more Spotle?</h2>
      
      <GameModeTile 
        title="Create Game"
        description="Create your own Spotle and send it to your friends!"
        backgroundImage="resources/create.png"
        iconName="create"
        buttonText="Create"
        on:select={handleCreate}
      />
      
      <GameModeTile 
        title="Spotle Rewind"
        description="Missed a few days? Rewind and play the last week."
        backgroundImage="resources/rewind.png"
        iconName="rewind"
        buttonText="Play"
        on:select={handleRewind}
      />
    </div>
    
    <div class="module-list">
      <h2 class="module-list-header">Play our new game!</h2>
      <div class="module">
        <a
          class="harmonies-link"
          href="https://harmonies.io"
          target="_blank"
          on:click|preventDefault={handleHarmoniesClick}
        >
          <div
            class="module-image-harmonies"
            style="background-image: url(/resources/harmonies.png)"
          ></div>
          <div class="module-description">
            <div class="module-text-content">
              <h2>Harmonies</h2>
              <p>The music connections game!</p>
            </div>
            <button class="styled-btn harmonies-module-btn">
              Play
            </button>
          </div>
        </a>
      </div>
    </div>
    
    <div class="ad-space"></div>
  </div>
  
  <style>
    .splash-screen {
      margin-top: 15px;
    }
  
    .splash-screen p {
      color: #b5b5b5;
      text-align: center;
      font-size: 18px;
      font-style: normal;
      font-weight: 300;
      line-height: normal;
      margin-top: 7.5px;
      margin-bottom: 7.5px;
    }
  
    .splash-screen button:hover {
      transform: scale(1.075) perspective(1px);
    }
  
    .tagline {
      margin-bottom: 30px;
      margin-top: -20px;
    }
  
    .yesterdays-artist {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      margin-bottom: 50px;
      margin-top: 70px;
      cursor: pointer;
    }
  
    .yesterdays-artist p {
      margin-left: 15px;
    }
  
    .artist-image {
      border-radius: 500px;
      width: 40px;
      height: 40px;
      object-fit: contain;
    }
  
    .module {
      display: flex;
      justify-content: center;
      flex-direction: column;
      width: 100%;
      align-items: center;
      margin-bottom: 50px;
      position: relative;
    }
  
    .module a {
      text-decoration: none;
    }
  
    .module:hover {
      cursor: pointer;
    }
  
    .module-list-header {
      color: #fff;
      font-size: 21px;
      font-style: normal;
      font-weight: 700;
      line-height: normal;
      display: flex;
      flex-direction: flex-start;
      margin-left: 5px;
    }
  
    .module-image-harmonies {
      border-radius: 5px 5px 0px 0px;
      width: 329px;
      height: 275px;
      margin-bottom: 0px;
      padding-bottom: 0px;
      background-position: center;
      background-size: contain;
    }
  
    .module-text-content {
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
  
    .module-text-content p {
      font-size: 12px;
    }
  
    .learn-btn {
      margin-top: 15px !important;
      color: #8370de !important;
    }
  
    .learn-btn:hover {
      cursor: pointer;
    }
  
    .main-btn {
      position: relative;
      width: 190px;
      border-radius: 100px;
      height: 48px;
      color: #fff;
      text-align: center;
      font-size: 18px;
      font-style: normal;
      font-weight: 700;
      line-height: normal;
      margin-top: 25px;
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
    }
  
    .harmonies-module-btn {
      width: 120px;
      height: 35px !important;
      align-self: center;
      margin-right: 20px;
    }
  
    .ad-space {
      height: 100px;
    }
</style>