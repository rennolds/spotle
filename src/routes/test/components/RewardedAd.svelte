<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";

  export let PUB_ID;
  export let WEBSITE_ID;
  export let buttonText = "Watch Ad to Continue";
  export let disabledText = "Loading Ad...";
  export let loadingText = "Playing Ad...";
  export let onReward = () => {}; // Callback when user gets reward
  export let onError = () => {}; // Callback when ad fails

  let adReady = false;
  let isLoading = false;
  let error = null;
  let rampLoaded = false;

  // Event handlers for rewarded video lifecycle
  const handleAdReady = () => {
    console.log("🎥 Rewarded ad is ready to play!");
    adReady = true;
    error = null;
  };

  const handleRewardGranted = () => {
    console.log("✅ Reward granted!");
    isLoading = false;
    onReward();
  };

  const handleAdClosed = () => {
    console.log("❌ Ad closed");
    isLoading = false;
  };

  const handleUserAccepts = () => {
    console.log("🎬 User started watching ad");
  };

  const handleAdCompleted = () => {
    console.log("🎉 Ad watched in full");
  };

  // Watch ad function
  const watchAd = async () => {
    console.log("🎬 watchAd called", { adReady, isLoading, rampLoaded });

    if (!adReady || isLoading || !rampLoaded) {
      console.log("❌ Cannot watch ad:", { adReady, isLoading, rampLoaded });
      return;
    }

    console.log("🚀 Starting rewarded ad...");
    isLoading = true;
    error = null;

    try {
      console.log("🔍 Checking ramp availability:", {
        rampExists: !!window.ramp,
        manuallyCreatedRewardUiExists: !!window.ramp?.manuallyCreatedRewardUi,
        rampMethods: window.ramp ? Object.keys(window.ramp) : [],
      });

      if (window.ramp && window.ramp.manuallyCreatedRewardUi) {
        console.log("📞 Calling manuallyCreatedRewardUi...");
        const result = await window.ramp.manuallyCreatedRewardUi({
          skipConfirmation: true,
        });
        console.log("✅ manuallyCreatedRewardUi result:", result);
        // Success is handled by the rewardedAdRewardGranted event
      } else {
        throw new Error(
          "Ramp rewarded ad not available - manuallyCreatedRewardUi method not found"
        );
      }
    } catch (err) {
      console.error("❌ Failed to show rewarded ad:", err);
      error = err.message;
      isLoading = false;
      adReady = false;
      onError(err);
    }
  };

  onMount(() => {
    if (!browser || !PUB_ID || !WEBSITE_ID) {
      console.log("❌ Missing Publisher Id and Website Id");
      return;
    }

    console.log(
      "🎯 RewardedAd mounting with PUB_ID:",
      PUB_ID,
      "WEBSITE_ID:",
      WEBSITE_ID
    );

    // Initialize Ramp if not already done
    window.ramp = window.ramp || {};
    window.ramp.que = window.ramp.que || [];

    // Load Ramp script if not already loaded
    if (
      !document.querySelector(`script[src*="${PUB_ID}/${WEBSITE_ID}/ramp.js"]`)
    ) {
      console.log("🔄 Loading Ramp script...");
      const configScript = document.createElement("script");
      configScript.src = `https://cdn.intergient.com/${PUB_ID}/${WEBSITE_ID}/ramp.js`;
      document.body.appendChild(configScript);

      configScript.onload = () => {
        rampLoaded = true;
        console.log("✅ Ramp script loaded for rewarded ads");

        // Debug what's available on window.ramp
        setTimeout(() => {
          console.log(
            "🔍 Available ramp methods:",
            Object.keys(window.ramp || {})
          );
          console.log(
            "🔍 manuallyCreatedRewardUi available:",
            typeof window.ramp?.manuallyCreatedRewardUi
          );
        }, 1000);
      };

      configScript.onerror = () => {
        console.error("❌ Failed to load Ramp script");
        error = "Failed to load ad script";
      };
    } else {
      console.log("✅ Ramp script already loaded");
      rampLoaded = true;

      // Debug what's available on window.ramp
      setTimeout(() => {
        console.log(
          "🔍 Available ramp methods:",
          Object.keys(window.ramp || {})
        );
        console.log(
          "🔍 manuallyCreatedRewardUi available:",
          typeof window.ramp?.manuallyCreatedRewardUi
        );
      }, 100);
    }

    // Set up event listeners for rewarded video lifecycle
    window.addEventListener("rewardedAdVideoRewardReady", handleAdReady);
    window.addEventListener("rewardedAdRewardGranted", handleRewardGranted);
    window.addEventListener("rewardedCloseButtonTriggered", handleAdClosed);
    window.addEventListener("userClosedWithRewardCanResolve", handleAdClosed);
    window.addEventListener("userAcceptsRewardedAd", handleUserAccepts);
    window.addEventListener("rewardedAdCompleted", handleAdCompleted);

    console.log("🎧 Event listeners set up for rewarded ad");

    // Add a timeout to check if ad becomes ready
    setTimeout(() => {
      if (!adReady) {
        console.warn(
          "⚠️ Rewarded ad not ready after 5 seconds. This might be normal if there's no ad fill."
        );
        console.log("🔍 Current ramp state:", {
          rampExists: !!window.ramp,
          rampLoaded,
          adReady,
          availableMethods: window.ramp ? Object.keys(window.ramp) : [],
        });
      }
    }, 5000);
  });

  onDestroy(() => {
    if (browser) {
      // Clean up event listeners
      window.removeEventListener("rewardedAdVideoRewardReady", handleAdReady);
      window.removeEventListener(
        "rewardedAdRewardGranted",
        handleRewardGranted
      );
      window.removeEventListener(
        "rewardedCloseButtonTriggered",
        handleAdClosed
      );
      window.removeEventListener(
        "userClosedWithRewardCanResolve",
        handleAdClosed
      );
      window.removeEventListener("userAcceptsRewardedAd", handleUserAccepts);
      window.removeEventListener("rewardedAdCompleted", handleAdCompleted);
    }
  });

  // Reactive button text
  $: buttonDisplayText = isLoading
    ? loadingText
    : adReady
      ? buttonText
      : disabledText;
