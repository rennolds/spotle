<script>
    import { createEventDispatcher } from 'svelte';
    import { fly } from 'svelte/transition';
    import { browser } from "$app/environment";
    
    const dispatch = createEventDispatcher();
    
    // Close the slide menu
    function handleClose() {
      dispatch('close');
    }
    
    // Navigate to different sections
    function handleHome() {
      dispatch('navigate', { destination: 'home' });
    }
    
    function handleRewind() {
      dispatch('navigate', { destination: 'rewind' });
    }
    
    function handleCreateGame() {
      dispatch('navigate', { destination: 'create' });
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
      // This is a placeholder - replace with actual URL when available
      // For now it will just close the menu
      handleClose();
    }
</script>

<div class="slide-menu-overlay" on:click={handleClose}>
    <div class="slide-menu" on:click|stopPropagation transition:fly={{ x: -300, duration: 300 }}>
      <div class="menu-close" on:click={handleClose}>
        <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.2099 1.7625L17.3417 0L9.93491 6.9875L2.52816 0L0.659912 1.7625L8.06666 8.75L0.659912 15.7375L2.52816 17.5L9.93491 10.5125L17.3417 17.5L19.2099 15.7375L11.8032 8.75L19.2099 1.7625Z" fill="white"/>
        </svg>
      </div>
      
      <div class="menu-content">
        <div class="menu-navigation">
          <div class="menu-item" on:click={handleHome}>Home</div>
          <div class="menu-item" on:click={handleFollowUs}>Follow Us</div>
          <div class="menu-item" on:click={handlePrivacy}>Privacy</div>
        </div>
        
        <div class="menu-section">
          <h3 class="section-header">Need more Spotle?</h3>
          <div class="menu-item sub-item" on:click={handleRewind}>Spotle Rewind</div>
          <div class="menu-item sub-item">Spotle JAM</div>
          <div class="menu-item sub-item" on:click={handleCreateGame}>Create a Spotle</div>
        </div>
        
        <div class="menu-section">
          <h3 class="section-header">Our Games</h3>
          
          <div class="game-card" on:click={handleHarmonies}>
            <div class="game-image harmonies-image"></div>
            <div class="game-title">Harmonies: Music Connections</div>
          </div>
          
          <div class="game-card" on:click={handleCrosstune}>
            <div class="game-image crosstune-image"></div>
            <div class="game-title">Crosstune: A music crossword</div>
          </div>
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
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.7);
      z-index: 9999;
      display: flex;
      justify-content: center;
    }
    
    .slide-menu {
      width: 100%;
      height: 100%;
      background: #1E1E1E;
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
    
    .menu-close {
      position: absolute;
      top: 15px;
      right: 15px;
      cursor: pointer;
      background: none;
      border: none;
      z-index: 10000;
    }
    
    .menu-navigation {
      margin-top: 40px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    
    .menu-item {
      color: white;
      font-size: 18px;
      padding: 12px 0;
      cursor: pointer;
      text-align: left;
      width: 100%;
    }
    
    .menu-item:hover {
      color: #8370de;
    }
    
    .sub-item {
      font-size: 16px;
      padding: 8px 0;
      padding-left: 10px;
    }
    
    .section-header {
      color: white;
      font-size: 20px;
      font-weight: 700;
      margin: 20px 0 10px 0;
      text-align: left;
    }
    
    .menu-section {
      margin-top: 20px;
      width: 100%;
    }
    
    .game-card {
      margin-bottom: 20px;
      cursor: pointer;
      width: 100%;
    }
    
    .game-image {
      width: 100%;
      height: 120px;
      border-radius: 8px;
      margin-bottom: 8px;
      background-size: cover;
      background-position: center;
    }
    
    .harmonies-image {
      background-image: url('/resources/harmonies.png');
    }
    
    .crosstune-image {
      /* You can replace this with an actual image when available */
      background-color: #333;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
    }
    
    .crosstune-image::after {
      content: "Coming Soon";
      color: white;
      font-size: 14px;
      position: absolute;
    }
    
    .game-title {
      color: white;
      font-size: 16px;
      font-weight: 600;
      text-align: left;
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
      .slide-menu {
        max-width: 500px;
        margin: 0 auto;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
      }
    }
</style>