<script>
  // Import statements remain the same
  import { browser } from "$app/environment";
  import moment from "moment";
  import "moment-timezone";

  // Import components
  import Help from "./Help.svelte";
  import Gameover from "./Gameover.svelte";
  import Ramp from "./Ramp.svelte";
  import { showRewardedAd, isRewardedAdReady } from "$lib/rewardedAd.js";
  import Stats from "./Stats.svelte";
  import SplashScreen from "./components/SplashScreen.svelte";
  import GameBoard from "./components/GameBoard.svelte";
  import CreateGame from "./components/CreateGame.svelte";
  import Navbar from "./components/Navbar.svelte";
  import SlideMenu from "./components/SlideMenu.svelte";
  import JamMode from "./components/JamMode.svelte";

  // Import game state and utilities
  import {
    visited,
    currentGameDate,
    guesses,
    muted,
    gameOver,
    played,
    currentStreak,
    maxStreak,
    solveList,
    bestGuessImages,
    completedDates,
  } from "../store.js";

  // Data imports
  import artistList from "$lib/artists.json";
  import mysteryArtistList from "$lib/mysteryArtists.json";
  import eligibleArtistsData from "$lib/eligibleArtists.json";
  import deepCutsData from "$lib/deepcuts.json";

  // Constants
  const PUB_ID = 1025391;
  const WEBSITE_ID = 75339;

  // Initialize timezone
  moment.tz.setDefault("America/New_York");
  const todaysDate = moment().tz("America/New_York").format("MM/DD/YYYY");
  const todaysMoment = moment.tz(todaysDate, "MM/DD/YYYY", "America/New_York");
  const previousDay = moment()
    .tz("America/New_York")
    .subtract(1, "days")
    .format("MM/DD/YYYY");

  // Game state
  let playingGame = false;
  let normalGame = false;
  let createGame = false;
  let splashScreen = true;
  let showHelp = false;
  let guessCount = 0;
  let tempGameOver = false;
  let showResults = false;
  let result = "";
  let createGameSelection = null;
  let playingChallenge = false;
  let playingRewind = false;
  let tempGuesses = [];
  let mysteryArtistEntry;
  let mysteryArtist;
  let spotleNumber = "-1";
  let challengeNote = "";
  let showSlideMenu = false;
  let showStats = false;
  let showRewardAdModal = false;
  let adLoading = false;
  let adError = "";

  let playingJam = false;
  let jamIndex = 0;
  let solvedJamArtists = [];
  let jamTimeRemaining = 180; // 3 minutes
  let skippedArtists = [];
  let seenJamArtists = [];

  // Process artists data
  const artists = artistList.map((artist) => ({
    name: artist.artist,
    listener_rank: artist.index,
    image_uri: artist.image_uri,
    genre: artist.genre,
    debut_album_year: artist.debut_album_year,
    country: artist.country.toLowerCase(),
    group_size: artist.group_size,
    song_uri: artist.song_uri,
    song_image_uri: artist.song_image_uri,
    embedded_track: artist.embedded_track,
    gender: getGenderLabel(artist.gender),
  }));

  // Find yesterday's artist
  const yesterdaysArtistEntry = mysteryArtistList.find(
    (entry) => entry.date === previousDay
  );
  const yesterdaysArtist = artists.find(
    (artist) => artist.name === yesterdaysArtistEntry?.artist
  );

  // Check for challenge mode
  if (browser) {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedArtist = urlParams.get("artist");
    const encodedNote = urlParams.get("note");

    if (encodedArtist) {
      splashScreen = false;
      playingGame = true;
      playingJam = false;
      playingChallenge = true;
      playingRewind = false;

      // Decode the Base64 string to Uint8Array
      const artistUint8Array = Uint8Array.from(atob(encodedArtist), (c) =>
        c.charCodeAt(0)
      );
      const noteUint8Array = Uint8Array.from(atob(encodedNote), (c) =>
        c.charCodeAt(0)
      );

      // Convert the Uint8Array to string (UTF-8 representation)
      const decodedArtist = new TextDecoder().decode(artistUint8Array);
      const decodedNote = new TextDecoder().decode(noteUint8Array);

      const selectedArtist = artists.find(
        (artist) => artist.name === decodedArtist
      );

      if (selectedArtist === undefined) {
        window.location.href = window.location.href.split("?")[0];
        playingChallenge = false;
        splashScreen = true;
        playingGame = false;
      }

      mysteryArtist = selectedArtist;
      challengeNote = decodedNote;

      mysteryArtistEntry = {
        image_uri: mysteryArtist.image_uri,
        song_uri: mysteryArtist.song_uri,
        artist: mysteryArtist.name,
      };
    }
  }

  // Setup for Rewind mode
  let rewindIndex = 0;
  const lastSixDaysArtists = [];
  const lastSixDaysDates = [];

  // Get data for the past 7 days instead of 6
  for (let i = 1; i <= 6; i++) {
    const previousDay = moment()
      .tz("America/New_York")
      .subtract(i, "days")
      .format("MM/DD/YYYY");

    const dayArtistEntry = mysteryArtistList.find(
      (entry) => entry.date === previousDay
    );

    if (dayArtistEntry) {
      const dayArtist = artists.find(
        (artist) => artist.name === dayArtistEntry.artist
      );
      if (dayArtist) {
        lastSixDaysArtists.push(dayArtist);
        lastSixDaysDates.push(previousDay);
      }
    }
  }

  // Make sure the dates are sorted from newest to oldest
  lastSixDaysArtists.reverse();
  lastSixDaysDates.reverse();

  const eligibleArtists = eligibleArtistsData.artists;
  const deepCutsArtists = deepCutsData.artists;
  let currentArtistsList = eligibleArtists;

  // Error reporting function
  async function sendError(message) {
    if (browser) {
      const response = await fetch("/api/report-error", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: message }),
      });
    }
  }

  // Helper functions
  function getGenderLabel(code) {
    switch (code) {
      case "m":
        return "Male";
      case "f":
        return "Female";
      case "x":
        return "Mixed";
      case "nb":
        return "Nonbinary";
      default:
        return "Unknown";
    }
  }

  function handleStatsClick() {
    // Update this function to show the stats overlay
    showStats = true;

    if (browser && typeof gtag === "function") {
      gtag("event", "view_stats", {});
    }
  }

  function handleRewindSelect(event) {
    // Get the selected index
    const selectedIndex = event.detail.index;

    // Set the rewindIndex to the selected date's index
    rewindIndex = selectedIndex;

    // Get the corresponding artist and update the display
    mysteryArtist = lastSixDaysArtists[rewindIndex];
    mysteryArtistEntry = {
      image_uri: mysteryArtist.image_uri,
      song_uri: mysteryArtist.song_uri,
      artist: mysteryArtist.name,
    };

    // Reset game state
    tempGuesses = [];
    tempGameOver = false;
    guessCount = 0;

    if (browser && typeof gtag === "function") {
      gtag("event", "rewind_select_date", {
        date: lastSixDaysDates[rewindIndex],
      });
    }
  }

  function handleStats(guessCount, win) {
    $played = $played + 1;
    if (!win) {
      // loss
      $solveList.push(0);
      $solveList = $solveList;
      $currentStreak = 0;
    } else {
      // win
      $currentStreak = $currentStreak + 1;
      $solveList.push(guessCount + 1);
      $solveList = $solveList;
      if ($currentStreak > $maxStreak) {
        $maxStreak = $currentStreak;
      }

      if ($solveList.length <= 3) {
        $bestGuessImages.push(mysteryArtist.image_uri);
        $bestGuessImages = $bestGuessImages;
      } else {
        const topPerformances = [...$solveList]
          .filter((result) => result > 0) // Exclude losses (0)
          .sort((a, b) => b - a) // Sort descending
          .slice(0, 3); // Take top 3

        if (guessCount + 1 <= topPerformances[2]) {
          $bestGuessImages.push(mysteryArtist.image_uri);
          $bestGuessImages.shift();
          $bestGuessImages = $bestGuessImages;
        }
      }
    }
  }

  // Game mode functions
  function playGame() {
    normalGame = true;
    playingRewind = false;
    playingGame = true;
    splashScreen = false;
    playingJam = false;
    playingChallenge = false;

    if (normalGame) {
      mysteryArtistEntry = mysteryArtistList.find(
        (entry) => entry.date === todaysDate
      );

      if (mysteryArtistEntry === undefined || mysteryArtistEntry === null) {
        console.log("Critical error.");
        sendError(
          "The artist for todays date is not defined or there is a syntax error with the artist."
        );
      }

      mysteryArtist = artists.find(
        (artist) => artist.name === mysteryArtistEntry.artist
      );

      if (mysteryArtist === undefined || mysteryArtistEntry === null) {
        console.log("Critical error.");
        sendError(
          "The artist for todays date IS set, but no matching artist in artists.json was found."
        );
      }

      mysteryArtistList.forEach((entry, index) => {
        if (entry.date === todaysDate) {
          spotleNumber = index;
          return;
        }
      });

      if ($currentGameDate == todaysDate) {
        guessCount = $guesses.length;
        guessCount--;
        if (guessCount >= 10) {
          result = "L";
          showResults = true;
          $gameOver = true;
        }
        if (
          $guesses.some(
            (obj) => obj.name === mysteryArtist.name && guessCount <= 9
          )
        ) {
          result = "W";
          showResults = true;
          $gameOver = true;
        }
      } else {
        $guesses = [];
        $visited = true;
        $gameOver = false;
        $currentGameDate = todaysDate;
        guessCount = 0;
      }
    }
  }

  function handleCreate() {
    resetAllModes();
    createGame = true;
    playingGame = true;
  }

  function playRewind() {
    resetAllModes();
    playingGame = true;
    playingRewind = true;

    if (browser && typeof gtag === "function") {
      gtag("event", "rewind", {});
    }

    mysteryArtist = lastSixDaysArtists[rewindIndex];
    mysteryArtistEntry = {
      image_uri: mysteryArtist.image_uri,
      song_uri: mysteryArtist.song_uri,
      artist: mysteryArtist.name,
    };
    tempGuesses = [];
    guessCount = 0;
  }

  function shuffleEligibleArtists() {
    // Filter out artists that are already seen
    let availableArtists = currentArtistsList.filter((artistName) => {
      // Don't include artists we've already seen this session
      return !seenJamArtists.includes(artistName);
    });

    // If we've seen all artists, reset the seen list but keep the current solved ones
    if (availableArtists.length === 0) {
      seenJamArtists = [...solvedJamArtists.map((artist) => artist.name)];
      availableArtists = currentArtistsList.filter(
        (artistName) => !seenJamArtists.includes(artistName)
      );
    }

    // Use the filtered list for shuffling
    for (let i = availableArtists.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableArtists[i], availableArtists[j]] = [
        availableArtists[j],
        availableArtists[i],
      ];
    }

    // Replace the current available artists with our shuffled and filtered list
    availableArtists = [...availableArtists];
    return availableArtists;
  }

  function setJamArtist() {
    // Get a shuffled, filtered list of eligible artists
    const availableArtists = shuffleEligibleArtists();

    // Get the next artist (if available)
    if (availableArtists.length > 0) {
      const selectedArtistName = availableArtists[0];
      const selectedArtist = artists.find(
        (artist) => artist.name === selectedArtistName
      );

      // Add this artist to the seen list
      if (!seenJamArtists.includes(selectedArtistName)) {
        seenJamArtists.push(selectedArtistName);
      }

      mysteryArtist = selectedArtist;
      mysteryArtistEntry = {
        image_uri: mysteryArtist.image_uri,
        song_uri: mysteryArtist.song_uri,
        artist: mysteryArtist.name,
      };
      tempGuesses = [];
    }
  }

  function handleJamModeStart(event) {
    const useDeepCuts = event.detail.useDeepCuts;

    // Set the appropriate artist list based on the toggle
    currentArtistsList = useDeepCuts ? deepCutsArtists : eligibleArtists;
    seenJamArtists = [];

    // Shuffle the list and set the first artist
    shuffleEligibleArtists();
    setJamArtist();

    if (browser && typeof gtag === "function") {
      gtag("event", "jam_mode_selected", {
        mode: useDeepCuts ? "deep_cuts" : "standard",
      });
    }
  }

  function handleSkipArtist() {
    if (playingJam) {
      // Store the current artist being skipped before moving to the next one
      if (mysteryArtist) {
        skippedArtists.push(mysteryArtist);

        if (!seenJamArtists.includes(mysteryArtist.name)) {
          seenJamArtists.push(mysteryArtist.name);
        }
      }

      // Move to the next artist without incrementing the solved count
      jamIndex = jamIndex; // Keep the jam index the same since we didn't solve it

      // Reset game state
      tempGuesses = [];
      guessCount = 0;

      // Shuffle eligible artists and set a new artist
      shuffleEligibleArtists();
      setJamArtist();

      // Analytics tracking
      if (browser && typeof gtag === "function") {
        gtag("event", "jam_skip_artist", {
          artist: mysteryArtist?.name || "unknown",
          jam_index: jamIndex,
          skipped_count: skippedArtists.length,
        });
      }
    }
  }

  function restartJam(event) {
    // Get the mode from the event
    const useDeepCuts = event?.detail?.useDeepCuts;

    // Set the appropriate artist list
    currentArtistsList = useDeepCuts ? deepCutsArtists : eligibleArtists;

    // Reset game state
    jamIndex = 0;
    solvedJamArtists = [];
    tempGuesses = [];
    guessCount = 0;
    skippedArtists = [];
    jamTimeRemaining = 180;
    tempGameOver = false;
    seenJamArtists = [];

    // Shuffle eligible artists and set first artist
    shuffleEligibleArtists();
    setJamArtist();

    // Force an update cycle
    playingJam = false;
    // Force an update cycle
    setTimeout(() => {
      playingJam = true;

      if (browser && typeof gtag === "function") {
        gtag("event", "jam_mode_restart", {
          mode: useDeepCuts ? "deep_cuts" : "standard",
        });
      }
    }, 50);
  }

  function playJam() {
    resetAllModes();
    playingGame = true;
    playingJam = true;

    // Set tempGameOver to false before enabling playingJam
    tempGameOver = false;

    playingJam = true; // Enable JAM mode

    if (browser && typeof gtag === "function") {
      gtag("event", "jam_mode_start", {});
    }

    // Reset JAM mode state
    jamIndex = 0;
    solvedJamArtists = [];
    jamTimeRemaining = 180; // 3 minutes
    tempGuesses = [];
    guessCount = 0;
    currentArtistsList = eligibleArtists;

    // Shuffle eligible artists for JAM mode
    shuffleEligibleArtists();

    // Set the first artist
    setJamArtist();
  }

  // Event handlers
  function handleSearch(artistName) {
    const selectedArtist = artists.find((artist) => artist.name === artistName);

    if (!selectedArtist) return;

    if (normalGame) {
      const guessNames = $guesses.map((artist) => artist.name);

      if (guessNames.includes(artistName)) {
        return;
      }

      $guesses.push(selectedArtist);
      $guesses = $guesses;

      if (selectedArtist == mysteryArtist) {
        setTimeout(() => {
          $gameOver = true;
          showResults = true;
          result = "W";

          // Mark today's date as completed
          if (!$completedDates.includes(todaysDate)) {
            $completedDates = [...$completedDates, todaysDate];
          }

          return;
        }, 1750);

        if (browser && typeof gtag === "function") {
          gtag("event", "gameover", {
            result: "win",
            guesses: Number(guessCount),
            artist: mysteryArtist.name,
          });

          handleStats(guessCount, true);
          guessCount = guessCount - 1;
        }
      }

      if (guessCount + 1 == 10) {
        if (browser && typeof gtag === "function") {
          gtag("event", "gameover", {
            result: "loss",
            guesses: Number(guessCount),
            artist: mysteryArtist.name,
          });

          handleStats(guessCount, false);
        }

        setTimeout(() => {
          $gameOver = true;
          showResults = true;
          $guesses.push(mysteryArtist);
          $guesses = $guesses;
          result = "L";

          // Mark today's date as completed
          if (!$completedDates.includes(todaysDate)) {
            $completedDates = [...$completedDates, todaysDate];
          }

          return;
        }, 1750);
      }

      guessCount++;
      return;
    }

    if (createGame) {
      createGameSelection = selectedArtist;
    }

    if (playingJam) {
      if (tempGameOver) {
        return;
      }

      // Check if this is a duplicate guess (unchanged)
      if (tempGuesses.includes(selectedArtist)) {
        return;
      }

      // Add the guess to the list
      tempGuesses.push(selectedArtist);
      tempGuesses = tempGuesses;

      // Only increment guess count if it's not a free guess from the previously solved artist
      // The JamMode component will handle adjusting the display logic
      if (
        solvedJamArtists.length === 0 ||
        selectedArtist.name !==
          solvedJamArtists[solvedJamArtists.length - 1].name
      ) {
        guessCount++;
      }

      if (selectedArtist == mysteryArtist) {
        setTimeout(() => {
          // Store the current solved artist
          const lastSolvedArtist = mysteryArtist;

          // Add the solved artist to the list
          solvedJamArtists.push(lastSolvedArtist);
          solvedJamArtists = solvedJamArtists;

          if (!seenJamArtists.includes(mysteryArtist.name)) {
            seenJamArtists.push(mysteryArtist.name);
          }

          // Increment the JAM index
          jamIndex++;

          // Move to the next artist
          setJamArtist();

          // Reset guesses and guess count for next artist
          tempGuesses = [];
          guessCount = 0;

          setTimeout(() => {
            tempGuesses = [lastSolvedArtist]; // Add the previous artist as the first guess
            tempGuesses = tempGuesses; // Trigger reactivity
          }, 100);

          // The free guess will be handled by the JamMode component on initial render of the new artist
        }, 1750);
      }

      // Check for max guesses (unchanged)
      if (guessCount >= 10) {
        setTimeout(() => {
          // Apply time penalty (-15 seconds) similar to skip
          jamTimeRemaining = Math.max(1, jamTimeRemaining - 15);

          // Tell JamMode to show the time penalty animation
          dispatch("timepenalty");

          // Move to the next artist without incrementing the solved count
          jamIndex = jamIndex; // Keep the jam index the same since we didn't solve it
          // Reset game state
          tempGuesses = [];
          guessCount = 0;

          // Move to next artist by refreshing the list and setting a new artist
          shuffleEligibleArtists();
          setJamArtist();
        }, 1750);
      }

      return;
    }

    if (playingChallenge || playingRewind) {
      if (tempGameOver) {
        return;
      }

      if (tempGuesses.includes(selectedArtist)) {
        return;
      }

      tempGuesses.push(selectedArtist);
      tempGuesses = tempGuesses;
      guessCount++;

      if (playingChallenge || playingRewind) {
        if (selectedArtist == mysteryArtist) {
          setTimeout(() => {
            tempGameOver = true;
            showResults = true;
            result = "W";

            if (
              playingRewind &&
              lastSixDaysDates &&
              lastSixDaysDates[rewindIndex]
            ) {
              const completedDate = lastSixDaysDates[rewindIndex];
              if (!$completedDates.includes(completedDate)) {
                $completedDates = [...$completedDates, completedDate];
              }
            }

            return;
          }, 1750);
        }

        if (guessCount + 1 == 10) {
          setTimeout(() => {
            tempGameOver = true;
            showResults = true;
            tempGuesses.push(mysteryArtist);
            tempGuesses = tempGuesses;
            result = "L";
            return;
          }, 1750);
        }
      }
    }
  }

  function nextRewind() {
    if (rewindIndex == 5) return;

    rewindIndex++;
    mysteryArtist = lastSixDaysArtists[rewindIndex];
    mysteryArtistEntry = {
      image_uri: mysteryArtist.image_uri,
      song_uri: mysteryArtist.song_uri,
      artist: mysteryArtist.name,
    };
    tempGuesses = [];
    tempGameOver = false;
    guessCount = 0;
  }

  function previousRewind() {
    if (rewindIndex == 0) return;

    rewindIndex--;
    mysteryArtist = lastSixDaysArtists[rewindIndex];
    mysteryArtistEntry = {
      image_uri: mysteryArtist.image_uri,
      song_uri: mysteryArtist.song_uri,
      artist: mysteryArtist.name,
    };
    tempGuesses = [];
    tempGameOver = false;
    guessCount = 0;
  }

  // Updated to toggle slide menu instead of navigating to splash screen
  function handleMenuClick() {
    showSlideMenu = true;
  }

  function handleCloseSlideMenu() {
    showSlideMenu = false;
  }

  function resetAllModes() {
    // Reset all mode flags
    normalGame = false;
    createGame = false;
    playingRewind = false;
    playingJam = false;
    playingChallenge = false;
    playingGame = false;
    splashScreen = false;

    // Reset game state
    tempGameOver = false;
    showResults = false;

    // Reset any other relevant state
    guessCount = 0;
    tempGuesses = [];
  }

  function updateRewindDateUI() {
    // Create a temporary variable to hold the current value
    const currentDates = [...$completedDates];

    // Reset the store with the same value to trigger reactivity
    // This will force components that depend on completedDates to re-render
    $completedDates = [];

    // Use setTimeout to ensure the UI has time to process the change
    setTimeout(() => {
      $completedDates = currentDates;
    }, 10);
  }

  function handleSlideMenuNavigation(event) {
    const destination = event.detail.destination;
    showSlideMenu = false;

    if (destination === "home") {
      playingGame = false;
      normalGame = false;
      playingJam = false;
      createGame = false;
      playingRewind = false;
      splashScreen = true;
    } else if (destination === "rewind") {
      // Show reward ad modal before starting rewind
      showRewardAdModal = true;
      adError = "";
      try {
        console.log(
          "[RAMP-UI] Rewind selected -> opening ad modal. ready=",
          isRewardedAdReady()
        );
      } catch (_) {}
    } else if (destination === "create") {
      handleCreate();
    } else if (destination === "jam") {
      playJam();
    }
  }

  // Handle watching the reward ad
  async function handleWatchAd() {
    try {
      console.log("[RAMP-UI] Watch Ad clicked. ready=", isRewardedAdReady());
    } catch (_) {}
    if (!isRewardedAdReady()) {
      adError = "No ad available right now. Please try again later.";
      return;
    }

    adLoading = true;
    adError = "";

    try {
      await showRewardedAd();
      // Ad watched successfully - start rewind mode
      showRewardAdModal = false;
      adLoading = false;
      playRewind();
      try {
        console.log("[RAMP-UI] watchRewardedAd success -> starting rewind");
      } catch (_) {}
    } catch (error) {
      adLoading = false;
      adError = "Failed to load ad. You can try again or skip for now.";
      console.error("[RAMP-UI] Reward ad error:", error);
    }
  }

  // Handle skipping the ad (fallback)
  function handleSkipAd() {
    showRewardAdModal = false;
    adError = "";
    // For now, still allow access to rewind even if ad is skipped
    playRewind();
    try {
      console.log("[RAMP-UI] Skip Ad -> starting rewind without ad");
    } catch (_) {}
  }

  // Handle closing the ad modal
  function handleCloseAdModal() {
    showRewardAdModal = false;
    adError = "";
    adLoading = false;
    try {
      console.log("[RAMP-UI] Close Ad Modal");
    } catch (_) {}
  }

  function handleOverlayClose() {
    showResults = false;
  }

  function toggleHelp() {
    showHelp = !showHelp;
  }

  function handleCreateArtistSelect(event) {
    createGameSelection = artists.find(
      (artist) => artist.name === event.detail
    );
  }
