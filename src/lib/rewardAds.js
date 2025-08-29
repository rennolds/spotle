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
let currentCustomText = 'Continue to Spotle in'; // Default text
let rewardGrantedText = 'Continue'; // Text when reward is granted
let countdownInterval = null; // For our custom countdown timer
let countdownProtectionInterval = null; // For protecting our countdown from interference
let continueProtectionInterval = null; // For protecting our continue text from interference
let remainingSeconds = 0; // Time remaining in seconds
let timerCaptured = false; // Flag to track if we've captured the original timer
let isPageVisible = true; // Track page visibility state

/**
 * Parse timer text in format "M:SS until reward" and return total seconds
 * @param {string} timerText - The timer text to parse
 * @returns {number} Total seconds remaining, or 0 if parsing fails
 */
function parseTimerText(timerText) {
  try {
    // Look for pattern like "1:30 until reward" or "0:45 until reward"
    const match = timerText.match(/(\d+):(\d{2})\s*until\s*reward/i);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const totalSeconds = (minutes * 60) + seconds;
      return totalSeconds;
    }
  } catch (error) {
    console.warn('Error parsing timer text:', error);
  }
  return 0;
}

/**
 * Capture the original timer value before we override it
 * This allows us to get the actual countdown time from the ad
 * @returns {boolean} True if timer was successfully captured
 */
function captureOriginalTimer() {
  if (!timerElement || timerCaptured) return false;
  
  try {
    const originalText = timerElement.innerHTML || timerElement.textContent || timerElement.innerText || '';
    
    if (originalText.includes('until reward')) {
      remainingSeconds = parseTimerText(originalText);
      if (remainingSeconds > 0) {
        timerCaptured = true;
        return true;
      }
    }
    
    // Also try to parse other timer formats that might appear
    const timeMatch = originalText.match(/(\d+):(\d{2})/);
    if (timeMatch && !originalText.includes(currentCustomText)) {
      const minutes = parseInt(timeMatch[1], 10);
      const seconds = parseInt(timeMatch[2], 10);
      remainingSeconds = (minutes * 60) + seconds;
      if (remainingSeconds > 0) {
        timerCaptured = true;
        return true;
      }
    }
  } catch (error) {
    console.warn('Error capturing original timer:', error);
  }
  
  return false;
}

/**
 * Try to capture timer with multiple attempts
 * @returns {Promise<boolean>} True if timer was captured
 */
async function captureTimerWithRetries() {
  const maxAttempts = 10;
  const delayMs = 200;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    
    if (captureOriginalTimer()) {
      return true;
    }
    
    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  console.warn('⏱️ Failed to capture timer after', maxAttempts, 'attempts');
  return false;
}

/**
 * Start our custom countdown timer
 * Updates the display every second with remaining time
 */
function startCustomCountdown() {
  if (remainingSeconds <= 0) {
    console.warn('⏱️ No valid countdown time available');
    return;
  }
  
  
  // Update display immediately
  updateCountdownDisplay();
  
  // Start interval to update every second
  countdownInterval = setInterval(() => {
    // Only decrease timer if page is visible
    if (isPageVisible) {
      remainingSeconds--;
      
      if (remainingSeconds <= 0) {
        stopCustomCountdown();
        // Timer completed, show continue text
        setContinueText(rewardGrantedText);
      } else {
        updateCountdownDisplay();
      }
    }
    // If page is not visible, just skip this tick but keep the interval running
  }, 1000);
  
  // Start aggressive protection against original timer interference
  startCountdownProtection();
}

/**
 * Start countdown protection to prevent original timer from interfering
 */
function startCountdownProtection() {
  if (countdownProtectionInterval) {
    clearInterval(countdownProtectionInterval);
  }
  
  // Check every 50ms to maintain our countdown display
  countdownProtectionInterval = setInterval(() => {
    if (!timerElement || !countdownInterval || !timerCaptured || buttonActive) {
      stopCountdownProtection();
      return;
    }
    
    try {
      const currentText = timerElement.innerHTML || timerElement.textContent || timerElement.innerText || '';
      const isOurCountdownFormat = currentText.startsWith(currentCustomText) && currentText.includes(':');
      
      // If the text has been changed to something that's not our format, restore it
      if (!isOurCountdownFormat && currentText !== rewardGrantedText) {
        updateCountdownDisplay();
      }
    } catch (error) {
      // Ignore errors
    }
  }, 50);
}

