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
let countdownInterval = null; // For our custom countdown timer
let countdownProtectionInterval = null; // For protecting our countdown from interference
let continueProtectionInterval = null; // For protecting our continue text from interference
let remainingSeconds = 0; // Time remaining in seconds
let timerCaptured = false; // Flag to track if we've captured the original timer

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
      console.log(`⏱️ Parsed timer: ${minutes}:${match[2]} = ${totalSeconds} seconds`);
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
    console.log('⏱️ Original timer text:', originalText);
    
    if (originalText.includes('until reward')) {
      remainingSeconds = parseTimerText(originalText);
      if (remainingSeconds > 0) {
        timerCaptured = true;
        console.log(`⏱️ Successfully captured timer: ${remainingSeconds} seconds remaining`);
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
        console.log(`⏱️ Successfully captured timer from format: ${timeMatch[0]} = ${remainingSeconds} seconds`);
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
    console.log(`⏱️ Timer capture attempt ${attempt}/${maxAttempts}`);
    
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
  
  console.log(`⏱️ Starting custom countdown with ${remainingSeconds} seconds`);
  
  // Update display immediately
  updateCountdownDisplay();
  
  // Start interval to update every second
  countdownInterval = setInterval(() => {
    remainingSeconds--;
    
    if (remainingSeconds <= 0) {
      console.log('⏱️ Countdown completed!');
      stopCustomCountdown();
      // Timer completed, show continue text
      setContinueText(rewardGrantedText);
    } else {
      updateCountdownDisplay();
    }
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
  
  console.log('⏱️ Starting countdown protection');
  
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
        console.log('⏱️ Protection: Restoring our countdown display');
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
    console.log('⏱️ Stopped countdown protection');
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
        console.log(`🔘 Protection: Detected text change from "${rewardGrantedText}" to "${currentText}" (correction #${consecutiveCorrections})`);
        console.log(`🔘 Protection: Element properties - innerHTML: "${timerElement.innerHTML}", textContent: "${timerElement.textContent}", innerText: "${timerElement.innerText}"`);
        
        // Force our text back using multiple methods
        timerElement.innerHTML = rewardGrantedText;
        timerElement.textContent = rewardGrantedText;
        timerElement.innerText = rewardGrantedText;
        
        // Also try direct node manipulation as a fallback
        if (timerElement.childNodes.length > 0) {
          timerElement.childNodes[0].nodeValue = rewardGrantedText;
        }
        
        console.log(`🔘 Protection: After restoration - innerHTML: "${timerElement.innerHTML}", textContent: "${timerElement.textContent}"`);
        
        // Reapply styling every few corrections to ensure it's maintained
        if (consecutiveCorrections % 3 === 1 || !lastAppliedStyling) {
          applyContinueTextStyling();
          lastAppliedStyling = true;
          setTimeout(() => { lastAppliedStyling = false; }, 100);
        }
      } else {
        // Reset counter when text is correct
        if (consecutiveCorrections > 0) {
          console.log(`🔘 Protection: Text stabilized after ${consecutiveCorrections} corrections`);
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
    console.log('🔘 Stopped continue text protection');
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
          console.log(`🔘 MutationObserver: Detected change to "${currentText}", restoring "${rewardGrantedText}"`);
          
          // Immediately restore our text
          timerElement.innerHTML = rewardGrantedText;
          timerElement.textContent = rewardGrantedText;
          timerElement.innerText = rewardGrantedText;
          
          // Reapply styling
          applyContinueTextStyling();
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
    console.log('🔘 Stopped continue MutationObserver');
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
  
  console.log(`⏱️ Updating display: ${displayText}`);
  setCustomText(displayText);
}

/**
 * Stop the custom countdown timer
 */
function stopCustomCountdown() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
    console.log('⏱️ Stopped custom countdown');
  }
  
  // Also stop countdown protection
  stopCountdownProtection();
}

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
    
    // If we have an active countdown, don't let anything override it
    if (countdownInterval && timerCaptured) {
      // Only update if it's not our custom format
      const isOurCountdownFormat = currentText.startsWith(currentCustomText) && currentText.includes(':');
      if (!isOurCountdownFormat && currentText !== rewardGrantedText) {
        // Force our countdown display back
        updateCountdownDisplay();
      }
      return;
    }
    
    // If the text has been changed by the timer script, restore our custom text
    // But don't override if we have continue text or if it's our custom countdown format
    const isOurCountdownFormat = currentText.startsWith(currentCustomText) && currentText.includes(':');
    if (currentText !== currentCustomText && 
        currentText !== rewardGrantedText &&
        !isOurCountdownFormat &&
        (currentText.includes(':') || currentText.includes ('Reward Granted') || currentText.includes('until reward') || currentText.trim() === '')) {
      setCustomText(currentCustomText);
    }
  }, 75);
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

  // Try to capture the original timer value with retries
  const timerCaptured = await captureTimerWithRetries();
  
  // If we captured the timer, start our custom countdown
  if (timerCaptured) {
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
              console.log('⏱️ Observer: Original timer trying to override, restoring countdown');
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
            console.log('⏱️ Found timer text via observer, attempting to capture...');
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
 * Set continue text and add click handler to timer element
 * @param {string} continueText - The text to display (default: "Continue")
 */
function setContinueText(continueText = 'Continue') {
  console.log('🔘 setContinueText called with text:', continueText);
  console.log('🔘 timerElement exists:', !!timerElement);
  
  // Set button active flag to stop all other protection systems
  buttonActive = true;
  customTextActive = false;
  
  // STOP ALL OTHER INTERVALS/OBSERVERS to prevent conflicts
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
    console.log('🔘 Stopped polling interval');
  }
  
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
    console.log('🔘 Stopped countdown interval');
  }
  
  if (countdownProtectionInterval) {
    clearInterval(countdownProtectionInterval);
    countdownProtectionInterval = null;
    console.log('🔘 Stopped countdown protection interval');
  }
  
  if (timerObserver) {
    timerObserver.disconnect();
    timerObserver = null;
    console.log('🔘 Disconnected mutation observer');
  }
  
  if (timerElement) {
    
    // Set the continue text
    timerElement.innerHTML = continueText;
    
    // Apply clickable styling to make it look interactive (only once)
    applyContinueTextStyling();
    
    // Remove any existing click listeners to prevent duplicates
    timerElement.removeEventListener('click', handleContinueClick);
    
    // Add click event listener to close the ad
    timerElement.addEventListener('click', handleContinueClick);
    
    // Start aggressive protection to prevent Playwire from overriding our text
    startContinueProtection();
    
    // Also add a dedicated MutationObserver for continue protection
    startContinueMutationObserver();
  }
}

