<script>
  import { onMount } from "svelte";
  import { blur } from "svelte/transition";

  let countdown = 3;

  // Function to decrement the countdown
  function decrementCountdown() {
    countdown--;
    if (countdown === 0) {
      // Start the game or perform any action when countdown reaches 0
      // For example: emit an event to parent component
      // $dispatch('startGame');
    }
  }

  onMount(() => {
    // Start the countdown timer
    const interval = setInterval(decrementCountdown, 1000);
    // Clean up interval on component destruction
    return () => clearInterval(interval);
  });
</script>

{#if countdown > 0}
  <div class="blur-background"></div>
  {#key countdown}
    <div transition:blur class="countdown-container">
      {countdown}
    </div>
  {/key}
{/if}

<style>
  .countdown-container {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000; /* Ensure it's above other elements */
    text-align: center;
    color: white;
    font-size: 3rem;
  }

  /* Blur background */
  .blur-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(4px); /* Adjust blur level as needed */
    z-index: 999; /* Below countdown */
  }
</style>