/**
 * Stop countdown protection
 */
function stopCountdownProtection() {
  if (countdownProtectionInterval) {
    clearInterval(countdownProtectionInterval);
    countdownProtectionInterval = null;
  }
}

/**
 * Start continue text protection to prevent Playwire from overriding with "Reward Granted"
 */
function startContinueProtection() {
  if (continueProtectionInterval) {
    clearInterval(continueProtectionInterval);
  }
  
  let lastAppliedStyling = false;
  let consecutiveCorrections = 0;
  
  // Very aggressive 16ms intervals (60fps) to catch any changes immediately
  continueProtectionInterval = setInterval(() => {
    if (!timerElement || !buttonActive) {
      stopContinueProtection();
      return;
    }
    
    try {
      const currentText = timerElement.innerHTML || timerElement.textContent || timerElement.innerText || '';
      
      // If the text has been changed away from our continue text, restore it immediately
      if (currentText !== rewardGrantedText) {
        consecutiveCorrections++;
        
        // Force our text back using multiple methods
        timerElement.innerHTML = rewardGrantedText;
        timerElement.textContent = rewardGrantedText;
        timerElement.innerText = rewardGrantedText;
        
        // Also try direct node manipulation as a fallback
        if (timerElement.childNodes.length > 0) {
          timerElement.childNodes[0].nodeValue = rewardGrantedText;
        }
        
        // Only reapply styling occasionally to prevent jerking
        if (consecutiveCorrections % 10 === 1 && !lastAppliedStyling) {
          applyContinueTextStyling();
          lastAppliedStyling = true;
          setTimeout(() => { lastAppliedStyling = false; }, 500);
        }
      } else {
        // Reset counter when text is correct
        if (consecutiveCorrections > 0) {
          consecutiveCorrections = 0;
        }
      }
    } catch (error) {
      // Ignore errors
    }
  }, 16); // Very aggressive 16ms (60fps) for immediate response
}

/**
 * Stop continue text protection
 */
function stopContinueProtection() {
  if (continueProtectionInterval) {
    clearInterval(continueProtectionInterval);
    continueProtectionInterval = null;
  }
}

/**
 * Start a dedicated MutationObserver for continue text protection
 */
function startContinueMutationObserver() {
  if (!timerElement) return;

  
  const continueObserver = new MutationObserver((mutations) => {
    if (!buttonActive || !timerElement) return;
    
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' || mutation.type === 'characterData') {
        const currentText = timerElement.innerHTML || timerElement.textContent || timerElement.innerText || '';
        
        if (currentText !== rewardGrantedText) {
          
          // Immediately restore our text
          timerElement.innerHTML = rewardGrantedText;
          timerElement.textContent = rewardGrantedText;
          timerElement.innerText = rewardGrantedText;
          
          // Don't reapply styling to prevent jerking - it should be persistent
        }
      }
    });
  });
  
  // Observe all possible changes
  continueObserver.observe(timerElement, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeOldValue: true,
    characterDataOldValue: true
  });
  
  // Store reference for cleanup
  timerElement._continueObserver = continueObserver;
}

/**
 * Stop the continue MutationObserver
 */
function stopContinueMutationObserver() {
  if (timerElement && timerElement._continueObserver) {
    timerElement._continueObserver.disconnect();
    delete timerElement._continueObserver;
  }
}

/**
 * Update the countdown display with current remaining time
 * Shows custom text followed by the countdown timer
 */
function updateCountdownDisplay() {
  if (!timerElement || remainingSeconds <= 0) return;
  
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const displayText = `${currentCustomText} ${formattedTime}`;
  
  setCustomText(displayText);
}

/**
 * Stop the custom countdown timer
 */
function stopCustomCountdown() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  
  // Also stop countdown protection
  stopCountdownProtection();
}

/**
 * Block the timer script from updating the text element
 * This prevents the original timer from overwriting our custom text
 */
