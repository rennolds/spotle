<script>
  import { createEventDispatcher } from 'svelte';
  import Icon from '../routes/Icon.svelte';
  import { muted } from '../routes/store.js';
  
  // Always show menu button by removing the showBackButton prop
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
  
  function handleStatsClick() {
    dispatch('stats');
  }
</script>

<div class="navbar-container">
<div class="navbar">
  <div class="navbar-left">
    <!-- Always show the menu button -->
    <div class="icon-btn" on:click={handleMenuClick}>
      <Icon width={"1.75rem"} height={"1.75rem"} name={"menu"}></Icon>
    </div>
  </div>
  
  {#if false}
    <div class="navbar-logo">
      <svg
        width="120"
        height="44"
        viewBox="0 0 922 322"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clip-path="url(#clip0_536_74)">
          <mask
            id="mask0_536_74"
            style="mask-type:luminance"
            maskUnits="userSpaceOnUse"
            x="637"
            y="-1"
            width="285"
            height="323"
          >
            <path
              d="M637.521 -0.333252H921.521V321.651H637.521V-0.333252Z"
              fill="white"
            />
          </mask>
          <g mask="url(#mask0_536_74)">
            <path
              d="M912.848 147.474C917.64 147.474 921.52 151.349 921.52 156.141V165.266C921.52 170.057 917.64 173.932 912.848 173.932C908.062 173.932 904.182 170.057 904.182 165.266V156.141C904.182 151.349 908.062 147.474 912.848 147.474Z"
              fill="#8370DE"
            />
          </g>
          
          <!-- Note: Full SVG path is shortened for brevity -->
          
          <path
            d="M292.811 202.721C285.504 202.721 279.004 201.815 273.311 200.013C267.613 198.211 262.863 195.841 259.061 192.909C255.269 189.982 252.363 186.763 250.353 183.263L261.811 169.263H263.623C266.79 173.971 270.811 177.721 275.686 180.513C280.561 183.305 286.269 184.7 292.811 184.7C298.379 184.7 302.582 183.529 305.415 181.18C308.248 178.82 309.665 175.57 309.665 171.43C309.665 168.93 309.207 166.841 308.29 165.159C307.384 163.482 305.873 162.044 303.748 160.846C301.634 159.638 298.78 158.607 295.186 157.742L281.644 154.638C272.17 152.487 265.113 148.898 260.478 143.867C255.837 138.841 253.519 132.32 253.519 124.305C253.519 118.346 255.004 113.112 257.978 108.596C260.962 104.07 265.3 100.565 270.998 98.0754C276.691 95.5754 283.504 94.3254 291.436 94.3254C299.561 94.3254 306.509 95.3984 312.29 97.5338C318.082 99.6588 322.978 102.94 326.978 107.367L316.665 121.492H314.853C311.879 118.367 308.467 116.029 304.623 114.471C300.774 112.904 296.379 112.117 291.436 112.117C285.712 112.117 281.358 113.133 278.373 115.159C275.399 117.174 273.915 119.961 273.915 123.513C273.915 126.82 274.957 129.461 277.04 131.43C279.134 133.404 282.754 134.945 287.894 136.055L301.748 138.93C311.983 141.096 319.405 144.763 324.019 149.93C328.629 155.086 330.936 161.82 330.936 170.138C330.936 176.721 329.519 182.45 326.686 187.325C323.853 192.2 319.571 195.987 313.853 198.68C308.129 201.372 301.113 202.721 292.811 202.721Z"
            fill="white"
          />
          <defs>
            <clipPath id="clip0_536_74">
              <rect width="922" height="322" fill="white" />
            </clipPath>
          </defs>
        </g>
      </svg>
    </div>
  {/if}
  
  <div class="navbar-right">
    <div class="icon-btn" on:click={handleStatsClick}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 12H6V21H2V12Z" fill="white"/>
        <path d="M10 8H14V21H10V8Z" fill="white"/>
        <path d="M18 3H22V21H18V3Z" fill="white"/>
      </svg>
    </div>
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
</div>
</div>

<style>
.navbar-container {
  position: sticky;
  top: 50px; /* Leave space for the ad above */
  width: 100%;
  height: 50px;
  background-color: #121212;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 100;
  margin-bottom: 15px; /* Add bottom margin for spacing */
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 100%;
  height: 100%;
  padding: 0 15px;
}

.navbar-left, .navbar-right {
  display: flex;
  align-items: center;
}

.navbar-logo {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
}

.icon-btn {
  margin: 0 7.5px;
  cursor: pointer;
}

.navbar-right {
  display: flex;
  justify-content: flex-end;
}

/* Desktop styles */
@media (min-width: 768px) {
  .navbar {
    max-width: 800px;
    margin: 0 auto;
  }
}
</style>