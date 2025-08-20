// Rewarded Video helper following Playwire docs (manual UI, skipConfirmation)

let rampLoaded = false;
let rewardedReady = false;
let listenersAttached = false;
const LOG_PREFIX = "[RAMP-Rewarded]";

export function setRampLoaded(value) {
  rampLoaded = Boolean(value);
  try {
    console.log(`${LOG_PREFIX} setRampLoaded:`, rampLoaded);
  } catch (_) {}
}

export function isRewardedAdReady() {
  return rewardedReady;
}

// Attach only the documented ready event; other events are optional logging
export function initRewardedVideo() {
  if (listenersAttached || typeof window === "undefined") return;
  listenersAttached = true;

  const target = window;

  target.addEventListener("rewardedAdVideoRewardReady", () => {
    rewardedReady = true;
    try {
      console.log("🎥 Ad is ready to play! (rewardedAdVideoRewardReady)");
    } catch (_) {}
  });
}

// Optional: verbose logging for the full lifecycle
export function enableRewardedEventLogging() {
  if (typeof window === "undefined") return;
  const target = window;
  const log = (evt) => () => {
    try {
      console.log(`${LOG_PREFIX} Event: ${evt}`);
    } catch (_) {}
  };
  [
    "userAcceptsRewardedAd",
    "rewardedAdCompleted",
    "rewardedAdRewardGranted",
    "rewardedCloseButtonTriggered",
    "userClosedWithRewardCanResolve",
    "rejectAdCloseCta",
    "rewardedAdConfirmClose",
  ].forEach((evt) => target.addEventListener(evt, log(evt)));
}

// Show the rewarded video with manual UI per docs
export async function showRewardedAd() {
  if (typeof window === "undefined") throw new Error("Not in browser");
  if (!rampLoaded || !window.ramp) throw new Error("Ramp not loaded");
  if (!rewardedReady) throw new Error("No rewarded ad available");

  // Prefer the documented method name with a safe fallback
  const callManualUi =
    (window.ramp.manuallyCreateRewardUi && (() => window.ramp.manuallyCreateRewardUi({ skipConfirmation: true }))) ||
    (window.ramp.manuallyCreatedRewardUi && (() => window.ramp.manuallyCreatedRewardUi({ skipConfirmation: true })));

  if (!callManualUi) throw new Error("Reward UI method not available on ramp");

  try {
    console.log(`${LOG_PREFIX} showRewardedAd: launching manual UI`);
  } catch (_) {}

  await callManualUi();

  // Reset and expect a new ready event to fire when next ad is prefetched
  rewardedReady = false;
  try {
    console.log(`${LOG_PREFIX} showRewardedAd: completed, awaiting next ready event`);
  } catch (_) {}
  return true;
}