async function blockTimerScript() {
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
  
  // Try to capture the original timer value first
  const captured = await captureTimerWithRetries();
  
  if (captured) {
    startCustomCountdown();
  } else {
    // Fallback: use a default countdown time (most ads are around 30 seconds)
    console.warn('⏱️ Could not capture original timer, using default 30 second countdown');
    remainingSeconds = 30;
    timerCaptured = true;
    startCustomCountdown();
  }

  // Also add MutationObserver as backup for capturing timer if we missed it initially
  try {
    timerObserver = new MutationObserver((mutations) => {
      if (buttonActive) return;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          // Check if the text was changed by the timer script
          let currentText = '';
          try {
            currentText = timerElement.innerHTML || timerElement.textContent || timerElement.innerText || '';
          } catch (error) {
            currentText = '';
          }
          
          // Don't override if we have continue text
          if (currentText === rewardGrantedText) {
            return;
          }
          
          // If we have an active countdown, aggressively protect it
          if (countdownInterval && timerCaptured) {
            const isOurCountdownFormat = currentText.startsWith(currentCustomText) && currentText.includes(':');
            if (!isOurCountdownFormat) {
              updateCountdownDisplay();
            }
            return;
          }
          
          const isOurCountdownFormat = currentText.startsWith(currentCustomText) && currentText.includes(':');
          if (isOurCountdownFormat) {
            return;
          }
          
          // If we haven't captured the timer yet and see timer text, try to capture it
          if (!timerCaptured && (currentText.includes(':') && (currentText.includes('until reward') || currentText.match(/\d+:\d{2}/)))) {
            if (captureOriginalTimer()) {
              // Stop any existing polling and start countdown
              if (pollingInterval) {
                clearInterval(pollingInterval);
                pollingInterval = null;
              }
              customTextActive = false;
              startCustomCountdown();
            }
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
 * Set continue text and add click handler to timer element
 * @param {string} continueText - The text to display (default: "Continue")
 */
function setContinueText(continueText = 'Continue') {
  
  // Set button active flag to stop all other protection systems
  buttonActive = true;
  customTextActive = false;
  
  // STOP ALL OTHER INTERVALS/OBSERVERS to prevent conflicts
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
  
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  
  if (countdownProtectionInterval) {
    clearInterval(countdownProtectionInterval);
    countdownProtectionInterval = null;
  }
  
  if (timerObserver) {
    timerObserver.disconnect();
    timerObserver = null;
  }
  
  if (timerElement) {
    // Start protection IMMEDIATELY, even before setting text
    startContinueProtection();
    startContinueMutationObserver();
    
    // Apply styling FIRST to prevent layout shifts
    applyContinueTextStyling();
    
    // Then set the continue text
    timerElement.innerHTML = continueText;
    
    // Force the text again immediately after setting it
    setTimeout(() => {
      if (timerElement) {
        timerElement.innerHTML = continueText;
        timerElement.textContent = continueText;
        timerElement.innerText = continueText;
      }
    }, 10);
    
    // Remove any existing click listeners to prevent duplicates
    timerElement.removeEventListener('click', handleContinueClick);
    
    // Add click event listener to close the ad
    timerElement.addEventListener('click', handleContinueClick);
  }
}

/**
 * Handle continue text click
 */
function handleContinueClick() {
  closeRewardAd();
}

/**
 * Apply clickable styling to the continue text
 */
function applyContinueTextStyling() {
  if (timerElement) {
    // Check if styling is already applied to avoid redundant applications
    if (timerElement.style.backgroundColor === 'rgb(203, 255, 112)') {
      return;
    }
    
    const styles = {
      fontFamily: "'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif",
      fontWeight: "600",
      fontSize: "16px",
      color: "#121212",
      backgroundColor: "#CBFF70",
      textAlign: "center",
      lineHeight: "24px",
      padding: "8px 24px",
      borderRadius: "100px",
      cursor: "pointer",
      transition: "transform 0.2s ease",
      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
      display: "inline-block",
      border: "none",
      fontStyle: "normal",
      textRendering: "optimizeLegibility",
      webkitFontSmoothing: "antialiased",
      mozOsxFontSmoothing: "grayscale",
      verticalAlign: "middle",
      whiteSpace: "nowrap",
      boxSizing: "border-box",
      margin: "0 auto",
      position: "relative",
      zIndex: "1000",
      minWidth: "120px",
      minHeight: "40px",
      // Prevent layout shifts by enabling GPU acceleration
      transform: "translateZ(0)",
      willChange: "transform"
    };
    
    // Apply all styles at once
    Object.assign(timerElement.style, styles);
    
    // Add hover effects only if not already added
    if (!timerElement.hasAttribute('data-hover-listeners')) {
      timerElement.addEventListener('mouseenter', () => {
        timerElement.style.transform = 'scale(1.05)';
      });
      
      timerElement.addEventListener('mouseleave', () => {
        timerElement.style.transform = 'scale(1)';
      });
      
      timerElement.setAttribute('data-hover-listeners', 'true');
    }
  }
}

/**
 * Close the reward ad by triggering the close mechanism
 */
  function closeRewardAd() {
    // Click the native close button to trigger proper UI changes and events
    const nativeCloseButton = document.getElementById('pw-close-video-button');
    if (nativeCloseButton) {
      nativeCloseButton.click();
    }
  }

/**
 * Wait for the timer element to appear in the DOM and be populated with timer text
 * @returns {Promise} Promise that resolves when element is found and has timer content
 */
function waitForTimerElement() {
  return new Promise((resolve) => {
    const checkForElement = () => {
      const element = document.getElementById('pw-remaining-timer-top');
      if (element) {
        const text = element.innerHTML || element.textContent || element.innerText || '';
        // Wait for the element to have timer content or be non-empty
        if (text.trim() !== '') {
          resolve(element);
        } else {
          setTimeout(checkForElement, 100);
        }
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

  // Set up page visibility tracking to pause timer when user tabs away
  document.addEventListener('visibilitychange', () => {
    isPageVisible = !document.hidden;
  });

  // Listen for when reward ad is ready
  window.addEventListener("rewardedAdVideoRewardReady", () => {
    rewardAdReady = true;
    console.log("✅ Reward ad is ready");
  });

  // Listen for user accepting to watch ad
  window.addEventListener("userAcceptsRewardedAd", async () => {
    
    // Reset all state for new ad
    buttonActive = false;
    customTextActive = false;
    remainingSeconds = 0;
    timerCaptured = false;
    
    // Clean up any existing intervals or observers from previous ads
    stopCustomCountdown();
    
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    
    if (timerObserver) {
      timerObserver.disconnect();
      timerObserver = null;
    }
    
    // Wait for the timer element to appear and then customize it
    try {
      await waitForTimerElement();
      await blockTimerScript();
      // Note: blockTimerScript will now handle capturing the timer and starting countdown
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
    
    // Immediately stop all timers and observers
    customTextActive = false;
    buttonActive = true; // Set this early to prevent any more text overrides
    
    // Stop custom countdown
    stopCustomCountdown();
    
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    
    // Disconnect observer to prevent it from interfering
    if (timerObserver) {
      timerObserver.disconnect();
    }
    
    // For very short ads, we need immediate protection
    // Start protection first, then set the text
    const setupContinueText = () => {
      if (timerElement) {
        setContinueText(rewardGrantedText);
      } else {
        // If timer element isn't ready yet, wait a bit more
        setTimeout(setupContinueText, 50);
      }
    };
    
    // Try immediately for short ads, but also retry if needed
    setupContinueText();
    
    // Also set up with a longer delay as backup
    setTimeout(() => {
      if (timerElement && !timerElement.innerHTML.includes(rewardGrantedText)) {
        setContinueText(rewardGrantedText);
      }
    }, 200);
  });

  // Listen for early close
  window.addEventListener("rewardedCloseButtonTriggered", () => {
    cleanupTimerCustomization();
  });

  // Listen for close after qualifying for reward
  window.addEventListener("userClosedWithRewardCanResolve", () => {
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

    // Use skipConfirmation: true for clean integration
    window.ramp.manuallyCreateRewardUi({ skipConfirmation: true })
      .then(() => {
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
 * Removes observers and stops polling and countdown
 */
function cleanupTimerCustomization() {
  // Stop polling
  customTextActive = false;
  buttonActive = false;
  
  // Stop custom countdown and all protection
  stopCustomCountdown();
  stopContinueProtection();
  stopContinueMutationObserver();
  
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
  
  // Disconnect observer
  if (timerObserver) {
    timerObserver.disconnect();
    timerObserver = null;
  }
  
  // Reset timer state
  remainingSeconds = 0;
  timerCaptured = false;
  
  // Clear element references
  timerElement = null;
  backgroundElement = null;
  animationElement = null;
  checkmarkElement = null;
}

