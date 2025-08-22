import { browser } from "$app/environment";


let rewardAdReady = false;
let eventListenersSetup = false;
let timerElement = null;
let backgroundElement = null;
let animationElement = null;
let checkmarkElement = null;
let timerObserver = null;
let pollingInterval = null;
let customTextActive = false;
let buttonActive = false; // Flag to track when button is active
let currentCustomText = 'Continue to Spotle after the ad'; // Default text
let rewardGrantedText = 'Continue'; // Text when reward is granted

/**
 * Start polling to maintain custom text
 * This is a more reliable approach than property overrides
 */
function startTextPolling() {
  customTextActive = true;
  
  // Set initial text
  setCustomText(currentCustomText);
  
  // Poll every 100ms to maintain custom text
  pollingInterval = setInterval(() => {
    if (!customTextActive || !timerElement || buttonActive) {
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
    // But don't override if we have a button (indicated by the presence of spotle-continue-btn)
    if (currentText !== currentCustomText && 
        !currentText.includes('spotle-continue-btn') &&
        (currentText.includes(':') || currentText.includes ('Reward Granted') || currentText.includes('until reward') || currentText.trim() === '')) {
      setCustomText(currentCustomText);
    }
  }, 75);
}

/**
 * Block the timer script from updating the text element
 * This prevents the original timer from overwriting our custom text
 */
function blockTimerScript() {
  timerElement = document.getElementById('pw-remaining-timer-top');
  backgroundElement = document.getElementById('pw-rewarded-countdown-label');
  animationElement = document.getElementById('countdown-border-animation');
  checkmarkElement = document.getElementById('pw-white-check-mark');
  
  if (!timerElement) return;

  // Apply background styling to the countdown label element
  if (backgroundElement) {
    applyBackgroundStyling();
  }

  // Remove the countdown animation
  if (animationElement) {
    removeCountdownAnimation();
  }

  // Remove the white check mark
  if (checkmarkElement) {
    removeWhiteCheckmark();
  }

  // Start with polling approach (most reliable)
  startTextPolling();

  // Also add MutationObserver as backup for immediate response
  try {
    timerObserver = new MutationObserver((mutations) => {
      if (!customTextActive || buttonActive) return;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          // Check if the text was changed by the timer script
          let currentText = '';
          try {
            currentText = timerElement.innerHTML || timerElement.textContent || timerElement.innerText || '';
          } catch (error) {
            currentText = '';
          }
          
          // Don't override if we have a button
          if (currentText.includes('spotle-continue-btn')) {
            return;
          }
          
          if (currentText.includes(':') && currentText.includes('until reward')) {
            // This looks like timer text, replace it with our custom text
            setTimeout(() => setCustomText(currentCustomText), 0);
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
 * Apply text styling to the timer element
 * Uses Inter font and lime green text color to match the app
 */
function applyTextStyling() {
  if (timerElement) {
    // Apply text styling to match the app's design
    timerElement.style.fontFamily = "'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif";
    timerElement.style.fontWeight = "600";
    timerElement.style.fontSize = "16px";
    timerElement.style.color = "#CBFF70"; // Lime green used throughout the app
    timerElement.style.textAlign = "center";
    timerElement.style.lineHeight = "1.5";
    timerElement.style.fontStyle = "normal";
    timerElement.style.textRendering = "optimizeLegibility";
    timerElement.style.webkitFontSmoothing = "antialiased";
    timerElement.style.mozOsxFontSmoothing = "grayscale";
  }
}

/**
 * Apply background styling to the countdown label element
 * Uses dark background and styling to match the app
 */
function applyBackgroundStyling() {
  if (backgroundElement) {
    // Apply background styling to match the app's design
    backgroundElement.style.backgroundColor = "#121212"; // Dark background to match app
    backgroundElement.style.padding = "8px 12px";
    backgroundElement.style.borderRadius = "8px";
    backgroundElement.style.border = "1px solid #333"; // Subtle border for definition
  }
}

/**
 * Remove the countdown animation by hiding the animation element
 * This creates a cleaner look that matches the app's design
 */
function removeCountdownAnimation() {
  if (animationElement) {
    // Hide the animation element completely
    animationElement.style.display = "none";
    // Also disable any animations as backup
    animationElement.style.animation = "none";
    animationElement.style.animationName = "none";
    animationElement.style.visibility = "hidden";
  }
}

/**
 * Remove the white check mark element by hiding it
 * This creates a cleaner look that matches the app's design
 */
function removeWhiteCheckmark() {
  if (checkmarkElement) {
    // Hide the check mark element completely
    checkmarkElement.style.display = "none";
    checkmarkElement.style.visibility = "hidden";
    checkmarkElement.style.opacity = "0";
  }
}

/**
 * Apply all custom styling to all elements
 * Combines text styling, background styling, removes animation and checkmark
 */
function applyCustomStyling() {
  applyTextStyling();
  applyBackgroundStyling();
  removeCountdownAnimation();
  removeWhiteCheckmark();
}

/**
 * Set custom text on the timer element and apply consistent styling
 * @param {string} text - The custom text to display
 */
function setCustomText(text) {
  if (timerElement) {
    // Use innerHTML to ensure the text is set
    timerElement.innerHTML = text;
    // Apply text styling every time we set text
    applyTextStyling();
  }
}

/**
 * Create and set a continue button in the timer element
 * @param {string} buttonText - The text to display on the button
 */
function setContinueButton(buttonText = 'Continue') {
  console.log('🔘 setContinueButton called with text:', buttonText);
  console.log('🔘 timerElement exists:', !!timerElement);
  
  // Set button active flag to stop all polling and observers
  buttonActive = true;
  customTextActive = false;
  
  // Stop polling immediately
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
    console.log('🔘 Stopped polling for button creation');
  }
  
  if (timerElement) {
    console.log('🔘 Creating button HTML...');
    
    // Create a styled button element
    const buttonHTML = `
      <button 
        id="spotle-continue-btn" 
        style="
          background-color: #CBFF70 !important;
          color: #121212 !important;
          border: none !important;
          border-radius: 100px !important;
          padding: 8px 16px !important;
          font-family: 'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          cursor: pointer !important;
          transition: transform 0.2s ease !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
          display: inline-block !important;
          visibility: visible !important;
          opacity: 1 !important;
          z-index: 9999 !important;
          position: relative !important;
        "
        onmouseover="this.style.transform='scale(1.05)'"
        onmouseout="this.style.transform='scale(1)'"
      >
        ${buttonText}
      </button>
    `;
    
    console.log('🔘 Setting button HTML to timer element...');
    // Set the button HTML
    timerElement.innerHTML = buttonHTML;
    
    console.log('🔘 Timer element innerHTML after setting:', timerElement.innerHTML);
    
    // Start aggressive polling to maintain the button
    const buttonProtectionInterval = setInterval(() => {
      const currentButton = document.getElementById('spotle-continue-btn');
      if (!currentButton && timerElement && buttonActive) {
        console.log('🔘 Button was removed, recreating...');
        timerElement.innerHTML = buttonHTML;
        
        // Re-add event listener
        setTimeout(() => {
          const newButton = document.getElementById('spotle-continue-btn');
          if (newButton) {
            newButton.addEventListener('click', () => {
              console.log('🎯 User clicked continue button, closing ad');
              closeRewardAd();
            });
          }
        }, 50);
      } else if (!buttonActive) {
        clearInterval(buttonProtectionInterval);
      }
    }, 50);
    
    // Add click event listener to close the ad immediately
    const button = document.getElementById('spotle-continue-btn');
    console.log('🔘 Button found immediately:', !!button);
    
    if (button) {
      console.log('🔘 Adding click event listener to button');
      button.addEventListener('click', () => {
        console.log('🎯 User clicked continue button, closing ad');
        closeRewardAd();
      });
    } else {
      console.warn('🔘 Button element not found after creation!');
      // Fallback: try again after a short delay
      setTimeout(() => {
        const delayedButton = document.getElementById('spotle-continue-btn');
        if (delayedButton) {
          delayedButton.addEventListener('click', () => {
            console.log('🎯 User clicked continue button, closing ad');
            closeRewardAd();
          });
        }
      }, 50);
    }
    
    // Apply text styling to the container (but not the button itself)
    applyTextStyling();
  } else {
    console.warn('🔘 timerElement not found, cannot create button');
  }
}

/**
 * Close the reward ad by triggering the close mechanism
 */
function closeRewardAd() {
  try {
    // Try to find and click the close button
    const closeButton = document.querySelector('[data-pw-close]') || 
                       document.querySelector('.pw-close-btn') ||
                       document.querySelector('#pw-close-btn') ||
                       document.querySelector('[aria-label*="close" i]') ||
                       document.querySelector('[title*="close" i]');
    
    if (closeButton) {
      console.log('🎯 Found close button, clicking it');
      closeButton.click();
    } else {
      console.log('🎯 No close button found, trying alternative methods');
      // Try to dispatch a close event
      if (window.ramp && window.ramp.close) {
        window.ramp.close();
      } else {
        // Fallback: try to hide the ad overlay
        const adOverlay = document.querySelector('[id*="ramp"]') || 
                         document.querySelector('[class*="ramp"]') ||
                         document.querySelector('[id*="reward"]') ||
                         document.querySelector('[class*="reward"]');
        if (adOverlay) {
          adOverlay.style.display = 'none';
        }
      }
    }
  } catch (error) {
    console.warn('Could not close reward ad:', error);
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
    
    // Reset button state for new ad
    buttonActive = false;
    customTextActive = false;
    
    // Clean up any existing intervals or observers from previous ads
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    
    if (timerObserver) {
      timerObserver.disconnect();
      timerObserver = null;
    }
    
    console.log("🎬 Reset button state for new ad");
    
    // Wait for the timer element to appear and then customize it
    try {
      await waitForTimerElement();
      blockTimerScript();
      setCustomText(currentCustomText);
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
    console.log("🎁 rewardGrantedText:", rewardGrantedText);
    console.log("🎁 timerElement exists:", !!timerElement);
    
    // Immediately stop all text polling and observers
    customTextActive = false;
    buttonActive = true; // Set this early to prevent any more text overrides
    
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
      console.log("🎁 Stopped polling interval");
    }
    
    // Disconnect observer to prevent it from interfering
    if (timerObserver) {
      timerObserver.disconnect();
      console.log("🎁 Disconnected mutation observer");
    }
    
    // Show the continue button instead of text
    console.log("🎁 Calling setContinueButton...");
    setContinueButton(rewardGrantedText);
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
 * Show a reward ad with optional custom text
 * @param {string} waitingText - Custom text to show while waiting for reward (default: "Continue to Spotle after the ad")
 * @param {string} buttonText - Custom text to show on the continue button when reward is granted (default: "Continue")
 * @returns {Promise} Promise that resolves when reward is granted, rejects on error
 */
export function showRewardAd(waitingText = 'Continue to Spotle after the ad', buttonText = 'Continue') {
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

    // Set custom text from parameters
    currentCustomText = waitingText;
    rewardGrantedText = buttonText;
    
    // Reset button state for new ad (in case of multiple ads)
    buttonActive = false;
    customTextActive = false;
    
    console.log("🎬 Starting new reward ad, reset button state");

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
  buttonActive = false;
  
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
  
  // Disconnect observer
  if (timerObserver) {
    timerObserver.disconnect();
    timerObserver = null;
  }
  
  // Clear element references
  timerElement = null;
  backgroundElement = null;
  animationElement = null;
  checkmarkElement = null;
}

/**
 * Reset reward ad ready state
 * Call this if you need to refresh the reward ad availability
 */
export function resetRewardAdState() {
  rewardAdReady = false;
  cleanupTimerCustomization();
  // Reset text to defaults
  currentCustomText = 'Continue to Spotle after the ad';
  rewardGrantedText = 'Continue';
  // Reset button state
  buttonActive = false;
  customTextActive = false;
}

/**
 * Force update the ad text (useful for testing or manual control)
 * @param {string} text - The text to display
 */
export function updateAdText(text) {
  setCustomText(text);
}

/**
 * Apply app styling to the ad timer element (useful for manual control)
 * Applies Inter font, lime green color, and dark background to match the app
 */
export function applyAdStyling() {
  applyCustomStyling();
}

/**
 * Manually close the reward ad (useful for external control)
 * Attempts to close the ad using various methods
 */
export function closeAd() {
  closeRewardAd();
}

/**
 * Manually create the continue button (useful for testing)
 * @param {string} buttonText - The text to display on the button
 */
export function createContinueButton(buttonText = 'Test Button') {
  console.log('🧪 Manual button creation called');
  setContinueButton(buttonText);
}

/**
 * Debug function to check the current state of ad elements
 */
export function debugAdElements() {
  console.log('🔍 Debug Ad Elements:');
  console.log('  timerElement:', timerElement);
  console.log('  backgroundElement:', backgroundElement);
  console.log('  animationElement:', animationElement);
  console.log('  checkmarkElement:', checkmarkElement);
  console.log('  customTextActive:', customTextActive);
  console.log('  buttonActive:', buttonActive);
  console.log('  currentCustomText:', currentCustomText);
  console.log('  rewardGrantedText:', rewardGrantedText);
  
  // Try to find elements manually
  const manualTimerElement = document.getElementById('pw-remaining-timer-top');
  const manualBackgroundElement = document.getElementById('pw-rewarded-countdown-label');
  const existingButton = document.getElementById('spotle-continue-btn');
  
  console.log('  Manual timer element found:', !!manualTimerElement);
  console.log('  Manual background element found:', !!manualBackgroundElement);
  console.log('  Existing button found:', !!existingButton);
  
  if (manualTimerElement) {
    console.log('  Timer element content:', manualTimerElement.innerHTML);
  }
}
