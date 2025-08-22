import { browser } from "$app/environment";

/**
 * Reward Ads Helper Functions
 * Simple implementation using Playwire's skipConfirmation: true approach
 * with custom text replacement functionality
 * 
 * Features:
 * - Custom ad text replacement ("Continue to Spotle after the ad" / "Continue")
 * - Script blocking to prevent timer updates from overwriting custom text
 * - Automatic cleanup and restoration of original functionality
 * 
 * Usage:
 * 1. Import functions: import { isRewardAdReady, showRewardAd, initRewardAds } from "$lib/rewardAds.js"
 * 2. Initialize: initRewardAds() (call once when app starts)
 * 3. Check if ad is ready: isRewardAdReady()
 * 4. Show ad: await showRewardAd()
 * 
 * Example:
 * ```javascript
 * // Initialize once at app start
 * initRewardAds();
 * 
 * // Later, when showing ads
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
 * Text Customization:
 * - The ad timer text "0:00 until reward" is replaced with "Continue to Spotle after the ad"
 * - When reward is granted, text changes to "Continue"
 * - Original timer script is blocked from overwriting custom text
 * 
 * Testing: Add #google_sample_tag=1 to URL to force ad fill during testing
 */

let rewardAdReady = false;
let eventListenersSetup = false;
let timerElement = null;
let timerObserver = null;
let pollingInterval = null;
let customTextActive = false;

/**
 * Start polling to maintain custom text
 * This is a more reliable approach than property overrides
 */
function startTextPolling(customText) {
  customTextActive = true;
  
  // Set initial text
  setCustomText(customText);
  
  // Poll every 100ms to maintain custom text
  pollingInterval = setInterval(() => {
    if (!customTextActive || !timerElement) {
      clearInterval(pollingInterval);
      pollingInterval = null;
      return;
    }
    
    // Use direct DOM access instead of properties that might be overridden
    let currentText = '';
    try {
      currentText = timerElement.innerHTML || timerElement.textContent || timerElement.innerText || '';
    } catch (error) {
      // If we can't read the text, just set our custom text
      currentText = '';
    }
    
    // If the text has been changed by the timer script, restore our custom text
    if (currentText !== customText && 
        (currentText.includes(':') || currentText.includes('until reward') || currentText.trim() === '')) {
      setCustomText(customText);
    }
  }, 100);
}

/**
 * Block the timer script from updating the text element
 * This prevents the original timer from overwriting our custom text
 */
function blockTimerScript() {
  timerElement = document.getElementById('pw-remaining-timer-top');
  if (!timerElement) return;

  // Start with polling approach (most reliable)
  startTextPolling('Continue to Spotle after the ad');

  // Also add MutationObserver as backup for immediate response
  try {
    timerObserver = new MutationObserver((mutations) => {
      if (!customTextActive) return;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          // Check if the text was changed by the timer script
          let currentText = '';
          try {
            currentText = timerElement.innerHTML || timerElement.textContent || timerElement.innerText || '';
          } catch (error) {
            currentText = '';
          }
          
          if (currentText.includes(':') && currentText.includes('until reward')) {
            // This looks like timer text, replace it with our custom text
            setTimeout(() => setCustomText('Continue to Spotle after the ad'), 0);
          }
        }
      });
    });

    // Start observing
    timerObserver.observe(timerElement, {
      childList: true,
      subtree: true,
      characterData: true
    });
  } catch (error) {
    console.warn('MutationObserver failed, using polling only:', error);
  }
}

/**
 * Set custom text on the timer element
 * @param {string} text - The custom text to display
 */
function setCustomText(text) {
  if (timerElement) {
    // Use innerHTML to ensure the text is set
    timerElement.innerHTML = text;
  }
}

/**
 * Wait for the timer element to appear in the DOM
 * @returns {Promise} Promise that resolves when element is found
 */
function waitForTimerElement() {
  return new Promise((resolve) => {
    const checkForElement = () => {
      const element = document.getElementById('pw-remaining-timer-top');
      if (element) {
        resolve(element);
      } else {
        setTimeout(checkForElement, 100);
      }
    };
    checkForElement();
  });
}

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
  window.addEventListener("userAcceptsRewardedAd", async () => {
    console.log("🎬 User started watching reward ad");
    
    // Wait for the timer element to appear and then customize it
    try {
      await waitForTimerElement();
      blockTimerScript();
      setCustomText('Continue to Spotle after the ad');
    } catch (error) {
      console.warn("Could not customize ad text:", error);
    }
  });

  // Listen for ad completion
  window.addEventListener("rewardedAdCompleted", () => {
    console.log("✅ Reward ad completed");
  });

  // Listen for reward granted
  window.addEventListener("rewardedAdRewardGranted", () => {
    console.log("🎁 Reward granted to user");
    // Update text to show "Continue" when reward is granted
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    startTextPolling('Continue');
  });

  // Listen for early close
  window.addEventListener("rewardedCloseButtonTriggered", () => {
    console.log("❌ User closed ad early");
    cleanupTimerCustomization();
  });

  // Listen for close after qualifying for reward
  window.addEventListener("userClosedWithRewardCanResolve", () => {
    console.log("✅ User closed ad but earned reward");
    cleanupTimerCustomization();
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
 * Clean up timer customization
 * Removes observers and stops polling
 */
function cleanupTimerCustomization() {
  // Stop polling
  customTextActive = false;
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
  
  // Disconnect observer
  if (timerObserver) {
    timerObserver.disconnect();
    timerObserver = null;
  }
  
  // Clear element reference
  timerElement = null;
}

/**
 * Reset reward ad ready state
 * Call this if you need to refresh the reward ad availability
 */
export function resetRewardAdState() {
  rewardAdReady = false;
  cleanupTimerCustomization();
}

/**
 * Force update the ad text (useful for testing or manual control)
 * @param {string} text - The text to display
 */
export function updateAdText(text) {
  setCustomText(text);
}
