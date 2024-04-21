<script>
  import Guess from "./Guess.svelte";
  import "./styles.css";
  import artistList from "$lib/artists.json";
  import mysteryArtistList from "$lib/mysteryArtists.json";

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

  function getEasternTimeDate() {
    const date = new Date();
    const easternTimeOffset = -4; // Eastern Time is UTC-4 during standard time
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    const easternTime = new Date(utc + 3600000 * easternTimeOffset);
    return easternTime.toLocaleDateString("en-US", {
      timeZone: "America/New_York",
    });
  }

  let timeUntilMidnightET = 0;
  let timer = null;

  function updateTimer() {
    const now = new Date();
    const midnightET = new Date(now);
    midnightET.setUTCHours(4, 0, 0, 0); // 4 AM UTC = Midnight ET

    if (now > midnightET) {
      midnightET.setDate(midnightET.getDate() + 1); // Increment to next day
    }

    timeUntilMidnightET = midnightET - now;
  }

  function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  function startTimer() {
    timer = setInterval(updateTimer, 1000);
  }

  startTimer();

  const todaysDate = getEasternTimeDate();
  const mysteryArtistEntry = mysteryArtistList.find(
    (entry) => entry.date === todaysDate
  );
  const mysteryArtist = artists.find(
    (artist) => artist.name === mysteryArtistEntry.artist
  );

  const artistNames = artistList.map((artist) => artist.artist);
  let normalGame = false;
  let splashScreen = true;
  let searchTerm = "";
  let guesses = [];

  function fuzzySearch(input) {
    if (input == "") {
      return [];
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
    splashScreen = false;
  }

  function createSpotle() {
    // Code for creating Spotle
    // You can add functionality for creating Spotle here
  }

  function handleSearch(artistName) {
    searchTerm = "";

    if (artistName === null) {
      return;
    }

    const selectedArtist = artists.find((artist) => artist.name === artistName);
    guesses.push(selectedArtist);
    guesses = guesses;
  }

  function checkGuess(guess) {}
</script>

<body>
  {#if splashScreen}
    <div class="splash-screen">
      <button class="styled-btn" on:click={playGame}>PLAY</button>
    </div>
  {/if}

  {#if normalGame}
    <div class="game-container">
      <div class="guesses-remaining">Guess 1 of 10</div>
      <div class="search-container">
        <input
          type="text"
          name="search"
          id="search"
          placeholder="Type a guess here..."
          autocomplete="off"
          bind:value={searchTerm}
          on:keydown={(e) => {
            if (e.key === "Enter") handleSearch(filteredArtists[0]);
          }}
        />
        <button
          class="guess-btn"
          on:click={() => handleSearch(filteredArtists[0])}
          ><i class="fa fa-search fa-lg"></i></button
        >
        <ul
          class="results"
          style="display: {filteredArtists.length > 0 ? 'block' : 'none'}"
        >
          {#each filteredArtists as artist}
            <li on:click={() => handleSearch(artist)}>
              {artist}
            </li>
          {/each}
        </ul>
      </div>

      <div class="guess-container">
        {#each guesses.slice().reverse() as guess}
          <Guess artist={guess} {mysteryArtist}></Guess>
        {/each}
      </div>
    </div>
  {/if}

  <!-- How To Play -->

  <!-- Create Spotle -->
  <!-- Spotle Streak -->
</body>

<style>
  .styled-btn {
    border-radius: 5px;
    width: 176px;
    height: 52px;
    background-color: #1db954;
    color: #ffff;
    font-weight: bold;
    font-size: 15px;
    position: relative;
    border-radius: 100px;
    margin-bottom: 0.2rem;
    margin-top: 0.2rem;
  }

  .guesses-remaining {
    color: #ffff;
    padding-bottom: 0.3rem;
    display: flex;
    align-items: flex-end;
    justify-content: right;
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

  .results ul {
    border-radius: 3px;
    padding: 8px 12px;
    transition: all 0.5s linear;
  }

  li {
    list-style: none;
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
  }
</style>