</script>

<div class="rewarded-ad-container">
  <div class="ad-header">
    <h3>Watch an ad to unlock Rewind</h3>
    <p>Access the last week of Spotle puzzles</p>
  </div>

  <button
    class="rewarded-ad-button"
    class:disabled={!adReady || isLoading || !rampLoaded}
    class:loading={isLoading}
    on:click={watchAd}
    disabled={!adReady || isLoading || !rampLoaded}
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

  <!-- Debug info -->
  <div class="debug-info">
    <p><strong>Debug Info:</strong></p>
    <p>Ramp Loaded: {rampLoaded ? "✅" : "❌"}</p>
    <p>Ad Ready: {adReady ? "✅" : "❌"}</p>
    <p>Loading: {isLoading ? "✅" : "❌"}</p>

    <!-- Force ready button for testing -->
    {#if !adReady && rampLoaded}
      <button
        class="debug-button"
        on:click={() => {
          adReady = true;
          console.log("🧪 Forced ad ready for testing");
        }}
      >
        🧪 Force Ready (Test)
      </button>
    {/if}

    <!-- Add sample tag button for testing -->
    <button
      class="debug-button"
      on:click={() => {
        const currentUrl = new URL(window.location);
        currentUrl.hash = "google_sample_tag=1";
        window.location.href = currentUrl.toString();
      }}
      style="background: #007bff; margin-top: 4px;"
    >
      🧪 Add Sample Tag & Reload
    </button>
  </div>
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
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
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

  .debug-info {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 12px;
    font-size: 12px;
    color: #ccc;
    max-width: 280px;
    text-align: left;
  }

  .debug-info p {
    margin: 4px 0;
  }

  .debug-button {
    background: #ff9500;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    margin-top: 8px;
  }
</style>
