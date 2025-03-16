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
    {/if}
  </div>
  
  <style>
    .header {
      display: flex;
      justify-content: center;
      flex-direction: row;
      width: 340px;
      margin-top: 25px;
    }
  
    .logo {
      margin-left: 15px;
    }
  
    .right {
      margin-left: auto;
      display: flex;
      align-items: center;
      flex-direction: row-reverse;
    }
  
    .icon-btn {
      margin-left: 7.5px;
      z-index: 9001;
    }
  
    .icon-btn:hover {
      cursor: pointer;
    }
  
    .left {
      margin-top: 2.5px;
      display: flex;
      align-items: center;
    }
  </style>