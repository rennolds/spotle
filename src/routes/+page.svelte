<script>
  // Import statements remain the same
  import { browser } from "$app/environment";
  import moment from "moment";
  import "moment-timezone";
  
  // Import components
  import Help from "./Help.svelte";
  import Gameover from "./Gameover.svelte";
  import Countdown from "./Countdown.svelte";
  import Footer from "./Footer.svelte";
  import Ramp from './Ramp.svelte';
  import GameHeader from '../components/GameHeader.svelte';
  import SplashScreen from '../components/SplashScreen.svelte';
  import GameBoard from '../components/GameBoard.svelte';
  import CreateGame from '../components/CreateGame.svelte';
  
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
    bestGuessImages 
  } from "./store.js";
  
  // Data imports
  import artistList from "$lib/artists.json";
  import mysteryArtistList from "$lib/mysteryArtists.json";
  
  // Constants
  const PUB_ID = 1025391;
  const WEBSITE_ID = 75339;

  // Initialize timezone
  moment.tz.setDefault("America/New_York");
  const todaysDate = moment().tz("America/New_York").format("MM/DD/YYYY");
  const todaysMoment = moment.tz(todaysDate, "MM/DD/YYYY", "America/New_York");
  const previousDay = moment().tz("America/New_York").subtract(1, "days").format("MM/DD/YYYY");

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
  let playingRush = false;
  let playingRewind = false;
  let tempGuesses = [];
  let mysteryArtistEntry;
  let mysteryArtist;
  let spotleNumber = "-1";
  let challengeNote = "";

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
      playingRush = false;
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
  
  for (let i = 1; i <= 6; i++) {
    const previousDay = moment().tz("America/New_York").subtract(i, "days").format("MM/DD/YYYY");

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
  
  lastSixDaysArtists.reverse();
  lastSixDaysDates.reverse();

  // Setup for Rush mode
  let rushIndex = 0;
  const eligibleArtists = [
    "Taylor Swift",
    "Kanye West",
    "Coldplay",
    "Frank Ocean",
    "Daft Punk",
    "The Beatles",
    "blink-182",
    "BTS",
    "Ariana Grande",
  ];

  // Error reporting function
  async function sendError(message) {
    if (browser) {
      const response = await fetch('/api/report-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({"message": message})
      });
    }
  }

  // Helper functions
  function getGenderLabel(code) {
    switch (code) {
      case "m": return "Male";
      case "f": return "Female";
      case "x": return "Mixed";
      case "nb": return "Nonbinary";
      default: return "Unknown";
    }
  }

  function handleStats(guessCount, win) {
    $played = $played + 1;
    if (!win) {
      // loss
      $solveList.push(0);
      $solveList = $solveList;
      $currentStreak = 0;
    }
    else {
      // win
      $currentStreak = $currentStreak + 1;
      $solveList.push(guessCount + 1);
      $solveList = $solveList;
      if ($currentStreak > $maxStreak) {
        $maxStreak = $currentStreak;
      }

      if ($solveList.length <= 3) {
        $bestGuessImages.push(mysteryArtist.image_uri)
        $bestGuessImages = $bestGuessImages;
      }
      else {
        const topPerformances = [...$solveList]
          .filter(result => result > 0) // Exclude losses (0)
          .sort((a, b) => b - a) // Sort descending
          .slice(0, 3); // Take top 3
      
        if (guessCount + 1 <= topPerformances[2]) {
          $bestGuessImages.push(mysteryArtist.image_uri)
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
    playingRush = false;
    playingChallenge = false;

    if (normalGame) {
      mysteryArtistEntry = mysteryArtistList.find(
        (entry) => entry.date === todaysDate
      );
      
      if (mysteryArtistEntry === undefined || mysteryArtistEntry === null) {
        console.log('Critical error.');
        sendError("The artist for todays date is not defined or there is a syntax error with the artist.");
      }
      
      mysteryArtist = artists.find(
        (artist) => artist.name === mysteryArtistEntry.artist
      );
      
      if (mysteryArtist === undefined || mysteryArtistEntry === null) {
        console.log('Critical error.');
        sendError("The artist for todays date IS set, but no matching artist in artists.json was found.");
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
        if ($guesses.some((obj) => obj.name === mysteryArtist.name && guessCount <= 9)) {
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
    createGame = true;
    playingGame = true;
    playingRewind = false;
    playingChallenge = false;
    splashScreen = false;
  }

  function playRewind() {
    playingGame = true;
    splashScreen = false;
    playingRewind = true;
    playingChallenge = false;
    normalGame = false;
    playingRush = false;

    if (browser && typeof gtag === 'function') {
      gtag('event', 'rewind', {});
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

  function playRush() {
    splashScreen = false;
    playingGame = true;
    normalGame = false;
    playingChallenge = false;
    playingRush = true;

    // Shuffle eligible artists
    for (let i = eligibleArtists.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [eligibleArtists[i], eligibleArtists[j]] = [
        eligibleArtists[j],
        eligibleArtists[i],
      ];
    }
    
    const selectedArtist = artists.find(
      (artist) => artist.name === eligibleArtists[rushIndex]
    );

    mysteryArtist = selectedArtist;
    mysteryArtistEntry = {
      image_uri: mysteryArtist.image_uri,
      song_uri: mysteryArtist.song_uri,
      artist: mysteryArtist.name,
    };
    tempGuesses = [];
    guessCount = 0;
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
          return;
        }, 1750);
        
        if (browser && typeof gtag === 'function') {
          gtag('event', 'gameover', {
            'result': "win",
            'guesses': guessCount + 1,
            'artist': mysteryArtist.name
          });

          handleStats(guessCount, true);
        }
      }

      if (guessCount + 1 == 10) {
        if (browser && typeof gtag === 'function') {
          gtag('event', 'gameover', {
            'result': "loss",
            'guesses': guessCount + 1,
            'artist': mysteryArtist.name
          });

          handleStats(guessCount, false);
        }
        
        setTimeout(() => {
          $gameOver = true;
          showResults = true;
          $guesses.push(mysteryArtist);
          $guesses = $guesses;
          result = "L";
          return;
        }, 1750);
      }

      guessCount++;
      return;
    }

    if (createGame) {
      createGameSelection = selectedArtist;
    }

    if (playingChallenge || playingRush || playingRewind) {
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
            return;
          }, 1750);
        }

        if (guessCount + 1 == 10) {
          setTimeout(() => {
            tempGameOver = true;
            showResults = true;
            tempGuesses.push(mysteryArtist)
            tempGuesses = tempGuesses;
            result = "L";
            return;
          }, 1750);
        }
      }

      if (playingRush) {
        if (selectedArtist == mysteryArtist) {
          rushIndex++;
          const selectedArtist = artists.find(
            (artist) => artist.name === eligibleArtists[rushIndex]
          );
          mysteryArtist = selectedArtist;
          mysteryArtistEntry = {
            image_uri: mysteryArtist.image_uri,
            song_uri: mysteryArtist.song_uri,
            artist: mysteryArtist.name,
          };
          tempGuesses = [];
        }
        if (guessCount + 1 == 30) {
          console.log("rush game over");
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

  function handleMenuClick() {
    if (playingChallenge) {
      window.location.href = window.location.href.split("?")[0];
    }
    playingGame = false;
    normalGame = false;
    playingRush = false;
    createGame = false;
    splashScreen = true;
  }

  function handleOverlayClose() {
    showResults = false;
  }

  function toggleHelp() {
    showHelp = !showHelp;
  }

  function handleCreateArtistSelect(event) {
    createGameSelection = artists.find(artist => artist.name === event.detail);
  }
</script>

<main>
  <!-- The backdrop div should be the first child in main -->
  <div class="backdrop"></div>
  
  <Ramp PUB_ID={PUB_ID} WEBSITE_ID={WEBSITE_ID} />
  
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
      <!-- Header -->
      <GameHeader 
        showBackButton={playingGame}
        showHelp={playingGame}
        showLogo={true}
        on:menu={handleMenuClick}
        on:help={toggleHelp}
      />
      
      <!-- Main content -->
      {#if splashScreen}
        <SplashScreen 
          yesterdaysArtist={yesterdaysArtist}
          on:play={(e) => {
            if (e.detail.mode === 'normal') playGame();
            else if (e.detail.mode === 'create') handleCreate();
            else if (e.detail.mode === 'rewind') playRewind();
          }}
          on:showHelp={toggleHelp}
        />
      {:else if playingGame}
        {#if playingRush}
          <Countdown></Countdown>
        {/if}
        
        {#if createGame}
          <CreateGame 
            selectedArtist={createGameSelection}
            on:selectArtist={handleCreateArtistSelect}
          />
        {:else}
          <GameBoard
            mode={normalGame ? 'normal' : playingChallenge ? 'challenge' : playingRewind ? 'rewind' : 'rush'}
            currentArtist={mysteryArtist}
            gameGuesses={normalGame ? $guesses : tempGuesses}
            isGameOver={normalGame ? $gameOver : tempGameOver}
            rewindDates={lastSixDaysDates}
            rewindIndex={rewindIndex}
            rushIndex={rushIndex}
            blurResults={showResults}
            challengeNote={challengeNote}
            on:guess={(e) => handleSearch(e.detail.artistName)}
            on:rewindNext={nextRewind}
            on:rewindPrevious={previousRewind}
          />
        {/if}
      {/if}
      
      {#if (playingGame && $guesses.length > 1) && !createGame || splashScreen}
        <Footer />
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
  
  /* Ensure the background is applied to the entire application */
  :global(body) {
    background-color: #121212 !important;
  }
  
  :global(.backdrop) {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background: linear-gradient(137.28deg, #677272 -5.33%, #121212 35.62%) no-repeat !important;
    background-size: cover !important;
    z-index: -1 !important;
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
</style>