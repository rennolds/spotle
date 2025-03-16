<script>
    import { createEventDispatcher } from 'svelte';
    import Icon from '../routes/Icon.svelte'; // Assuming we keep the Icon component where it is for now
    import { muted } from '../routes/store.js'; // Using the existing store
    
    export let showBackButton = false;
    export let showHelp = true;
    export let showLogo = true;
    
    const dispatch = createEventDispatcher();
    
    function handleMenuClick() {
      dispatch('menu');
    }
    
    function handleMute() {
      $muted = !$muted;
    }
    
    function handleHelpClick() {
      dispatch('help');
    }
  </script>
  
  <div class="header">
    {#if showBackButton}
      <div class="icon-btn left">
        <div on:click={handleMenuClick}>
          <Icon width={"1.75rem"} height={"1.75rem"} name={"menu"}></Icon>
        </div>
      </div>
    {:else}
      <div class="left-placeholder"></div>
    {/if}
    
    {#if showLogo}
      <div class="logo">
        <!-- SVG Logo -->
        <svg
          width="215"
          height="80"
          viewBox="0 0 922 322"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <!-- SVG paths go here - I've omitted for brevity -->
          <!-- You can copy the SVG content from the original file -->
        </svg>
      </div>
    {/if}
    
    {#if showHelp}
      <div class="right">
        {#if $muted}
          <div class="icon-btn" on:click={handleMute}>
            <Icon width={"1.75rem"} height={"1.75rem"} name={"muted"}></Icon>
          </div>
        {:else}
          <div class="icon-btn" on:click={handleMute}>
            <Icon width={"1.75rem"} height={"1.75rem"} name={"unmuted"}></Icon>
          </div>
        {/if}
        <div class="icon-btn" on:click={handleHelpClick}>
          <Icon width={"1.75rem"} height={"1.75rem"} name={"help"}></Icon>
        </div>
      </div>
    {:else}
      <div class="right-placeholder"></div>
    {/if}
  </div>
  
  <style>
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      max-width: 340px;
      margin: 25px auto 0;
      position: relative;
    }
  
    .logo {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
    }
  
    .right {
      display: flex;
      align-items: center;
    }
  
    .icon-btn {
      margin-left: 7.5px;
      z-index: 9001;
      cursor: pointer;
    }
  
    .left {
      display: flex;
      align-items: center;
    }
    
    .left-placeholder, .right-placeholder {
      width: 30px; /* Ensure space for balanced layout */
    }
  </style>