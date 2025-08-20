/**
 * Rewarded Video Ad Module for Ramp
 * Simple implementation using skipConfirmation: true approach
 */

import { browser } from '$app/environment';

class RewardedAdManager {
  constructor() {
    this.isReady = false;
    this.eventListeners = new Map();
    
    if (browser) {
      this.setupEventListeners();
    }
  }

  /**
   * Setup event listeners for rewarded ad lifecycle
   */
  setupEventListeners() {
    // Ad is ready to be shown
    window.addEventListener('rewardedAdVideoRewardReady', () => {
      console.log('🎥 Rewarded ad is ready to play!');
      this.isReady = true;
      this.emit('adReady');
    });

    // User started watching ad
    window.addEventListener('userAcceptsRewardedAd', () => {
      console.log('🎬 User started watching rewarded ad');
      this.emit('adStarted');
    });

    // Ad was watched in full
    window.addEventListener('rewardedAdCompleted', () => {
      console.log('✅ Rewarded ad completed');
      this.emit('adCompleted');
    });

    // User earned reward
    window.addEventListener('rewardedAdRewardGranted', () => {
      console.log('🎁 Reward granted to user');
      this.emit('rewardGranted');
    });

    // User closed ad early
    window.addEventListener('rewardedCloseButtonTriggered', () => {
      console.log('❌ User closed ad early');
      this.emit('adClosed');
    });

    // User closed ad but can still get reward
    window.addEventListener('userClosedWithRewardCanResolve', () => {
      console.log('🎁 User closed ad but reward can still be granted');
      this.emit('rewardCanResolve');
    });
  }

  /**
   * Check if a rewarded ad is ready to be shown
   * @returns {boolean}
   */
  isAdReady() {
    return this.isReady;
  }

  /**
   * Show rewarded video ad using skipConfirmation: true approach
   * @returns {Promise} Resolves when reward is granted, rejects on error
   */
  async showRewardedAd() {
    if (!browser) {
      throw new Error('Rewarded ads can only be shown in browser environment');
    }

    if (!window.ramp || !window.ramp.manuallyCreateRewardUi) {
      throw new Error('Ramp is not loaded or rewarded ad API not available');
    }

    if (!this.isReady) {
      throw new Error('No rewarded ad is ready to show');
    }

    try {
      console.log('🎬 Showing rewarded ad...');
      
      // Use the recommended approach with skipConfirmation: true
      const result = await window.ramp.manuallyCreateRewardUi({ 
        skipConfirmation: true 
      });
      
      console.log('✅ Reward granted');
      this.isReady = false; // Ad consumed, need to wait for next one
      return result;
      
    } catch (error) {
      console.error('❌ Rewarded video error:', error);
      this.isReady = false; // Reset state on error
      throw error;
    }
  }

  /**
   * Add event listener for rewarded ad events
   * @param {string} event - Event name (adReady, adStarted, adCompleted, rewardGranted, adClosed, rewardCanResolve)
   * @param {function} callback - Callback function
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {function} callback - Callback function to remove
   */
  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to registered listeners
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in rewarded ad event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Initialize rewarded ads (call this after Ramp is loaded)
   * This should be called from your Ramp component after the script loads
   */
  initialize() {
    if (!browser || !window.ramp) {
      console.warn('Cannot initialize rewarded ads: browser environment or Ramp not available');
      return;
    }

    // Add any initialization logic here if needed
    console.log('🎯 Rewarded ad manager initialized');
  }
}

// Create singleton instance
export const rewardedAdManager = new RewardedAdManager();

// Export convenience functions
export const showRewardedAd = () => rewardedAdManager.showRewardedAd();
export const isRewardedAdReady = () => rewardedAdManager.isAdReady();
export const onRewardedAdEvent = (event, callback) => rewardedAdManager.on(event, callback);
export const offRewardedAdEvent = (event, callback) => rewardedAdManager.off(event, callback);

export default rewardedAdManager;
