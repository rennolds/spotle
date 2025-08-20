// Simple shared helper for Playwire Rewarded Video (manual UI)
// Keeps minimal module state and exposes imperative helpers.

let rampLoaded = false;
let rewardedReady = false;
let eventsInitialized = false;
const LOG_PREFIX = "[RAMP-Rewarded]";

export function setRampLoaded(value) {
  rampLoaded = Boolean(value);
  try {
    // eslint-disable-next-line no-console
    console.log(`${LOG_PREFIX} setRampLoaded:`, rampLoaded);
  } catch (_) {}
}

export function isRewardedAdReady() {
  return rewardedReady;
}

export function initRewardedAdEvents() {
  if (eventsInitialized || typeof window === "undefined") return;
  eventsInitialized = true;

  const targets = [window, typeof document !== "undefined" ? document : null].filter(Boolean);

  try {
    // eslint-disable-next-line no-console
    console.log(`${LOG_PREFIX} initRewardedAdEvents: attaching listeners`);
  } catch (_) {}

  // Some integrations dispatch to document instead of window; listen on both.
  const readyEvents = [
    "rewardedAdVideoRewardReady",
    "rewardedAdReady",
    "rewardedAdAvailable",
  ];
  const infoEvents = [
    "rewardedAdCompleted",
    "rewardedAdRewardGranted",
    "rewardedCloseButtonTriggered",
    "rewardedAdImpressionViewed",
    "rewardedAdStarted",
    "rewardedAdUnavailable",
    "rewardedAdError",
  ];

  for (const t of targets) {
    readyEvents.forEach((evt) =>
      t.addEventListener(evt, () => {
        rewardedReady = true;
        try {
          // eslint-disable-next-line no-console
          console.log(`${LOG_PREFIX} Ready event: ${evt} -> rewardedReady=true`);
        } catch (_) {}
      })
    );
    infoEvents.forEach((evt) =>
      t.addEventListener(evt, () => {
        try {
          // eslint-disable-next-line no-console
          console.log(`${LOG_PREFIX} Info event: ${evt}`);
        } catch (_) {}
      })
    );
  }
}

// Best-effort prefetch helper: calls whichever prefetch method exists in this account's integration.
export function tryPrefetchRewarded() {
  if (typeof window === "undefined" || !window.ramp) return;
  const methods = [
    { name: "ramp.prefetchRewardedVideo", fn: () => window.ramp.prefetchRewardedVideo },
    { name: "ramp.prefetchRewardedAd", fn: () => window.ramp.prefetchRewardedAd },
    { name: "ramp.rewarded.prefetch", fn: () => window.ramp.rewarded && window.ramp.rewarded.prefetch },
    { name: "ramp.rewardedVideo.prefetch", fn: () => window.ramp.rewardedVideo && window.ramp.rewardedVideo.prefetch },
  ];
  try {
    // eslint-disable-next-line no-console
    console.log(`${LOG_PREFIX} tryPrefetchRewarded: attempting prefetch`);
  } catch (_) {}

  let attempted = false;
  for (const m of methods) {
    let callable;
    try {
      callable = m.fn();
    } catch (_) {
      callable = undefined;
    }
    if (typeof callable === "function") {
      attempted = true;
      try {
        // eslint-disable-next-line no-console
        console.log(`${LOG_PREFIX} Prefetch via: ${m.name}`);
      } catch (_) {}
      try {
        callable();
        return;
      } catch (err) {
        try {
          // eslint-disable-next-line no-console
          console.log(`${LOG_PREFIX} Prefetch error from ${m.name}:`, err);
        } catch (_) {}
      }
    }
  }
  if (!attempted) {
    try {
      // eslint-disable-next-line no-console
      console.log(`${LOG_PREFIX} No known prefetch method found on window.ramp`);
    } catch (_) {}
  }
}

export async function watchRewardedAd() {
  if (typeof window === "undefined") {
    try {
      // eslint-disable-next-line no-console
      console.log(`${LOG_PREFIX} watchRewardedAd: not in browser`);
    } catch (_) {}
    throw new Error("Not in browser");
  }
  if (!rampLoaded || !window.ramp) {
    try {
      // eslint-disable-next-line no-console
      console.log(`${LOG_PREFIX} watchRewardedAd: ramp not loaded`, { rampLoaded, hasRamp: Boolean(window.ramp) });
    } catch (_) {}
    throw new Error("Ramp not loaded");
  }
  if (!rewardedReady) {
    try {
      // eslint-disable-next-line no-console
      console.log(`${LOG_PREFIX} watchRewardedAd: rewarded not ready`);
    } catch (_) {}
    throw new Error("No rewarded ad available");
  }

  // Manual UI flow
  try {
    // eslint-disable-next-line no-console
    console.log(`${LOG_PREFIX} watchRewardedAd: launching UI (manuallyCreatedRewardUi)`);
  } catch (_) {}
  await window.ramp.manuallyCreatedRewardUi({ skipConfirmation: true });

  // After a completed view the system will prefetch the next; keep a conservative reset
  rewardedReady = false;
  try {
    // eslint-disable-next-line no-console
    console.log(`${LOG_PREFIX} watchRewardedAd: completed, resetting rewardedReady=false`);
  } catch (_) {}
  return true;
}


