<script>
  import { onMount, onDestroy } from 'svelte';
  import { showRewardedAd, isRewardedAdReady, onRewardedAdEvent, offRewardedAdEvent } from '$lib/rewardedAd.js';

  // Component props
  export let buttonText = 'Watch Ad to Continue';
  export let disabledText = 'Loading Ad...';
  export let loadingText = 'Playing Ad...';
  export let onReward = () => {}; // Callback when user gets reward
  export let onError = () => {}; // Callback when ad fails

  // Component state
  let adReady = false;
  let isLoading = false;
  let error = null;

  // Event handlers
  const handleAdReady = () => {
    adReady = true;
    error = null;
  };

  const handleRewardGranted = () => {
    isLoading = false;
    onReward();
  };

  const handleAdClosed = () => {
    isLoading = false;
  };

  const handleAdStarted = () => {
    // Ad started, keep loading state
  };

  // Watch ad button click handler
  const watchAd = async () => {
    if (!adReady || isLoading) return;

    isLoading = true;
    error = null;

    try {
      await showRewardedAd();
      // Reward will be handled by the rewardGranted event
    } catch (err) {
      console.error('Failed to show rewarded ad:', err);
      error = err.message;
      isLoading = false;
      adReady = false; // Reset ad ready state on error
      onError(err);
    }
  };

  onMount(() => {
    // Check initial state
    adReady = isRewardedAdReady();

    // Setup event listeners
    onRewardedAdEvent('adReady', handleAdReady);
    onRewardedAdEvent('rewardGranted', handleRewardGranted);
    onRewardedAdEvent('adClosed', handleAdClosed);
    onRewardedAdEvent('adStarted', handleAdStarted);
  });

  onDestroy(() => {
    // Cleanup event listeners
    offRewardedAdEvent('adReady', handleAdReady);
    offRewardedAdEvent('rewardGranted', handleRewardGranted);
    offRewardedAdEvent('adClosed', handleAdClosed);
    offRewardedAdEvent('adStarted', handleAdStarted);
  });

  // Reactive button text
  $: buttonDisplayText = isLoading ? loadingText : (adReady ? buttonText : disabledText);
</script>

<div class="rewarded-ad-container">
  <div class="ad-header">
    <h3>Watch an ad to unlock Rewind</h3>
    <p>Access the last week of Spotle puzzles</p>
  </div>
  
  <button 
    class="rewarded-ad-button"
    class:disabled={!adReady || isLoading}
    class:loading={isLoading}
    on:click={watchAd}
    disabled={!adReady || isLoading}
  >
    {#if isLoading}
      <span class="spinner"></span>
    {/if}
    {buttonDisplayText}
  </button>
  
  {#if error}
    <div class="error-message">
      {error}
    </div>
  {/if}
</div>

<style>
  .rewarded-ad-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 40px 20px;
    max-width: 340px;
    margin: 0 auto;
  }

  .ad-header {
    text-align: center;
    color: white;
  }

  .ad-header h3 {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 8px 0;
    color: #8370de;
  }

  .ad-header p {
    font-size: 16px;
    margin: 0;
    color: #b5b5b5;
  }

  .rewarded-ad-button {
    background: linear-gradient(135deg, #8370de 0%, #6b5fbc 100%);
    color: white;
    border: none;
    border-radius: 12px;
    padding: 16px 32px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 240px;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(131, 112, 222, 0.3);
  }

  .rewarded-ad-button:hover:not(.disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(131, 112, 222, 0.4);
  }

  .rewarded-ad-button:active:not(.disabled) {
    transform: translateY(0);
  }

  .rewarded-ad-button.disabled {
    background: #4a4a4a;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .rewarded-ad-button.loading {
    background: linear-gradient(135deg, #28a745 0%, #20963a 100%);
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
  }

  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .error-message {
    color: #ff6b6b;
    font-size: 14px;
    text-align: center;
    padding: 12px 16px;
    background: rgba(255, 107, 107, 0.1);
    border-radius: 8px;
    border: 1px solid rgba(255, 107, 107, 0.2);
    max-width: 280px;
  }
</style>