</script>

<main>
  <!-- The backdrop div should be the first child in main -->
  <div class="backdrop"></div>
  <Ramp {PUB_ID} {WEBSITE_ID} />
  <Navbar
    {playingJam}
    {playingRewind}
    on:menu={handleMenuClick}
    on:help={toggleHelp}
    on:stats={handleStatsClick}
  />

  <!-- Slide Menu overlay -->
  {#if showSlideMenu}
    <SlideMenu
      on:close={handleCloseSlideMenu}
      on:navigate={handleSlideMenuNavigation}
    />
  {/if}

  {#if showStats}
    <Stats on:close={() => (showStats = false)} />
  {/if}

  <!-- Reward Ad Modal -->
  {#if showRewardAdModal}
    <div
      class="reward-ad-overlay"
      on:click={handleCloseAdModal}
      on:keydown={(e) => e.key === "Escape" && handleCloseAdModal()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabindex="-1"
    >
      <div class="reward-ad-modal" on:click|stopPropagation role="document">
        <button
          class="modal-close"
          on:click={handleCloseAdModal}
          aria-label="Close modal"
        >
          <svg
            width="20"
            height="18"
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19.2099 1.7625L17.3417 0L9.93491 6.9875L2.52816 0L0.659912 1.7625L8.06666 8.75L0.659912 15.7375L2.52816 17.5L9.93491 10.5125L17.3417 17.5L19.2099 15.7375L11.8032 8.75L19.2099 1.7625Z"
              fill="white"
            />
          </svg>
        </button>

        <div class="modal-content">
          <h2 id="modal-title">Unlock Rewind Mode</h2>
          <p>Watch a short ad to access the last week of Spotle games!</p>

          {#if adError}
            <div class="error-message">{adError}</div>
          {/if}

          <div class="modal-buttons">
            <button
              class="watch-ad-btn"
              on:click={handleWatchAd}
              disabled={adLoading || !isRewardedAdReady()}
            >
              {#if adLoading}
                <div class="loading-spinner"></div>
                Loading Ad...
              {:else if !isRewardedAdReady()}
                No Ad Available
              {:else}
                🎥 Watch Ad
              {/if}
            </button>

            <button class="skip-btn" on:click={handleSkipAd}>
              Skip for Now
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Game over overlay -->
  {#if showResults && !createGame}
    <Gameover
      {spotleNumber}
      {result}
      artist={mysteryArtistEntry}
      {guessCount}
      {playingChallenge}
      {playingRewind}
      on:close={handleOverlayClose}
      muted={$muted}
    ></Gameover>
  {/if}

  <!-- Help overlay -->
  {#if showHelp}
    <div class="help">
      <Help on:close={toggleHelp}></Help>
    </div>
  {/if}

  <div class="outer-container">
    <div class="container">
      <!-- Main content -->
      {#if splashScreen}
        <SplashScreen
          {yesterdaysArtist}
          on:play={(e) => {
            if (e.detail.mode === "normal") playGame();
            else if (e.detail.mode === "create") handleCreate();
            else if (e.detail.mode === "rewind") playRewind();
            else if (e.detail.mode === "jam") playJam();
          }}
          on:showHelp={toggleHelp}
        />
      {:else if playingGame}
        {#if playingJam}
          <JamMode
            currentArtist={mysteryArtist}
            gameGuesses={tempGuesses}
            {jamIndex}
            timeRemaining={jamTimeRemaining}
            solvedArtists={solvedJamArtists}
            {skippedArtists}
            isGameOver={tempGameOver}
            on:guess={(e) => handleSearch(e.detail.artistName)}
            on:restart={restartJam}
            on:startWithMode={handleJamModeStart}
            on:skipArtist={handleSkipArtist}
          />
        {:else if createGame}
          <CreateGame
            selectedArtist={createGameSelection}
            on:selectArtist={handleCreateArtistSelect}
          />
        {:else if playingRewind}
          <GameBoard
            mode="rewind"
            currentArtist={mysteryArtist}
            gameGuesses={tempGuesses}
            isGameOver={tempGameOver}
            rewindDates={lastSixDaysDates}
            {rewindIndex}
            {lastSixDaysArtists}
            blurResults={showResults}
            on:guess={(e) => handleSearch(e.detail.artistName)}
            on:rewindSelect={handleRewindSelect}
            on:rewindNext={nextRewind}
            on:rewindPrevious={previousRewind}
          />
        {:else if normalGame}
          <GameBoard
            mode="normal"
            currentArtist={mysteryArtist}
            gameGuesses={$guesses}
            isGameOver={$gameOver}
            blurResults={showResults}
            on:guess={(e) => handleSearch(e.detail.artistName)}
          />
        {:else if playingChallenge}
          <GameBoard
            mode="challenge"
            currentArtist={mysteryArtist}
            gameGuesses={tempGuesses}
            isGameOver={tempGameOver}
            blurResults={showResults}
            {challengeNote}
            on:guess={(e) => handleSearch(e.detail.artistName)}
          />
        {/if}
      {/if}
    </div>
  </div>
</main>

<style>
  .outer-container {
    position: relative;
    justify-content: center;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .container {
    position: relative;
    justify-content: center;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .help {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9998;
  }

  /* Override container positioning */
  :global(.outer-container) {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    height: auto !important;
    min-height: 100vh !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: flex-start !important;
  }

  :global(.container) {
    position: relative !important;
    top: 0 !important;
    width: 100% !important;
    max-width: 340px !important;
    margin: 0 auto !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: flex-start !important;
  }

  /* Fix game components alignment */
  :global(.game-container),
  :global(.create-game-container) {
    position: relative !important;
    top: 0 !important;
    width: 100% !important;
    max-width: 340px !important;
    margin: 0 auto !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: flex-start !important;
  }

  /* Make splash screen stay at top */
  :global(.splash-screen) {
    position: relative !important;
    top: 0 !important;
    margin-top: 0 !important;
  }

  /* Fix header positioning */
  :global(.header) {
    position: relative !important;
    top: 0 !important;
    margin-top: 25px !important;
    margin-bottom: 20px !important;
  }

  /* Ensure main element is properly positioned */
  main {
    position: relative !important;
    width: 100% !important;
    height: auto !important;
    min-height: 100vh !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: flex-start !important;
  }
  :global(.slide-menu) {
    max-width: 100% !important;
  }

  @media (min-width: 768px) {
    :global(.slide-menu) {
      max-width: 500px !important;
      margin: 0 auto !important;
    }
  }

  /* Reward Ad Modal Styles */
  .reward-ad-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.8);
    z-index: 10000;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
  }

  .reward-ad-modal {
    background: #1e1e1e;
    border-radius: 12px;
    max-width: 400px;
    width: 100%;
    position: relative;
    padding: 30px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  }

  .modal-close {
    position: absolute;
    top: 15px;
    right: 15px;
    cursor: pointer;
    padding: 5px;
    border-radius: 50%;
    transition: background-color 0.2s;
    background: none;
    border: none;
  }

  .modal-close:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .modal-content h2 {
    color: white;
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 12px;
    text-align: center;
  }

  .modal-content p {
    color: #b5b5b5;
    font-size: 16px;
    text-align: center;
    margin-bottom: 24px;
    line-height: 1.4;
  }

  .error-message {
    background: #ff4444;
    color: white;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 20px;
    text-align: center;
    font-size: 14px;
  }

  .modal-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .watch-ad-btn {
    background: #8370de;
    color: white;
    border: none;
    padding: 16px 24px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .watch-ad-btn:hover:not(:disabled) {
    background: #9580ee;
    transform: translateY(-2px);
  }

  .watch-ad-btn:disabled {
    background: #666;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .skip-btn {
    background: transparent;
    color: #b5b5b5;
    border: 1px solid #444;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .skip-btn:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: #666;
    color: white;
  }

  .loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  /* Mobile responsive */
  @media (max-width: 480px) {
    .reward-ad-modal {
      padding: 24px 20px;
      margin: 20px;
    }

    .modal-content h2 {
      font-size: 20px;
    }

    .modal-content p {
      font-size: 14px;
    }
  }
</style>
