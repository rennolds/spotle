<script>
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import moment from "moment";
  import "moment-timezone";
  import Help from "./Help.svelte";
  import Guess from "./Guess.svelte";
  import Gameover from "./Gameover.svelte";
  import Countdown from "./Countdown.svelte";
  import Footer from "./Footer.svelte";
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

  moment.tz.setDefault("UTC");
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
    const guessNames = $guesses.map((artist) => artist.name);

    if (normalGame) {
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
          <p>10 guesses</p>
          <p>1000 artists</p>
          <p>A new Spotle everyday</p>
          <button class="styled-btn main-btn" on:click={playGame}>PLAY</button>
          <p></p>
          <button class="styled-btn learn-btn" on:click={toggleHelp}>
            HOW TO PLAY
          </button>
          <p></p>

          <div class="module-list">
            <h2 class="module-list-header">Need more Spotle?</h2>
            <div class="module" on:click={handleCreate}>
              <div class="module-image"></div>
              <div class="module-description">
                <p>Create your own Spotle and send it to your friends!</p>
              </div>
            </div>

            <div class="module">
              <div class="module-image"></div>
              <div class="module-description">
                <p>Missed a few days? Rewind and play the last week.</p>
              </div>
            </div>
          </div>

          <div class="module-list">
            <h2 class="module-list-header">Play our new game!</h2>
            <div class="module">
              <a
                class="harmonies-link"
                href="https://harmonies.io"
                target="_blank"
              >
                <div class="module-image"></div>
                <div class="module-description">
                  <p>The music connections game!</p>
                </div>
              </a>
            </div>
          </div>

          <div class="ad-space"></div>

          <!--           
          <p>Need more Spotle?</p>
          <button class="styled-btn" on:click={handleCreate}
            >CREATE A SPOTLE</button
          >
          <p></p>
          <button class="styled-btn coming-soon">
            SPOTLE REWIND (coming soon)
          </button>
          <button class="styled-btn" on:click={playRush}>SPOTLE JAM</button>

          <p>Play our new game!</p>
          <button class="styled-btn purple"
            ><a href="https://harmonies.io" target="_blank"
              >Harmonies: Music connections</a
            ></button
        > -->
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
                <div class="create-game-text">
                  <p>1.</p>
                  <h3>Pick an artist for your friend to guess.</h3>
                </div>
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
          {#if normalGame && $guesses.length == 0}
            <p class="in-game-text">Guess the artist of the day.</p>
            <p class="in-game-text">
              Search for an artist to make your first guess.
            </p>
          {/if}
          {#if normalGame && $guesses.length == 1}
            <p class="in-game-text">
              Use the matching attributes to make more guesses. Good luck!
            </p>
          {/if}
          {#if playingChallenge && tempGuesses.length == 0 && challengeNote != ""}
            <p class="in-game-text">
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
            {#if normalGame && $guesses.length == 1}
              <svg
                class="in-game-svg"
                width="275"
                height="44"
                viewBox="0 0 315 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="100" height="50" rx="10" fill="#454545" />
                <rect x="108" width="100" height="50" rx="10" fill="#FFE600" />
                <rect x="215" width="100" height="50" rx="10" fill="#00B011" />
                <path
                  d="M27.3513 19.8182V30H26.4465L20.4308 21.4737H20.3513V30H19.4216V19.8182H20.3215L26.357 28.3544H26.4365V19.8182H27.3513ZM32.8424 30.1591C32.1829 30.1591 31.5995 29.9917 31.0924 29.657C30.5886 29.3222 30.1942 28.8598 29.9092 28.2699C29.6241 27.6766 29.4816 26.9922 29.4816 26.2166C29.4816 25.4344 29.6241 24.7467 29.9092 24.1534C30.1942 23.5568 30.5886 23.0928 31.0924 22.7614C31.5995 22.4266 32.1829 22.2592 32.8424 22.2592C33.502 22.2592 34.0837 22.4266 34.5874 22.7614C35.0912 23.0961 35.4856 23.5601 35.7707 24.1534C36.059 24.7467 36.2032 25.4344 36.2032 26.2166C36.2032 26.9922 36.0607 27.6766 35.7757 28.2699C35.4906 28.8598 35.0945 29.3222 34.5874 29.657C34.0837 29.9917 33.502 30.1591 32.8424 30.1591ZM32.8424 29.3487C33.3727 29.3487 33.8218 29.2062 34.1897 28.9212C34.5576 28.6361 34.836 28.2566 35.0249 27.7827C35.2172 27.3087 35.3133 26.7867 35.3133 26.2166C35.3133 25.6465 35.2172 25.1229 35.0249 24.6456C34.836 24.1683 34.5576 23.7855 34.1897 23.4972C33.8218 23.2088 33.3727 23.0646 32.8424 23.0646C32.3154 23.0646 31.8663 23.2088 31.4951 23.4972C31.1272 23.7855 30.8472 24.1683 30.6549 24.6456C30.466 25.1229 30.3715 25.6465 30.3715 26.2166C30.3715 26.7867 30.466 27.3087 30.6549 27.7827C30.8472 28.2566 31.1272 28.6361 31.4951 28.9212C31.863 29.2062 32.3121 29.3487 32.8424 29.3487ZM42.2673 19.8182H43.3412L47.0351 28.6875H47.1246L50.8184 19.8182H51.8923V30H51.0173V21.782H50.9378L47.5024 30H46.6572L43.2219 21.782H43.1423V30H42.2673V19.8182ZM56.5482 30.174C56.0875 30.174 55.6666 30.0845 55.2854 29.9055C54.9043 29.7232 54.601 29.4614 54.3756 29.12C54.1502 28.7753 54.0376 28.3577 54.0376 27.8672C54.0376 27.4893 54.1088 27.1712 54.2513 26.9126C54.3939 26.6541 54.596 26.442 54.8579 26.2763C55.1197 26.1106 55.4296 25.9796 55.7876 25.8835C56.1455 25.7874 56.5399 25.7128 56.9708 25.6598C57.3983 25.6068 57.7596 25.5604 58.0546 25.5206C58.3529 25.4808 58.5799 25.4179 58.7357 25.3317C58.8915 25.2455 58.9694 25.1063 58.9694 24.9141V24.7351C58.9694 24.2147 58.8136 23.8054 58.502 23.5071C58.1938 23.2055 57.7497 23.0547 57.1697 23.0547C56.6195 23.0547 56.1704 23.1757 55.8224 23.4176C55.4777 23.6596 55.2357 23.9446 55.0965 24.2727L54.2563 23.9695C54.4287 23.5518 54.6673 23.2187 54.9722 22.9702C55.2771 22.7183 55.6185 22.5376 55.9964 22.4283C56.3742 22.3156 56.757 22.2592 57.1448 22.2592C57.4365 22.2592 57.7397 22.2973 58.0546 22.3736C58.3728 22.4498 58.6678 22.5824 58.9395 22.7713C59.2113 22.9569 59.4317 23.2171 59.6008 23.5518C59.7698 23.8833 59.8543 24.3042 59.8543 24.8146V30H58.9694V28.7919H58.9147C58.8086 29.0173 58.6512 29.236 58.4424 29.4482C58.2336 29.6603 57.9717 29.8343 57.6569 29.9702C57.342 30.1061 56.9724 30.174 56.5482 30.174ZM56.6675 29.3636C57.1382 29.3636 57.5458 29.2592 57.8905 29.0504C58.2352 28.8416 58.5004 28.5649 58.686 28.2202C58.8749 27.8722 58.9694 27.4893 58.9694 27.0717V25.968C58.9031 26.031 58.7921 26.0874 58.6363 26.1371C58.4838 26.1868 58.3065 26.2315 58.1043 26.2713C57.9055 26.3078 57.7066 26.3393 57.5077 26.3658C57.3089 26.3923 57.1299 26.4155 56.9708 26.4354C56.5399 26.4884 56.172 26.5713 55.8671 26.6839C55.5622 26.7966 55.3285 26.9524 55.1661 27.1513C55.0037 27.3468 54.9225 27.5987 54.9225 27.907C54.9225 28.371 55.0882 28.7306 55.4197 28.9858C55.7511 29.2377 56.1671 29.3636 56.6675 29.3636ZM65.2162 22.3636V23.1342H61.572V22.3636H65.2162ZM62.7105 20.5341H63.6004V28.0064C63.6004 28.3246 63.6551 28.5748 63.7645 28.7571C63.8738 28.9361 64.0164 29.0637 64.192 29.1399C64.3677 29.2128 64.555 29.2493 64.7538 29.2493C64.8698 29.2493 64.9693 29.2427 65.0521 29.2294C65.135 29.2128 65.2079 29.1963 65.2709 29.1797L65.4598 29.9801C65.3736 30.0133 65.2675 30.0431 65.1416 30.0696C65.0157 30.0994 64.8599 30.1143 64.6743 30.1143C64.3495 30.1143 64.0363 30.0431 63.7346 29.9006C63.4363 29.758 63.1911 29.5459 62.9988 29.2642C62.8066 28.9825 62.7105 28.6328 62.7105 28.2152V20.5341ZM70.1269 30.1591C69.4441 30.1591 68.8492 29.9884 68.3421 29.647C67.8383 29.3056 67.4472 28.8383 67.1688 28.245C66.8904 27.6518 66.7512 26.9756 66.7512 26.2166C66.7512 25.451 66.892 24.7699 67.1737 24.1733C67.4588 23.5767 67.8532 23.1094 68.357 22.7713C68.8608 22.4299 69.4458 22.2592 70.1119 22.2592C70.6224 22.2592 71.0847 22.3587 71.499 22.5575C71.9133 22.7531 72.2547 23.0298 72.5232 23.3878C72.795 23.7424 72.9656 24.1567 73.0352 24.6307H72.1404C72.0476 24.1998 71.8238 23.8319 71.4692 23.527C71.1179 23.2187 70.6704 23.0646 70.1269 23.0646C69.6396 23.0646 69.2088 23.1972 68.8343 23.4624C68.4597 23.7242 68.1664 24.0904 67.9543 24.5611C67.7455 25.0284 67.6411 25.5703 67.6411 26.1868C67.6411 26.8066 67.7438 27.3551 67.9493 27.8324C68.1548 28.3063 68.4432 28.6776 68.8144 28.946C69.1889 29.2145 69.6264 29.3487 70.1269 29.3487C70.4649 29.3487 70.7732 29.2857 71.0516 29.1598C71.3333 29.0305 71.5686 28.8482 71.7575 28.6129C71.9498 28.3776 72.079 28.0975 72.1453 27.7727H73.0402C72.9739 28.2334 72.8099 28.6444 72.548 29.0057C72.2895 29.3636 71.9531 29.6454 71.5388 29.8509C71.1278 30.0563 70.6572 30.1591 70.1269 30.1591ZM75.8218 25.2273V30H74.9369V19.8182H75.8218V23.5618H75.9014C76.0803 23.1674 76.3571 22.8525 76.7316 22.6172C77.1095 22.3819 77.5867 22.2642 78.1634 22.2642C78.6805 22.2642 79.1346 22.3703 79.5257 22.5824C79.9168 22.7945 80.2217 23.1077 80.4404 23.522C80.6592 23.9363 80.7686 24.4467 80.7686 25.0533V30H79.8786V25.108C79.8786 24.4782 79.703 23.9827 79.3517 23.6214C79.0036 23.2569 78.533 23.0746 77.9397 23.0746C77.532 23.0746 77.1691 23.1607 76.8509 23.3331C76.5328 23.5054 76.2809 23.754 76.0953 24.0788C75.913 24.4003 75.8218 24.7831 75.8218 25.2273Z"
                  fill="white"
                />
                <path
                  d="M245.844 19.8182H246.918L250.612 28.6875H250.702L254.396 19.8182H255.469V30H254.594V21.782H254.515L251.08 30H250.234L246.799 21.782H246.719V30H245.844V19.8182ZM260.125 30.174C259.665 30.174 259.244 30.0845 258.863 29.9055C258.481 29.7232 258.178 29.4614 257.953 29.12C257.727 28.7753 257.615 28.3577 257.615 27.8672C257.615 27.4893 257.686 27.1712 257.828 26.9126C257.971 26.6541 258.173 26.442 258.435 26.2763C258.697 26.1106 259.007 25.9796 259.365 25.8835C259.723 25.7874 260.117 25.7128 260.548 25.6598C260.975 25.6068 261.337 25.5604 261.632 25.5206C261.93 25.4808 262.157 25.4179 262.313 25.3317C262.469 25.2455 262.547 25.1063 262.547 24.9141V24.7351C262.547 24.2147 262.391 23.8054 262.079 23.5071C261.771 23.2055 261.327 23.0547 260.747 23.0547C260.197 23.0547 259.748 23.1757 259.4 23.4176C259.055 23.6596 258.813 23.9446 258.674 24.2727L257.833 23.9695C258.006 23.5518 258.244 23.2187 258.549 22.9702C258.854 22.7183 259.196 22.5376 259.574 22.4283C259.951 22.3156 260.334 22.2592 260.722 22.2592C261.014 22.2592 261.317 22.2973 261.632 22.3736C261.95 22.4498 262.245 22.5824 262.517 22.7713C262.788 22.9569 263.009 23.2171 263.178 23.5518C263.347 23.8833 263.431 24.3042 263.431 24.8146V30H262.547V28.7919H262.492C262.386 29.0173 262.228 29.236 262.02 29.4482C261.811 29.6603 261.549 29.8343 261.234 29.9702C260.919 30.1061 260.55 30.174 260.125 30.174ZM260.245 29.3636C260.715 29.3636 261.123 29.2592 261.468 29.0504C261.812 28.8416 262.078 28.5649 262.263 28.2202C262.452 27.8722 262.547 27.4893 262.547 27.0717V25.968C262.48 26.031 262.369 26.0874 262.213 26.1371C262.061 26.1868 261.884 26.2315 261.681 26.2713C261.483 26.3078 261.284 26.3393 261.085 26.3658C260.886 26.3923 260.707 26.4155 260.548 26.4354C260.117 26.4884 259.749 26.5713 259.444 26.6839C259.139 26.7966 258.906 26.9524 258.743 27.1513C258.581 27.3468 258.5 27.5987 258.5 27.907C258.5 28.371 258.665 28.7306 258.997 28.9858C259.328 29.2377 259.744 29.3636 260.245 29.3636ZM268.793 22.3636V23.1342H265.149V22.3636H268.793ZM266.288 20.5341H267.178V28.0064C267.178 28.3246 267.232 28.5748 267.342 28.7571C267.451 28.9361 267.594 29.0637 267.769 29.1399C267.945 29.2128 268.132 29.2493 268.331 29.2493C268.447 29.2493 268.546 29.2427 268.629 29.2294C268.712 29.2128 268.785 29.1963 268.848 29.1797L269.037 29.9801C268.951 30.0133 268.845 30.0431 268.719 30.0696C268.593 30.0994 268.437 30.1143 268.251 30.1143C267.927 30.1143 267.613 30.0431 267.312 29.9006C267.013 29.758 266.768 29.5459 266.576 29.2642C266.384 28.9825 266.288 28.6328 266.288 28.2152V20.5341ZM273.704 30.1591C273.021 30.1591 272.426 29.9884 271.919 29.647C271.415 29.3056 271.024 28.8383 270.746 28.245C270.468 27.6518 270.328 26.9756 270.328 26.2166C270.328 25.451 270.469 24.7699 270.751 24.1733C271.036 23.5767 271.43 23.1094 271.934 22.7713C272.438 22.4299 273.023 22.2592 273.689 22.2592C274.2 22.2592 274.662 22.3587 275.076 22.5575C275.49 22.7531 275.832 23.0298 276.1 23.3878C276.372 23.7424 276.543 24.1567 276.612 24.6307H275.718C275.625 24.1998 275.401 23.8319 275.046 23.527C274.695 23.2187 274.248 23.0646 273.704 23.0646C273.217 23.0646 272.786 23.1972 272.411 23.4624C272.037 23.7242 271.744 24.0904 271.531 24.5611C271.323 25.0284 271.218 25.5703 271.218 26.1868C271.218 26.8066 271.321 27.3551 271.526 27.8324C271.732 28.3063 272.02 28.6776 272.392 28.946C272.766 29.2145 273.204 29.3487 273.704 29.3487C274.042 29.3487 274.35 29.2857 274.629 29.1598C274.91 29.0305 275.146 28.8482 275.335 28.6129C275.527 28.3776 275.656 28.0975 275.722 27.7727H276.617C276.551 28.2334 276.387 28.6444 276.125 29.0057C275.867 29.3636 275.53 29.6454 275.116 29.8509C274.705 30.0563 274.234 30.1591 273.704 30.1591ZM279.399 25.2273V30H278.514V19.8182H279.399V23.5618H279.479C279.657 23.1674 279.934 22.8525 280.309 22.6172C280.687 22.3819 281.164 22.2642 281.741 22.2642C282.258 22.2642 282.712 22.3703 283.103 22.5824C283.494 22.7945 283.799 23.1077 284.018 23.522C284.236 23.9363 284.346 24.4467 284.346 25.0533V30H283.456V25.108C283.456 24.4782 283.28 23.9827 282.929 23.6214C282.581 23.2569 282.11 23.0746 281.517 23.0746C281.109 23.0746 280.746 23.1607 280.428 23.3331C280.11 23.5054 279.858 23.754 279.672 24.0788C279.49 24.4003 279.399 24.7831 279.399 25.2273Z"
                  fill="white"
                />
                <path
                  d="M148.842 23H147.908C147.838 22.652 147.712 22.3305 147.53 22.0355C147.351 21.7372 147.125 21.477 146.854 21.255C146.582 21.0329 146.274 20.8606 145.929 20.7379C145.584 20.6153 145.211 20.554 144.81 20.554C144.167 20.554 143.581 20.7214 143.05 21.0561C142.523 21.3909 142.101 21.883 141.783 22.5327C141.468 23.179 141.31 23.9711 141.31 24.9091C141.31 25.8537 141.468 26.6491 141.783 27.2955C142.101 27.9418 142.523 28.4323 143.05 28.767C143.581 29.0985 144.167 29.2642 144.81 29.2642C145.211 29.2642 145.584 29.2029 145.929 29.0803C146.274 28.9576 146.582 28.7869 146.854 28.5682C147.125 28.3461 147.351 28.0859 147.53 27.7876C147.712 27.4893 147.838 27.1662 147.908 26.8182H148.842C148.759 27.2855 148.604 27.7214 148.375 28.1257C148.15 28.5268 147.861 28.8781 147.51 29.1797C147.162 29.4813 146.761 29.7166 146.307 29.8857C145.853 30.0547 145.354 30.1392 144.81 30.1392C143.955 30.1392 143.196 29.9254 142.533 29.4979C141.871 29.067 141.35 28.4605 140.972 27.6783C140.598 26.8961 140.411 25.973 140.411 24.9091C140.411 23.8452 140.598 22.9221 140.972 22.1399C141.35 21.3577 141.871 20.7528 142.533 20.3253C143.196 19.8944 143.955 19.679 144.81 19.679C145.354 19.679 145.853 19.7635 146.307 19.9325C146.761 20.0982 147.162 20.3336 147.51 20.6385C147.861 20.9401 148.15 21.2914 148.375 21.6925C148.604 22.0935 148.759 22.5294 148.842 23ZM151.727 19.8182V30H150.842V19.8182H151.727ZM157.037 30.1591C156.377 30.1591 155.794 29.9917 155.287 29.657C154.783 29.3222 154.389 28.8598 154.104 28.2699C153.818 27.6766 153.676 26.9922 153.676 26.2166C153.676 25.4344 153.818 24.7467 154.104 24.1534C154.389 23.5568 154.783 23.0928 155.287 22.7614C155.794 22.4266 156.377 22.2592 157.037 22.2592C157.696 22.2592 158.278 22.4266 158.782 22.7614C159.286 23.0961 159.68 23.5601 159.965 24.1534C160.253 24.7467 160.398 25.4344 160.398 26.2166C160.398 26.9922 160.255 27.6766 159.97 28.2699C159.685 28.8598 159.289 29.3222 158.782 29.657C158.278 29.9917 157.696 30.1591 157.037 30.1591ZM157.037 29.3487C157.567 29.3487 158.016 29.2062 158.384 28.9212C158.752 28.6361 159.03 28.2566 159.219 27.7827C159.412 27.3087 159.508 26.7867 159.508 26.2166C159.508 25.6465 159.412 25.1229 159.219 24.6456C159.03 24.1683 158.752 23.7855 158.384 23.4972C158.016 23.2088 157.567 23.0646 157.037 23.0646C156.51 23.0646 156.061 23.2088 155.689 23.4972C155.322 23.7855 155.041 24.1683 154.849 24.6456C154.66 25.1229 154.566 25.6465 154.566 26.2166C154.566 26.7867 154.66 27.3087 154.849 27.7827C155.041 28.2566 155.322 28.6361 155.689 28.9212C156.057 29.2062 156.506 29.3487 157.037 29.3487ZM167.471 24.0391L166.661 24.2678C166.581 24.0391 166.468 23.8319 166.322 23.6463C166.177 23.4607 165.986 23.3132 165.751 23.2038C165.519 23.0945 165.23 23.0398 164.886 23.0398C164.369 23.0398 163.944 23.1624 163.613 23.4077C163.281 23.6529 163.116 23.9695 163.116 24.3572C163.116 24.6854 163.228 24.9522 163.454 25.1577C163.683 25.3598 164.034 25.5206 164.508 25.6399L165.661 25.9233C166.301 26.0791 166.78 26.326 167.098 26.6641C167.42 27.0021 167.58 27.4264 167.58 27.9368C167.58 28.3677 167.461 28.7505 167.222 29.0852C166.984 29.42 166.651 29.6835 166.223 29.8757C165.799 30.0646 165.307 30.1591 164.746 30.1591C164.001 30.1591 163.386 29.9917 162.902 29.657C162.418 29.3189 162.108 28.8317 161.972 28.1953L162.822 27.9865C162.932 28.4406 163.146 28.7836 163.464 29.0156C163.785 29.2476 164.208 29.3636 164.732 29.3636C165.318 29.3636 165.787 29.2327 166.138 28.9709C166.49 28.7057 166.665 28.3743 166.665 27.9766C166.665 27.6683 166.563 27.4098 166.357 27.201C166.152 26.9889 165.84 26.8331 165.423 26.7337L164.175 26.4354C163.512 26.2763 163.021 26.0244 162.703 25.6797C162.385 25.335 162.226 24.9074 162.226 24.397C162.226 23.9761 162.34 23.6065 162.569 23.2884C162.798 22.9669 163.112 22.715 163.513 22.5327C163.915 22.3504 164.372 22.2592 164.886 22.2592C165.585 22.2592 166.143 22.4183 166.561 22.7365C166.982 23.0514 167.285 23.4856 167.471 24.0391ZM172.605 30.1591C171.893 30.1591 171.276 29.9934 170.756 29.6619C170.235 29.3272 169.833 28.8648 169.548 28.2749C169.266 27.6816 169.125 26.9988 169.125 26.2266C169.125 25.4576 169.266 24.7749 169.548 24.1783C169.833 23.5784 170.226 23.1094 170.726 22.7713C171.23 22.4299 171.811 22.2592 172.471 22.2592C172.885 22.2592 173.285 22.3355 173.669 22.4879C174.054 22.6371 174.398 22.8674 174.703 23.179C175.012 23.4872 175.255 23.8767 175.434 24.3473C175.613 24.8146 175.703 25.3681 175.703 26.0078V26.4453H169.737V25.6648H174.798C174.798 25.1742 174.698 24.7334 174.499 24.3423C174.304 23.9479 174.03 23.6364 173.679 23.4077C173.331 23.179 172.928 23.0646 172.471 23.0646C171.987 23.0646 171.561 23.1939 171.193 23.4524C170.825 23.7109 170.537 24.0523 170.328 24.4766C170.123 24.9008 170.018 25.3648 170.015 25.8686V26.3359C170.015 26.9425 170.119 27.4728 170.328 27.9268C170.54 28.3776 170.84 28.7273 171.228 28.9759C171.616 29.2244 172.075 29.3487 172.605 29.3487C172.967 29.3487 173.283 29.2924 173.555 29.1797C173.83 29.067 174.06 28.9162 174.246 28.7273C174.435 28.535 174.577 28.3246 174.673 28.0959L175.514 28.3693C175.398 28.6908 175.207 28.9875 174.942 29.2592C174.68 29.531 174.352 29.7498 173.958 29.9155C173.566 30.0779 173.116 30.1591 172.605 30.1591Z"
                  fill="#3A3A3A"
                />
              </svg>
            {/if}
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

                <div class="create-game-text">
                  <p>2.</p>
                  <h3>Leave a note for your friend.</h3>
                </div>

                <input
                  class="create-form"
                  placeholder="Write a hint or message here..."
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
      <Footer />
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
    color: #b5b5b5;
    text-align: center;
    font-size: 18px;
    font-style: normal;
    font-weight: 300;
    line-height: normal;
    margin-top: 7.5px;
    margin-bottom: 7.5px;
  }

  .splash-screen button:hover {
    transform: scale(1.075) perspective(1px);
  }

  .module {
    display: flex;
    justify-content: center;
    flex-direction: column;
    width: 100%;
    align-items: center;
    margin-bottom: 50px;
  }

  .module a {
    text-decoration: none;
  }

  .module:hover {
    cursor: pointer;
  }

  .module-list-header {
    color: #fff;
    font-size: 21px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    display: flex;
    flex-direction: flex-start;
  }

  .module-image {
    border-radius: 5px 5px 0px 0px;
    width: 329px;
    height: 153px;
    margin-bottom: 0px;
    padding-bottom: 0px;
    background: radial-gradient(
      97% 100% at 100% 50%,
      #f9e3b0 13.03%,
      #ffbaab 41.67%,
      #b4baec 87.06%
    );
  }

  .module-description {
    width: 329px;
    height: 60px;
    border-radius: 0px 0px 5px 5px;
    background: #2f2f2f;
    margin-top: 0px;
    padding-top: 0px;
    display: flex;
    justify-content: flex-start; /* Horizontal alignment to the left */
    align-items: center;
  }

  .module-description p {
    color: #fff;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    display: flex;
    text-align: left;
    flex-direction: start;
    align-items: center;
    padding-right: 5%;
    margin-left: 10px;
  }

  .container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
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
    margin-top: 35px;
  }

  .learn-btn {
    border: 0.75px solid #fff;
    background: rgba(131, 112, 222, 0);
    margin-bottom: 100px;
    margin-top: 10px;
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

  .guess-btn {
    margin-right: 10px;
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

  .in-game-text {
    width: 320px;
    margin: 0 auto; /* Center horizontally */
    text-align: center; /* Center text */
    margin-top: 25px;
  }

  .in-game-svg {
    margin-top: 25px;
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

  .ad-space {
    height: 100px;
  }

  .create-game-text {
    display: flex;
    flex-direction: flex-start;
  }

  .create-game-text h3 {
    color: #fff;
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    display: flex;
  }

  .create-game-text p {
    color: #888;
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    margin-right: 10px;
  }

  @media only screen and (max-width: 600px) {
    .ezoic-108 {
      height: 52.5px;
    }
  }
</style>
