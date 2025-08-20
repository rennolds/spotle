// Simple shared helper for Playwire Rewarded Video (manual UI)
// Keeps minimal module state and exposes imperative helpers.

let rampLoaded = false;
let rewardedReady = false;
let eventsInitialized = false;

export function setRampLoaded(value) {
  rampLoaded = Boolean(value);
}

export function isRewardedAdReady() {
  return rewardedReady;
}

export function initRewardedAdEvents() {
  if (eventsInitialized || typeof window === "undefined") return;
  eventsInitialized = true;

  window.addEventListener("rewardedAdVideoRewardReady", () => {
    rewardedReady = true;
    // Prefetch system re-arms automatically after a view; we keep the flag until consumed
  });

  window.addEventListener("rewardedAdCompleted", () => {
    // no-op: downstream apps may listen separately if needed
  });

  window.addEventListener("rewardedAdRewardGranted", () => {
    // reward will be resolved by watchRewardedAd promise
  });

  window.addEventListener("rewardedCloseButtonTriggered", () => {
    // user closed early
  });
}

export async function watchRewardedAd() {
  if (typeof window === "undefined") {
    throw new Error("Not in browser");
  }
  if (!rampLoaded || !window.ramp) {
    throw new Error("Ramp not loaded");
  }
  if (!rewardedReady) {
    throw new Error("No rewarded ad available");
  }

  // Manual UI flow
  await window.ramp.manuallyCreatedRewardUi({ skipConfirmation: true });

  // After a completed view the system will prefetch the next; keep a conservative reset
  rewardedReady = false;
  return true;
}


