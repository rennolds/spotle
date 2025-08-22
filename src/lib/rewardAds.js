/**
 * Reward Ads Helper Functions
 * Provides a clean API for implementing Playwire H5 reward ads with skipConfirmation: true
 */

import { browser } from "$app/environment";

// State management
let isRewardAdReady = false;
let eventListenersSetup = false;

/**
 * Initialize reward ad event listeners
 * Should be called once when the app starts
 */
export function initializeRewardAdListeners() {
  if (!browser || eventListenersSetup) return;

  // Event: Ad is ready for playback
  window.addEventListener('rewardedAdVideoRewardReady', () => {
    console.log('🎯 Reward ad is ready');
    isRewardAdReady = true;
  });

  // Event: User accepts to watch the ad
  window.addEventListener('userAcceptsRewardedAd', () => {
    console.log('▶️ User started watching reward ad');
  });

  // Event: Ad was watched in full
  window.addEventListener('rewardedAdCompleted', () => {
    console.log('✅ Reward ad completed');
  });

  // Event: User earned the reward
  window.addEventListener('rewardedAdRewardGranted', () => {
    console.log('🎁 Reward granted to user');
  });

  // Event: User closed ad early
  window.addEventListener('rewardedCloseButtonTriggered', () => {
    console.log('❌ User closed reward ad early');
  });

  // Event: User closed ad but can still get reward
  window.addEventListener('userClosedWithRewardCanResolve', () => {
    console.log('⚡ User closed ad but reward can still be granted');
  });

  // Event: User rejected the call-to-action
  window.addEventListener('rejectAdCloseCta', () => {
    console.log('🚫 User rejected ad call-to-action');
  });

  eventListenersSetup = true;
  console.log('🎬 Reward ad event listeners initialized');
}

/**
 * Check if a reward ad is ready to be shown
 * @returns {boolean} True if reward ad is ready
 */
export function isRewardAdAvailable() {
  return browser && isRewardAdReady && window.ramp && typeof window.ramp.manuallyCreatedRewardUi === 'function';
}

/**
 * Show a reward ad using the skipConfirmation: true method
 * @returns {Promise} Resolves when reward is granted, rejects on error or early close
 */
export function showRewardAd() {
  return new Promise((resolve, reject) => {
    if (!browser) {
      reject(new Error('Not in browser environment'));
      return;
    }

    if (!window.ramp || typeof window.ramp.manuallyCreatedRewardUi !== 'function') {
      reject(new Error('Ramp not loaded or reward ads not available'));
      return;
    }

    if (!isRewardAdReady) {
      reject(new Error('No reward ad available at this time'));
      return;
    }

    console.log('🚀 Attempting to show reward ad');

    // Use the skipConfirmation: true method as recommended
    window.ramp.manuallyCreatedRewardUi({ skipConfirmation: true })
      .then(() => {
        console.log('✅ Reward ad flow completed successfully');
        resolve();
      })
      .catch((error) => {
        console.error('❌ Reward ad error:', error);
        reject(error);
      });
  });
}

/**
 * Wait for reward ad to become ready
 * @param {number} timeout - Timeout in milliseconds (default: 10000)
 * @returns {Promise} Resolves when ad is ready, rejects on timeout
 */
export function waitForRewardAd(timeout = 10000) {
  return new Promise((resolve, reject) => {
    if (!browser) {
      reject(new Error('Not in browser environment'));
      return;
    }

    if (isRewardAdReady) {
      resolve();
      return;
    }

    const timeoutId = setTimeout(() => {
      reject(new Error('Timeout waiting for reward ad'));
    }, timeout);

    const checkReady = () => {
      if (isRewardAdReady) {
        clearTimeout(timeoutId);
        window.removeEventListener('rewardedAdVideoRewardReady', checkReady);
        resolve();
      }
    };

    window.addEventListener('rewardedAdVideoRewardReady', checkReady);
  });
}

/**
 * Reset reward ad state (useful for testing or manual state management)
 */
export function resetRewardAdState() {
  if (browser) {
    isRewardAdReady = false;
    console.log('🔄 Reward ad state reset');
  }
}

/**
 * Get current reward ad state for debugging
 * @returns {object} Current state information
 */
export function getRewardAdState() {
  return {
    isReady: isRewardAdReady,
    eventListenersSetup,
    rampLoaded: browser && !!window.ramp,
    rewardApiAvailable: browser && window.ramp && typeof window.ramp.manuallyCreatedRewardUi === 'function'
  };
}
