<script>
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import moment from "moment";
  import "moment-timezone";
  import Help from "./Help.svelte";
  import Guess from "./Guess.svelte";
  import Gameover from "./Gameover.svelte";
  import Countdown from "./Countdown.svelte";
  import Icon from "./Icon.svelte";
  import "./styles.css";
  import artistList from "$lib/artists.json";
  import mysteryArtistList from "$lib/mysteryArtists.json";
  import {
    visited,
    currentGameDate,
    guesses,
    muted,
    gameOver,
  } from "./store.js";

  onMount(() => {
    if (browser) {
      window.ezstandalone = window.ezstandalone || {};
      ezstandalone.cmd = ezstandalone.cmd || [];
      ezstandalone.cmd.push(function () {
        ezstandalone.define(108);
        ezstandalone.enable();
        ezstandalone.display();
      });
    }
  });

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

  const artists = artistList.map((artist) => ({
    name: artist.artist,
    listener_rank: artist.index,
    image_uri: artist.image_uri,
    genre: artist.genre,
    debut_album_year: artist.debut_album_year,
    country: artist.country.toLowerCase(), // Make country lowercase
    group_size: artist.group_size,
    song_uri: artist.song_uri,
    song_image_uri: artist.song_image_uri,
    embedded_track: artist.embedded_track,
    gender: getGenderLabel(artist.gender),
  }));


  moment.tz.setDefault('UTC');
  const todaysDate = moment().utc().format("MM/DD/YYYY"); // Current date in UTC

  let playingGame = false;
  let normalGame = false;
  let createGame = false;
  let splashScreen = true;
  let showHelp = false;
  let searchTerm = "";
  let guessCount = 0;
  let tempGameOver = false;
  let showResults = false;
  let result = "";
  let createGameSelection = null;
  let createNote = "";
  let createShareBtnText = "SHARE";
  let playingChallenge = false;
  let playingRush = false;
  let tempGuesses = [];
  let mysteryArtistEntry;
  let mysteryArtist;
  let spotleNumber = "-1";
  let challengeNote = "";

  if (browser) {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedArtist = urlParams.get("artist");
    const encodedNote = urlParams.get("note");
    if (encodedArtist) {
      splashScreen = false;
      playingGame = true;
      playingRush = false;
      playingChallenge = true;

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

  const artistNames = artistList.map((artist) => artist.artist);

  function fuzzySearch(input) {
    if (input == "") {
      return [];
    }

    if (input.toLowerCase() == "bach") {
      return ["Johann Sebastian Bach"];
    }
    if (input.toLowerCase() == "mozart" || input.toLowerCase == "motzart") {
      return ["Wolfgang Amadeus Mozart"];
    }
    input = input.toLowerCase();
    const results = [];

    for (let item of artistNames) {
      const temp_item = item;
      item = item.toLowerCase();

      if (item.startsWith(input)) {
        results.push({ temp_item, score: 1 });
        continue;
      }

      let inputLength = input.length;
      let currentItemLength = item.length;
      let matrix = [];

      // Initialize the matrix with distances
      for (let i = 0; i <= currentItemLength; i++) {
        matrix[i] = [i];
      }
      for (let j = 0; j <= inputLength; j++) {
        matrix[0][j] = j;
      }

      // Fill in the matrix with distances
      for (let i = 1; i <= currentItemLength; i++) {
        for (let j = 1; j <= inputLength; j++) {
          if (item[i - 1] === input[j - 1]) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
          }
        }
      }

      // Calculate similarity score based on Levenshtein distance
      let maxDistance = Math.max(currentItemLength, inputLength);
      let distance = matrix[currentItemLength][inputLength];
      let similarity = 1 - distance / maxDistance;

      if (similarity >= 0.5) {
        results.push({ temp_item, score: similarity });
      }
    }

    results.sort((a, b) => b.score - a.score);

    return results.slice(0, 10).map((result) => result.temp_item);
  }

  $: filteredArtists = fuzzySearch(searchTerm);

  function playGame() {
    normalGame = true;
    playingGame = true;
    splashScreen = false;
    playingRush = false;
    playingChallenge = false;

    if (normalGame) {
      mysteryArtistEntry = mysteryArtistList.find(
        (entry) => entry.date === todaysDate
      );
      mysteryArtist = artists.find(
        (artist) => artist.name === mysteryArtistEntry.artist
      );
      mysteryArtistList.forEach((entry, index) => {
        // Compare the date property of each object with today's date
        if (entry.date === todaysDate) {
          // If a match is found, store the index
          spotleNumber = index;
          // Exit the loop since we found the match
          return;
        }
      });

      if ($currentGameDate == todaysDate) {
        guessCount = $guesses.length;
        if (guessCount >= 10) {
          result = "L";
          showResults = true;
          $gameOver = true;
        }
        if ($guesses.some((obj) => obj.name === mysteryArtist.name)) {
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

  function handleSearch(artistName) {
    if (filteredArtists.length == 0) {
      return;
    }
    searchTerm = "";

    if (artistName === null) {
      return;
    }

    const selectedArtist = artists.find((artist) => artist.name === artistName);

    if (normalGame) {
      if ($guesses.includes(selectedArtist)) {
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
      }

      if (guessCount + 1 == 10) {
        setTimeout(() => {
          $gameOver = true;
          showResults = true;
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

    if (playingChallenge || playingRush) {
      if (tempGameOver) {
        return;
      }
      if (tempGuesses.includes(selectedArtist)) {
        return;
      }
      tempGuesses.push(selectedArtist);
      tempGuesses = tempGuesses;
      guessCount++;

      if (playingChallenge) {
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

  function handleOverlayClose() {
    showResults = false;
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

  function handleMute() {
    if ($muted) {
      $muted = false;
    } else {
      $muted = true;
    }
  }

  function handleCreate() {
    createGame = true;
    playingGame = true;
    splashScreen = false;
  }

  let rushIndex = 0;
  function playRush() {
    splashScreen = false;
    playingGame = true;
    normalGame = false;
    playingChallenge = false;
    playingRush = true;

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

  function toggleHelp() {
    if (showHelp) {
      showHelp = false;
    } else {
      showHelp = true;
    }
  }

  function handleCreateShare(artist) {
    const artistUint8Array = new TextEncoder().encode(artist.name);
    const noteUint8Array = new TextEncoder().encode(createNote);

    // Encode the Uint8Array to Base64
    const encodedArtistName = btoa(
      String.fromCharCode.apply(null, artistUint8Array)
    );
    const encodedNote = btoa(String.fromCharCode.apply(null, noteUint8Array));

    // Generate the URL with encoded parameters
    let currentUrl = "";
    if (browser) {
      currentUrl = window.location.href;
    }
    const shareURL = `${currentUrl}?artist=${encodedArtistName}&note=${encodedNote}`;

    const shareText =
      "I made this Spotle for you! Guess the artist in 10 tries.\n\n" +
      shareURL;

    function isMobile() {
      const regex =
        /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      return regex.test(navigator.userAgent);
    }
    if (isMobile()) {
      if (navigator.share) {
        navigator
          .share({
            text: shareText,
          })
          .then(() => {
            console.log("Thanks for sharing!");
          })
          .catch(console.error);
      } else {
        // congratulations.innerHTML = "Text copied to clipboard.\t";
        createShareBtnText = "COPIED RESULT";
        navigator.clipboard
          .writeText(shareText)
          .then(() => {
            console.log("copied");
          })
          .catch((error) => {
            alert(`Copy failed! ${error}`);
          });
      }
    } else {
      // congratulations.innerHTML = "Text copied to clipboard.\t";
      createShareBtnText = "COPIED RESULT";
      navigator.clipboard.writeText(shareText);
    }
  }
</script>

<body>
  {#if showResults && !createGame}
    <Gameover
      {spotleNumber}
      {result}
      artist={mysteryArtistEntry}
      {guessCount}
      {playingChallenge}
      on:close={handleOverlayClose}
      muted={$muted}
    ></Gameover>
  {/if}
  <div class="container">
    <div class="ezoic-108" id="ezoic-pub-ad-placeholder-108"></div>
    {#if showHelp}
      <div class="help">
        <Help on:close={toggleHelp}></Help>
      </div>
    {/if}
    <div class="header">
      {#if playingGame}
        <div class="icon-btn left">
          <div on:click={handleMenuClick}>
            <Icon width={"1.75rem"} height={"1.75rem"} name={"menu"}></Icon>
          </div>
        </div>
      {/if}

      <div class="logo {playingGame ? 'smaller-svg' : ''}">
        <svg
          width="225"
          height="72"
          viewBox="0 0 225 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1.42464 38.965C0.638565 38.965 0 38.0963 0 37.0237V34.9763C0 33.9037 0.638565 33.035 1.42464 33.035C2.21072 33.035 2.84928 33.9037 2.84928 34.9763V37.0237C2.84928 38.0963 2.21072 38.965 1.42464 38.965ZM8.14413 40.0906V31.9094C8.14413 30.8341 7.5075 29.9653 6.72143 29.9653C5.93341 29.9653 5.29679 30.8341 5.29679 31.9094V40.0906C5.29679 41.1633 5.93341 42.0347 6.72143 42.0347C7.5075 42.0347 8.14413 41.1633 8.14413 40.0906ZM13.437 46.892V25.108C13.437 24.0327 12.8004 23.164 12.0124 23.164C11.2263 23.164 10.5897 24.0327 10.5897 25.108V46.892C10.5897 47.9647 11.2263 48.836 12.0124 48.836C12.8004 48.836 13.437 47.9647 13.437 46.892ZM18.7338 40.0906V31.9094C18.7338 30.8341 18.0972 29.9653 17.3092 29.9653C16.5231 29.9653 15.8865 30.8341 15.8865 31.9094V40.0906C15.8865 41.1633 16.5231 42.0347 17.3092 42.0347C18.0972 42.0347 18.7338 41.1633 18.7338 40.0906ZM24.0306 38.1811V33.8189C24.0306 32.7436 23.394 31.8749 22.606 31.8749C21.8199 31.8749 21.1813 32.7436 21.1813 33.8189V38.1811C21.1813 39.2564 21.8199 40.1251 22.606 40.1251C23.394 40.1251 24.0306 39.2564 24.0306 38.1811ZM29.3216 42.5458V29.4542C29.3216 28.3815 28.685 27.5102 27.8989 27.5102C27.1109 27.5102 26.4742 28.3815 26.4742 29.4542V42.5458C26.4742 43.6185 27.1109 44.4872 27.8989 44.4872C28.685 44.4872 29.3216 43.6185 29.3216 42.5458ZM34.6184 49.8054V22.1919C34.6184 21.1193 33.9817 20.2506 33.1957 20.2506C32.4077 20.2506 31.771 21.1193 31.771 22.1919V49.8054C31.771 50.8807 32.4077 51.7494 33.1957 51.7494C33.9817 51.7494 34.6184 50.8807 34.6184 49.8054ZM39.9152 58.7044V13.2956C39.9152 12.2203 39.2785 11.3516 38.4905 11.3516C37.7044 11.3516 37.0678 12.2203 37.0678 13.2956V58.7044C37.0678 59.7771 37.7044 60.6484 38.4905 60.6484C39.2785 60.6484 39.9152 59.7771 39.9152 58.7044ZM45.2081 49.1406V22.8567C45.2081 21.7841 44.5714 20.9154 43.7834 20.9154C42.9974 20.9154 42.3588 21.7841 42.3588 22.8567V49.1406C42.3588 50.2159 42.9974 51.0846 43.7834 51.0846C44.5714 51.0846 45.2081 50.2159 45.2081 49.1406ZM50.5049 42.5458V29.4542C50.5049 28.3815 49.8663 27.5102 49.0802 27.5102C48.2922 27.5102 47.6556 28.3815 47.6556 29.4542V42.5458C47.6556 43.6185 48.2922 44.4872 49.0802 44.4872C49.8663 44.4872 50.5049 43.6185 50.5049 42.5458ZM55.7997 40.0906V31.9094C55.7997 30.8341 55.1631 29.9653 54.377 29.9653C53.589 29.9653 52.9524 30.8341 52.9524 31.9094V40.0906C52.9524 41.1633 53.589 42.0347 54.377 42.0347C55.1631 42.0347 55.7997 41.1633 55.7997 40.0906ZM61.0926 37.466V34.534C61.0926 33.4587 60.456 32.59 59.668 32.59C58.8819 32.59 58.2453 33.4587 58.2453 34.534V37.466C58.2453 38.5386 58.8819 39.41 59.668 39.41C60.456 39.41 61.0926 38.5386 61.0926 37.466ZM66.3894 41.7777V30.2223C66.3894 29.147 65.7528 28.2782 64.9648 28.2782C64.1787 28.2782 63.5421 29.147 63.5421 30.2223V41.7777C63.5421 42.853 64.1787 43.7218 64.9648 43.7218C65.7528 43.7218 66.3894 42.853 66.3894 41.7777ZM71.6862 39.3755V32.6245C71.6862 31.5518 71.0496 30.6804 70.2615 30.6804C69.4755 30.6804 68.8369 31.5518 68.8369 32.6245V39.3755C68.8369 40.4482 69.4755 41.3169 70.2615 41.3169C71.0496 41.3169 71.6862 40.4482 71.6862 39.3755ZM76.9772 47.7607V24.2392C76.9772 23.164 76.3405 22.2952 75.5545 22.2952C74.7664 22.2952 74.1298 23.164 74.1298 24.2392V47.7607C74.1298 48.836 74.7664 49.7048 75.5545 49.7048C76.3405 49.7048 76.9772 48.836 76.9772 47.7607ZM82.2739 57.9893V14.0107C82.2739 12.938 81.6373 12.0667 80.8512 12.0667C80.0632 12.0667 79.4266 12.938 79.4266 14.0107V57.9893C79.4266 59.062 80.0632 59.9307 80.8512 59.9307C81.6373 59.9307 82.2739 59.062 82.2739 57.9893ZM87.5707 70.056V1.94136C87.5707 0.868715 86.9341 0 86.1461 0C85.36 0 84.7234 0.868715 84.7234 1.94136V70.056C84.7234 71.1313 85.36 72 86.1461 72C86.9341 72 87.5707 71.1313 87.5707 70.056ZM92.8636 57.9893V14.0107C92.8636 12.938 92.227 12.0667 91.439 12.0667C90.6529 12.0667 90.0144 12.938 90.0144 14.0107V57.9893C90.0144 59.062 90.6529 59.9307 91.439 59.9307C92.227 59.9307 92.8636 59.062 92.8636 57.9893ZM98.1604 47.7607V24.2392C98.1604 23.164 97.5219 22.2952 96.7358 22.2952C95.9478 22.2952 95.3111 23.164 95.3111 24.2392V47.7607C95.3111 48.836 95.9478 49.7048 96.7358 49.7048C97.5219 49.7048 98.1604 48.836 98.1604 47.7607ZM103.455 39.5795V32.4205C103.455 31.3452 102.819 30.4765 102.033 30.4765C101.245 30.4765 100.608 31.3452 100.608 32.4205V39.5795C100.608 40.6521 101.245 41.5235 102.033 41.5235C102.819 41.5235 103.455 40.6521 103.455 39.5795ZM108.752 42.085V29.915C108.752 28.8397 108.115 27.971 107.329 27.971C106.541 27.971 105.905 28.8397 105.905 29.915V42.085C105.905 43.1576 106.541 44.029 107.329 44.029C108.112 44.029 108.752 43.1576 108.752 42.085ZM114.045 47.7607V24.2392C114.045 23.164 113.408 22.2952 112.62 22.2952C111.834 22.2952 111.196 23.164 111.196 24.2392V47.7607C111.196 48.836 111.834 49.7048 112.62 49.7048C113.408 49.7048 114.045 48.836 114.045 47.7607ZM119.342 56.0956V15.9017C119.342 14.8291 118.703 13.9603 117.917 13.9603C117.131 13.9603 116.492 14.8291 116.492 15.9017V56.0956C116.492 57.1709 117.131 58.0397 117.917 58.0397C118.703 58.0397 119.342 57.1709 119.342 56.0956ZM124.639 47.7607V24.2392C124.639 23.164 124 22.2952 123.214 22.2952C122.426 22.2952 121.789 23.164 121.789 24.2392V47.7607C121.789 48.836 122.426 49.7048 123.214 49.7048C123.996 49.7048 124.639 48.836 124.639 47.7607ZM129.93 42.085V29.915C129.93 28.8397 129.293 27.971 128.507 27.971C127.719 27.971 127.082 28.8397 127.082 29.915V42.085C127.082 43.1576 127.719 44.029 128.507 44.029C129.293 44.029 129.93 43.1576 129.93 42.085ZM135.226 38.4035V33.5965C135.226 32.5212 134.59 31.6525 133.802 31.6525C133.016 31.6525 132.379 32.5212 132.379 33.5965V38.4035C132.379 39.4762 133.016 40.3475 133.802 40.3475C134.59 40.3475 135.226 39.4762 135.226 38.4035ZM140.523 40.909V31.091C140.523 30.0157 139.886 29.147 139.098 29.147C138.312 29.147 137.674 30.0157 137.674 31.091V40.909C137.674 41.9817 138.312 42.853 139.098 42.853C139.881 42.853 140.523 41.9817 140.523 40.909ZM145.816 39.1186V32.8814C145.816 31.8061 145.177 30.9374 144.391 30.9374C143.603 30.9374 142.967 31.8061 142.967 32.8814V39.1186C142.967 40.1939 143.603 41.0626 144.391 41.0626C145.177 41.0626 145.816 40.1939 145.816 39.1186ZM151.111 44.6938V27.3062C151.111 26.2336 150.474 25.3622 149.688 25.3622C148.9 25.3622 148.264 26.2336 148.264 27.3062V44.6938C148.264 45.7664 148.9 46.6351 149.688 46.6351C150.474 46.6351 151.111 45.7664 151.111 44.6938ZM156.408 52.6711V19.3289C156.408 18.2562 155.771 17.3849 154.983 17.3849C154.197 17.3849 153.56 18.2562 153.56 19.3289V52.6711C153.56 53.7438 154.197 54.6125 154.983 54.6125C155.767 54.6125 156.408 53.7438 156.408 52.6711ZM161.701 63.9194V8.07798C161.701 7.00533 161.064 6.13662 160.276 6.13662C159.49 6.13662 158.851 7.00533 158.851 8.07798V63.9194C158.851 64.9947 159.49 65.8634 160.276 65.8634C161.064 65.8634 161.701 64.9947 161.701 63.9194ZM166.997 51.7997V20.1976C166.997 19.125 166.359 18.2562 165.573 18.2562C164.785 18.2562 164.148 19.125 164.148 20.1976V51.7997C164.148 52.875 164.785 53.7438 165.573 53.7438C166.359 53.7438 166.997 52.875 166.997 51.7997ZM219.754 51.7997V20.1976C219.754 19.125 219.115 18.2562 218.329 18.2562C217.541 18.2562 216.904 19.125 216.904 20.1976V51.7997C216.904 52.875 217.541 53.7438 218.329 53.7438C219.115 53.7438 219.754 52.875 219.754 51.7997ZM172.292 41.881V30.119C172.292 29.0463 171.656 28.1749 170.869 28.1749C170.081 28.1749 169.445 29.0463 169.445 30.119V41.881C169.445 42.9537 170.081 43.8224 170.869 43.8224C171.656 43.8224 172.292 42.9537 172.292 41.881ZM209.259 41.881V30.119C209.259 29.0463 208.622 28.1749 207.836 28.1749C207.048 28.1749 206.412 29.0463 206.412 30.119V41.881C206.412 42.9537 207.048 43.8224 207.836 43.8224C208.622 43.8224 209.259 42.9537 209.259 41.881ZM177.585 38.1466V33.8507C177.585 32.7781 176.948 31.9094 176.16 31.9094C175.374 31.9094 174.738 32.7781 174.738 33.8507V38.1466C174.738 39.2219 175.374 40.0906 176.16 40.0906C176.948 40.0906 177.585 39.2219 177.585 38.1466ZM182.882 39.9873V32.01C182.882 30.9374 182.245 30.0686 181.457 30.0686C180.671 30.0686 180.035 30.9374 180.035 32.01V39.9873C180.035 41.0626 180.671 41.9314 181.457 41.9314C182.245 41.9314 182.882 41.0626 182.882 39.9873ZM204.013 39.9873V32.01C204.013 30.9374 203.376 30.0686 202.59 30.0686C201.802 30.0686 201.165 30.9374 201.165 32.01V39.9873C201.165 41.0626 201.802 41.9314 202.59 41.9314C203.376 41.9314 204.013 41.0626 204.013 39.9873ZM188.179 46.6351V25.3622C188.179 24.2896 187.542 23.4209 186.754 23.4209C185.968 23.4209 185.329 24.2896 185.329 25.3622V46.6351C185.329 47.7104 185.968 48.5791 186.754 48.5791C187.542 48.5791 188.179 47.7104 188.179 46.6351ZM225 46.6351V25.3622C225 24.2896 224.361 23.4209 223.575 23.4209C222.789 23.4209 222.151 24.2896 222.151 25.3622V46.6351C222.151 47.7104 222.789 48.5791 223.575 48.5791C224.361 48.5791 225 47.7104 225 46.6351ZM214.507 46.6351V25.3622C214.507 24.2896 213.869 23.4209 213.083 23.4209C212.295 23.4209 211.658 24.2896 211.658 25.3622V46.6351C211.658 47.7104 212.295 48.5791 213.083 48.5791C213.869 48.5791 214.507 47.7104 214.507 46.6351ZM193.47 39.1186V32.8814C193.47 31.8061 192.833 30.9374 192.047 30.9374C191.259 30.9374 190.622 31.8061 190.622 32.8814V39.1186C190.622 40.1939 191.259 41.0626 192.047 41.0626C192.833 41.0626 193.47 40.1939 193.47 39.1186ZM198.766 42.2889V29.7111C198.766 28.6358 198.13 27.7671 197.344 27.7671C196.556 27.7671 195.919 28.6358 195.919 29.7111V42.2889C195.919 43.3642 196.556 44.2329 197.344 44.2329C198.13 44.2329 198.766 43.3642 198.766 42.2889Z"
            fill="#8370DE"
          />
          <path
            d="M64.3466 22.1307C64.2102 20.7557 63.625 19.6875 62.5909 18.9261C61.5568 18.1648 60.1534 17.7841 58.3807 17.7841C57.1761 17.7841 56.1591 17.9545 55.3295 18.2955C54.5 18.625 53.8636 19.0852 53.4205 19.6761C52.9886 20.267 52.7727 20.9375 52.7727 21.6875C52.75 22.3125 52.8807 22.858 53.1648 23.3239C53.4602 23.7898 53.8636 24.1932 54.375 24.5341C54.8864 24.8636 55.4773 25.1534 56.1477 25.4034C56.8182 25.642 57.5341 25.8466 58.2955 26.017L61.4318 26.767C62.9545 27.108 64.3523 27.5625 65.625 28.1307C66.8977 28.6989 68 29.3977 68.9318 30.2273C69.8636 31.0568 70.5852 32.0341 71.0966 33.1591C71.6193 34.2841 71.8864 35.5739 71.8977 37.0284C71.8864 39.1648 71.3409 41.017 70.2614 42.5852C69.1932 44.142 67.6477 45.3523 65.625 46.2159C63.6136 47.0682 61.1875 47.4943 58.3466 47.4943C55.5284 47.4943 53.0739 47.0625 50.983 46.1989C48.9034 45.3352 47.2784 44.0568 46.108 42.3636C44.9489 40.6591 44.3409 38.5511 44.2841 36.0398H51.4261C51.5057 37.2102 51.8409 38.1875 52.4318 38.9716C53.0341 39.7443 53.8352 40.3295 54.8352 40.7273C55.8466 41.1136 56.9886 41.3068 58.2614 41.3068C59.5114 41.3068 60.5966 41.125 61.517 40.7614C62.4489 40.3977 63.1705 39.892 63.6818 39.2443C64.1932 38.5966 64.4489 37.8523 64.4489 37.0114C64.4489 36.2273 64.2159 35.5682 63.75 35.0341C63.2955 34.5 62.625 34.0455 61.7386 33.6705C60.8636 33.2955 59.7898 32.9545 58.517 32.6477L54.7159 31.6932C51.7727 30.9773 49.4489 29.858 47.7443 28.3352C46.0398 26.8125 45.1932 24.7614 45.2045 22.1818C45.1932 20.0682 45.7557 18.2216 46.892 16.642C48.0398 15.0625 49.6136 13.8295 51.6136 12.9432C53.6136 12.0568 55.8864 11.6136 58.4318 11.6136C61.0227 11.6136 63.2841 12.0568 65.2159 12.9432C67.1591 13.8295 68.6705 15.0625 69.75 16.642C70.8295 18.2216 71.3864 20.0511 71.4205 22.1307H64.3466ZM76.7259 56.8182V20.8182H83.8849V25.2159H84.2088C84.527 24.5114 84.9872 23.7955 85.5895 23.0682C86.2031 22.3295 86.9986 21.7159 87.9759 21.2273C88.9645 20.7273 90.1918 20.4773 91.6577 20.4773C93.5668 20.4773 95.3281 20.9773 96.9418 21.9773C98.5554 22.9659 99.8452 24.4602 100.811 26.4602C101.777 28.4489 102.26 30.9432 102.26 33.9432C102.26 36.8636 101.788 39.3295 100.845 41.3409C99.9134 43.3409 98.6406 44.858 97.027 45.892C95.4247 46.9148 93.6293 47.4261 91.6406 47.4261C90.2315 47.4261 89.0327 47.1932 88.044 46.7273C87.0668 46.2614 86.2656 45.6761 85.6406 44.9716C85.0156 44.2557 84.5384 43.5341 84.2088 42.8068H83.9872V56.8182H76.7259ZM83.8338 33.9091C83.8338 35.4659 84.0497 36.8239 84.4815 37.983C84.9134 39.142 85.5384 40.0455 86.3565 40.6932C87.1747 41.3295 88.169 41.6477 89.3395 41.6477C90.5213 41.6477 91.5213 41.3239 92.3395 40.6761C93.1577 40.017 93.777 39.108 94.1974 37.9489C94.6293 36.7784 94.8452 35.4318 94.8452 33.9091C94.8452 32.3977 94.6349 31.0682 94.2145 29.9205C93.794 28.7727 93.1747 27.875 92.3565 27.2273C91.5384 26.5795 90.5327 26.2557 89.3395 26.2557C88.1577 26.2557 87.1577 26.5682 86.3395 27.1932C85.5327 27.8182 84.9134 28.7045 84.4815 29.8523C84.0497 31 83.8338 32.3523 83.8338 33.9091ZM118.93 47.5114C116.283 47.5114 113.993 46.9489 112.061 45.8239C110.141 44.6875 108.658 43.108 107.612 41.0852C106.567 39.0511 106.044 36.6932 106.044 34.0114C106.044 31.3068 106.567 28.9432 107.612 26.9205C108.658 24.8864 110.141 23.3068 112.061 22.1818C113.993 21.0455 116.283 20.4773 118.93 20.4773C121.578 20.4773 123.862 21.0455 125.783 22.1818C127.714 23.3068 129.203 24.8864 130.249 26.9205C131.294 28.9432 131.817 31.3068 131.817 34.0114C131.817 36.6932 131.294 39.0511 130.249 41.0852C129.203 43.108 127.714 44.6875 125.783 45.8239C123.862 46.9489 121.578 47.5114 118.93 47.5114ZM118.964 41.8864C120.169 41.8864 121.175 41.5455 121.982 40.8636C122.788 40.1705 123.396 39.2273 123.805 38.0341C124.226 36.8409 124.436 35.483 124.436 33.9602C124.436 32.4375 124.226 31.0795 123.805 29.8864C123.396 28.6932 122.788 27.75 121.982 27.0568C121.175 26.3636 120.169 26.017 118.964 26.017C117.749 26.017 116.726 26.3636 115.896 27.0568C115.078 27.75 114.459 28.6932 114.038 29.8864C113.629 31.0795 113.425 32.4375 113.425 33.9602C113.425 35.483 113.629 36.8409 114.038 38.0341C114.459 39.2273 115.078 40.1705 115.896 40.8636C116.726 41.5455 117.749 41.8864 118.964 41.8864ZM150.464 20.8182V26.2727H134.697V20.8182H150.464ZM138.277 14.5455H145.538V38.9545C145.538 39.625 145.641 40.1477 145.845 40.5227C146.05 40.8864 146.334 41.142 146.697 41.2898C147.072 41.4375 147.504 41.5114 147.993 41.5114C148.334 41.5114 148.675 41.483 149.016 41.4261C149.357 41.358 149.618 41.3068 149.8 41.2727L150.942 46.6761C150.578 46.7898 150.067 46.9205 149.408 47.0682C148.749 47.2273 147.947 47.3239 147.004 47.358C145.254 47.4261 143.72 47.1932 142.402 46.6591C141.095 46.125 140.078 45.2955 139.351 44.1705C138.624 43.0455 138.266 41.625 138.277 39.9091V14.5455ZM163.018 12.0909V47H155.757V12.0909H163.018ZM180.767 47.5114C178.074 47.5114 175.756 46.9659 173.812 45.875C171.881 44.7727 170.392 43.2159 169.347 41.2045C168.301 39.1818 167.778 36.7898 167.778 34.0284C167.778 31.3352 168.301 28.9716 169.347 26.9375C170.392 24.9034 171.864 23.3182 173.761 22.1818C175.67 21.0455 177.909 20.4773 180.477 20.4773C182.205 20.4773 183.813 20.7557 185.301 21.3125C186.801 21.858 188.108 22.6818 189.222 23.7841C190.347 24.8864 191.222 26.2727 191.847 27.9432C192.472 29.6023 192.784 31.5455 192.784 33.7727V35.767H170.676V31.267H185.949C185.949 30.2216 185.722 29.2955 185.267 28.4886C184.813 27.6818 184.182 27.0511 183.375 26.5966C182.58 26.1307 181.653 25.8977 180.597 25.8977C179.494 25.8977 178.517 26.1534 177.665 26.6648C176.824 27.1648 176.165 27.8409 175.688 28.6932C175.21 29.5341 174.966 30.4716 174.955 31.5057V35.7841C174.955 37.0795 175.193 38.1989 175.67 39.142C176.159 40.0852 176.847 40.8125 177.733 41.3239C178.619 41.8352 179.67 42.0909 180.886 42.0909C181.693 42.0909 182.432 41.9773 183.102 41.75C183.773 41.5227 184.347 41.1818 184.824 40.7273C185.301 40.2727 185.665 39.7159 185.915 39.0568L192.631 39.5C192.29 41.1136 191.591 42.5227 190.534 43.7273C189.489 44.9205 188.136 45.8523 186.477 46.5227C184.83 47.1818 182.926 47.5114 180.767 47.5114Z"
            fill="white"
          />
        </svg>
      </div>

      {#if playingGame}
        <div class="right">
          {#if $muted == true}
            <div class="icon-btn" on:click={handleMute}>
              <Icon width={"1.75rem"} height={"1.75rem"} name={"muted"}></Icon>
            </div>
          {/if}
          {#if $muted == false}
            <div class="icon-btn" on:click={handleMute}>
              <Icon width={"1.75rem"} height={"1.75rem"} name={"unmuted"}
              ></Icon>
            </div>
          {/if}
          <div class="icon-btn" on:click={toggleHelp}>
            <Icon width={"1.75rem"} height={"1.75rem"} name={"help"}></Icon>
          </div>
        </div>
      {/if}
    </div>
    <div class="content">
      {#if splashScreen}
        <div class="splash-screen">
          <p>Guess the artist in 10 tries.</p>
          <button class="styled-btn main-btn" on:click={playGame}>PLAY</button>
          <p></p>
          <button class="styled-btn learn-btn" on:click={toggleHelp}>
            HOW TO PLAY
          </button>
          <p></p>
          <p>Need more Spotle?</p>
          <button class="styled-btn" on:click={handleCreate}
            >CREATE A SPOTLE</button
          >
          <p></p>
          <button class="styled-btn coming-soon">
            SPOTLE REWIND (coming soon)
          </button>
          <!-- <button class="styled-btn" on:click={playRush}>SPOTLE JAM</button> -->

          <p>Play our new game!</p>
          <button class="styled-btn purple"
            ><a href="https://harmonies.io" target="_blank"
              >Harmonies: Music connections</a
            ></button
          >
        </div>
      {/if}

      {#if playingGame}
        {#if playingRush}
          <Countdown></Countdown>
        {/if}
        <div
          class="game-container"
          style={showResults ? "filter: blur(3px)" : ""}
        >
          <div class="game-info-container">
            {#if playingRush}
              <div class="solved-spotles">
                Solved Spotles: {rushIndex}
              </div>
            {/if}
            <div class="guesses-remaining">
              {#if normalGame || playingChallenge}
                {#if guessCount == 10}
                  Guess 10 of 10
                {:else}
                  Guess {guessCount + 1} of 10
                {/if}
              {/if}
              {#if createGame}
                Pick an artist for your friend to guess.
              {/if}
              {#if playingRush}
                Guess {guessCount + 1} of 30
              {/if}
            </div>
          </div>

          <div class="search-container">
            {#if normalGame}
              <input
                type="text"
                name="search"
                id="search"
                placeholder="Type a guess here..."
                autocomplete="off"
                disabled={$gameOver}
                bind:value={searchTerm}
                on:keydown={(e) => {
                  if (e.key === "Enter")
                    handleSearch(filteredArtists[0], createGame);
                }}
              />
            {:else}
              <input
                type="text"
                name="search"
                id="search"
                placeholder="Type a guess here..."
                autocomplete="off"
                bind:value={searchTerm}
                on:keydown={(e) => {
                  if (e.key === "Enter")
                    handleSearch(filteredArtists[0], createGame);
                }}
              />
            {/if}
            <button
              class="guess-btn"
              on:click={() => handleSearch(filteredArtists[0], createGame)}
              ><i class="fa fa-search fa-lg"></i></button
            >
            <ul
              class="results"
              style="display: {filteredArtists.length > 0 ? 'block' : 'none'}"
            >
              {#each filteredArtists as artist}
                <li on:click={() => handleSearch(artist, createGame)}>
                  {artist}
                </li>
              {/each}
            </ul>
          </div>
          {#if playingChallenge && tempGuesses.length == 0 && challengeNote != ""}
            <p class="challenge-explain">
              A hint from your friend: {challengeNote}
            </p>
          {/if}
          {#if !createGame}
            <div class="guess-container">
              {#if normalGame}
                {#each [...$guesses].reverse() as guess (guess.name)}
                  <Guess artist={guess} {mysteryArtist}></Guess>
                {/each}
              {:else}
                {#each [...tempGuesses].reverse() as guess (guess.name)}
                  <Guess artist={guess} {mysteryArtist}></Guess>
                {/each}
              {/if}
            </div>
            <div class="ad-space"></div>
          {:else}
            <div>
              <!-- Create Image -->
              {#if createGameSelection}
                <div class="header-row">
                  <img
                    src={createGameSelection.image_uri}
                    alt={createGameSelection.name}
                  />
                  <h2>{createGameSelection.name}</h2>
                </div>

                <p class="challenge-text">Leave a note for your friend.</p>

                <input
                  class="create-form"
                  placeholder="Give a hint or message here..."
                  bind:value={createNote}
                />
                <p></p>
                <button
                  class="styled-btn"
                  on:click={handleCreateShare(createGameSelection)}
                  >{createShareBtnText}</button
                >
              {/if}
            </div>
          {/if}
        </div>
      {/if}
    </div>
    {#if !showHelp}
      <div class="footer">
        <p>made by flatwhite studios</p>
        <p>
          &nbsp;| <a href="./privacy" target="_blank">privacy</a> |
          <a href="https://twitter.com/Spotle_io" target="_blank">follow us!</a>
        </p>
      </div>
    {/if}
  </div>
</body>

<style>
  body {
    scrollbar-width: none; /* For Firefox */
    -ms-overflow-style: none; /* For Internet Explorer and Edge */
    overflow: none;
  }

  body::-webkit-scrollbar {
    display: none;
  }

  .splash-screen {
    margin-top: 30px;
  }

  .splash-screen p {
    color: #fff;
    text-align: center;
    font-size: 18px;
    font-style: normal;
    font-weight: 300;
    line-height: normal;
  }

  .splash-screen button:hover {
    transform: scale(1.075) perspective(1px);
  }

  button a {
    color: #fff;
    text-decoration: none; /* no underline */
  }

  .container {
    position: relative;
    width: 100%;
    height: 100vh; /* Set the height of the container to full viewport height */
  }

  .header {
    position: relative; /* Establishes positioning context for absolutely positioned children */
    display: flex;
    align-items: center;
    top: 7%;
    margin-bottom: 25px;
  }

  .logo {
    position: absolute;
    left: 50%; /* Positions the left edge of the element at the center of its containing block */
    transform: translateX(
      -50%
    ); /* Translates the element back by half of its own width, effectively centering it */
  }

  .smaller-svg {
    left: 42% !important;
  }

  .right {
    margin-left: auto;
    display: flex;
    align-items: center;
    flex-direction: row-reverse;
  }

  .icon-btn {
    margin-left: 7.5px;
  }

  .icon-btn:hover {
    cursor: pointer;
  }

  .left {
    margin-right: 50px;
    margin-top: 2.5px;
    display: flex; /* Ensure the button is aligned properly */
    align-items: center; /* Center the button vertically */
  }

  .left button {
    margin: 0; /* Reset margin */
    padding: 0; /* Reset padding */
  }

  button:hover {
    cursor: pointer;
  }

  .smaller-svg svg {
    width: 110%;
    height: 110%;
  }

  .content {
    padding-top: 75px; /* Adjust this value as needed to create space below the logo */
  }

  .styled-btn {
    width: 170px;
    height: 47px;
    color: #fff;
    text-align: center;
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    background-color: #8370de;
    font-size: 15px;
    position: relative;
    border-radius: 100px;
  }

  .main-btn {
    position: relative;
    width: 190px;
    border-radius: 100px;
    height: 48px;
    color: #fff;
    text-align: center;
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
  }

  .learn-btn {
    border: 0.75px solid #fff;
    background: rgba(131, 112, 222, 0);
  }

  .coming-soon {
    background-color: #6a6a6a;
    color: #c3c3c3;
  }

  .solved-spotles {
    color: #fff;
    align-self: flex-start;
  }

  .guesses-remaining {
    color: #ffff;
    margin-bottom: 2px;
    float: right;
    margin-right: 12.5px;
  }

  .search-container {
    position: relative;
    width: 340px;
    border-radius: 1.625rem;
    margin: auto;
    background-color: inherit;
    border: none;
    box-shadow: 0px 1px 5px 3px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
  }

  input::value {
    margin-left: 2rem;
  }

  input {
    width: 100%;
    border: none;
    height: 40px;
    border-radius: 1.625rem;
    font-size: 18px;
    box-sizing: border-box;
    padding-left: 1rem;
    box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.1);
  }

  input:focus {
    outline: none;
  }

  button {
    position: absolute;
    border: none;
    background: none;
  }

  button:focus {
    outline: none;
  }

  button i {
    color: #6d7b98;
    cursor: pointer;
  }

  .results {
    position: absolute;
    background-color: #ffff;
    opacity: 90%;
    max-width: 320px;
    width: 100%;
    top: 100%;
    border-radius: 4px;
    z-index: 1;
  }

  li {
    list-style: none;
    font-size: 120%;
    margin-top: 2.5px;
    display: flex;
    flex-direction: start;
    justify-content: left;
    color: black;
  }

  li:hover {
    background: #ececec;
  }

  .results {
    padding: 10px;
  }

  .results ul li:hover {
    background: #ececec;
  }

  .guess-container {
    display: flex;
    flex-direction: column;
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
    overflow: auto;
  }

  .guess-container::-webkit-scrollbar {
    display: none;
  }

  .header-row {
    display: flex;
    flex-direction: row; /* Change to row */
    align-items: center; /* Vertically center items */
    color: #fff;
    margin-bottom: 5px;
    margin-top: 50px;
  }

  .header-row img {
    margin-right: 0.8rem;
    border-radius: 50%;
    object-fit: cover;
    width: 80px;
    height: 80px;
  }

  .create-form {
    border-radius: 5px;
  }

  .footer {
    position: fixed;
    margin-top: auto;
    display: flex;
    color: #fff;
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    bottom: 0;
    width: 100%;
  }

  .footer a {
    color: #8370de;
    text-decoration: underline;
  }

  .ad-space {
    height: 100px;
  }

  .challenge-explain {
    display: flex;
    justify-content: center;
    align-self: center;
    width: 300px;
    padding-left: 10%;
    padding-right: 10%;
  }

  @media only screen and (max-width: 600px) {
    .ezoic-108 {
      height: 52.5px;
    }
  }
</style>