/**
 * Handle continue text click
 */
function handleContinueClick() {
  console.log('🎯 User clicked continue text, closing ad');
  closeRewardAd();
}

/**
 * Apply clickable styling to the continue text
 */
function applyContinueTextStyling() {
  if (timerElement) {
    // Check if styling is already applied to avoid redundant applications
    if (timerElement.style.backgroundColor === 'rgb(203, 255, 112)') {
      console.log('🔘 Styling already applied, skipping');
      return;
    }
    
    console.log('🔘 Applying continue text styling');
    
    const styles = {
      fontFamily: "'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif",
      fontWeight: "600",
      fontSize: "16px",
      color: "#121212",
      backgroundColor: "#CBFF70",
      textAlign: "center",
      lineHeight: "1.2",
      padding: "10px 20px",
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
      margin: "0",
      position: "relative",
      zIndex: "1000"
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
      // Try to dispatch a close event

        console.log('🎯 No close button found, trying alternative methods');
        // Fallback: try to hide the ad overlay
        const adOverlay = document.querySelector('[id*="ramp"]') || 
                         document.querySelector('[class*="ramp"]') ||
                         document.querySelector('[id*="reward"]') ||
                         document.querySelector('[class*="reward"]');
        if (adOverlay) {
          adOverlay.style.display = 'none';
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
          console.log('⏱️ Timer element found with content:', text);
          resolve(element);
        } else {
          console.log('⏱️ Timer element found but empty, waiting...');
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

  // Listen for when reward ad is ready
  window.addEventListener("rewardedAdVideoRewardReady", () => {
    rewardAdReady = true;
    console.log("✅ Reward ad is ready");
  });

  // Listen for user accepting to watch ad
  window.addEventListener("userAcceptsRewardedAd", async () => {
    console.log("🎬 User started watching reward ad");
    
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
    
    console.log("🎬 Reset all state for new ad");
    
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
    console.log("🎁 Reward granted to user");
    console.log("🎁 rewardGrantedText:", rewardGrantedText);
    console.log("🎁 timerElement exists:", !!timerElement);
    
    // Immediately stop all timers and observers
    customTextActive = false;
    buttonActive = true; // Set this early to prevent any more text overrides
    
    // Stop custom countdown
    stopCustomCountdown();
    
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
      console.log("🎁 Stopped polling interval");
    }
    
    // Disconnect observer to prevent it from interfering
    if (timerObserver) {
      timerObserver.disconnect();
    }
    
    // Add a small delay to let any Playwire processes complete first
    setTimeout(() => {
      setContinueText(rewardGrantedText);
    }, 100);
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

