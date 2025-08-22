import { browser } from "$app/environment";

/**
 * Reward Ads Helper Functions
 * Simple implementation using Playwire's skipConfirmation: true approach
 * 
 * Usage:
 * 1. Import functions: import { isRewardAdReady, showRewardAd } from "$lib/rewardAds.js"
 * 2. Check if ad is ready: isRewardAdReady()
 * 3. Show ad: await showRewardAd()
 * 
 * Example:
 * ```javascript
 * if (isRewardAdReady()) {
 *   try {
 *     await showRewardAd();
 *     // User earned reward!
 *   } catch (error) {
 *     // Handle error
 *   }
 * }
 * ```
 * 
 * Testing: Add #google_sample_tag=1 to URL to force ad fill during testing
 */

let rewardAdReady = false;
let eventListenersSetup = false;

/**
 * Initialize reward ad event listeners
 * Should be called once when the app starts
 */
export function initRewardAds() {
  if (!browser || eventListenersSetup) return;

  // Listen for when reward ad is ready
  window.addEventListener("rewardedAdVideoRewardReady", () => {
    rewardAdReady = true;
    console.log("✅ Reward ad is ready");
  });

  // Listen for user accepting to watch ad
  window.addEventListener("userAcceptsRewardedAd", () => {
    console.log("🎬 User started watching reward ad");
  });

  // Listen for ad completion
  window.addEventListener("rewardedAdCompleted", () => {
    console.log("✅ Reward ad completed");
  });

  // Listen for reward granted
  window.addEventListener("rewardedAdRewardGranted", () => {
    console.log("🎁 Reward granted to user");
  });

  // Listen for early close
  window.addEventListener("rewardedCloseButtonTriggered", () => {
    console.log("❌ User closed ad early");
  });

  // Listen for close after qualifying for reward
  window.addEventListener("userClosedWithRewardCanResolve", () => {
    console.log("✅ User closed ad but earned reward");
  });

  eventListenersSetup = true;
}

/**
 * Check if a reward ad is ready to be shown
 * @returns {boolean} True if reward ad is ready
 */
export function isRewardAdReady() {
  return rewardAdReady && browser && window.ramp && window.ramp.manuallyCreateRewardUi;
}

/**
 * Show a reward ad
 * @returns {Promise} Promise that resolves when reward is granted, rejects on error
 */
export function showRewardAd() {
  return new Promise((resolve, reject) => {
    if (!browser) {
      reject(new Error("Not in browser environment"));
      return;
    }

    if (!window.ramp || !window.ramp.manuallyCreateRewardUi) {
      reject(new Error("Ramp not loaded or reward ads not available"));
      return;
    }

    if (!rewardAdReady) {
      reject(new Error("No reward ad available"));
      return;
    }

    // Use skipConfirmation: true for clean integration
    window.ramp.manuallyCreateRewardUi({ skipConfirmation: true })
      .then(() => {
        console.log("✅ Reward granted");
        resolve();
      })
      .catch((error) => {
        console.error("❌ Rewarded video error:", error);
        reject(error);
      });
  });
}

/**
 * Reset reward ad ready state
 * Call this if you need to refresh the reward ad availability
 */
export function resetRewardAdState() {
  rewardAdReady = false;
}
