<script>
  import Icon from "./Icon.svelte";

  const africa = [
    "DZ",
    "AO",
    "BW",
    "BI",
    "CM",
    "CV",
    "CF",
    "TD",
    "KM",
    "YT",
    "CG",
    "CD",
    "BJ",
    "GQ",
    "ET",
    "ER",
    "DJ",
    "GA",
    "GM",
    "GH",
    "GN",
    "CI",
    "KE",
    "LS",
    "LR",
    "LY",
    "MG",
    "MW",
    "ML",
    "MR",
    "MU",
    "MA",
    "MZ",
    "NA",
    "NE",
    "NG",
    "GW",
    "RE",
    "RW",
    "SH",
    "ST",
    "SN",
    "SC",
    "SL",
    "SO",
    "ZA",
    "ZW",
    "SS",
    "EH",
    "SD",
    "SZ",
    "TG",
    "TN",
    "UG",
    "EG",
    "TZ",
    "BF",
    "ZM",
  ];

  const asia = [
    "AF",
    "AZ",
    "BH",
    "BD",
    "AM",
    "BT",
    "IO",
    "BN",
    "MM",
    "KH",
    "LK",
    "CN",
    "TW",
    "CX",
    "CC",
    "CY",
    "GE",
    "PS",
    "HK",
    "IN",
    "ID",
    "IR",
    "IQ",
    "IL",
    "JP",
    "KZ",
    "JO",
    "KP",
    "KR",
    "KW",
    "KG",
    "LA",
    "LB",
    "MO",
    "MY",
    "MV",
    "MN",
    "OM",
    "NP",
    "PK",
    "PH",
    "TL",
    "QA",
    "RU",
    "SA",
    "SG",
    "VN",
    "SY",
    "TJ",
    "TH",
    "AE",
    "TR",
    "TM",
    "UZ",
    "YE",
    "XE",
    "XD",
    "XS",
  ];

  const europe = [
    "AL",
    "AD",
    "AZ",
    "AT",
    "AM",
    "BE",
    "BA",
    "BG",
    "BY",
    "HR",
    "CY",
    "CZ",
    "DK",
    "EE",
    "FO",
    "FI",
    "AX",
    "FR",
    "GE",
    "DE",
    "GI",
    "GR",
    "VA",
    "HU",
    "IS",
    "IE",
    "IT",
    "KZ",
    "LV",
    "LI",
    "LT",
    "LU",
    "MT",
    "MC",
    "MD",
    "ME",
    "NL",
    "NO",
    "PL",
    "PT",
    "RO",
    "RU",
    "SM",
    "RS",
    "SK",
    "SI",
    "ES",
    "SJ",
    "SE",
    "CH",
    "TR",
    "UA",
    "MK",
    "GB",
    "GB-ENG",
    "UK",
    "GG",
    "JE",
    "IM",
  ];

  const north_america = [
    "AG",
    "BS",
    "BB",
    "BM",
    "BZ",
    "VG",
    "CA",
    "KY",
    "CR",
    "CU",
    "DM",
    "DO",
    "SV",
    "GL",
    "GD",
    "GP",
    "GT",
    "HT",
    "HN",
    "JM",
    "MQ",
    "MX",
    "MS",
    "AN",
    "CW",
    "AW",
    "SX",
    "BQ",
    "NI",
    "UM",
    "PA",
    "PR",
    "BL",
    "KN",
    "AI",
    "LC",
    "MF",
    "PM",
    "VC",
    "TT",
    "TC",
    "US",
    "VI",
  ];

  const oceania = [
    "AS",
    "AU",
    "SB",
    "CK",
    "FJ",
    "PF",
    "KI",
    "GU",
    "NR",
    "NC",
    "VU",
    "NZ",
    "NU",
    "NF",
    "MP",
    "UM",
    "FM",
    "MH",
    "PW",
    "PG",
    "PN",
    "TK",
    "TO",
    "TV",
    "WF",
    "WS",
    "XX",
  ];

  const south_america = [
    "AR",
    "BO",
    "BR",
    "CL",
    "CO",
    "EC",
    "FK",
    "GF",
    "GY",
    "PY",
    "PE",
    "SR",
    "UY",
    "VE",
  ];

  function getContinent(countryCode) {
    if (north_america.includes(countryCode.toUpperCase())) {
      return "North America";
    }
    if (europe.includes(countryCode.toUpperCase())) {
      return "Europe";
    }
    if (oceania.includes(countryCode.toUpperCase())) {
      return "Oceania";
    }
    if (south_america.includes(countryCode.toUpperCase())) {
      return "South America";
    }
    if (asia.includes(countryCode.toUpperCase())) {
      return "Asia";
    }
    if (africa.includes(countryCode.toUpperCase())) {
      return "Africa";
    }
    return "Error";
  }

  export let artist;
  export let mysteryArtist;
  let regionNames = new Intl.DisplayNames(["en"], { type: "region" });

  function getRegion(region) {
    let countryName = regionNames.of(artist.country.toUpperCase());
    if (countryName == "United States") {
      countryName = "USA";
    }
    if (countryName == "United Kingdom") {
      countryName = "UK";
    }
    if (countryName == "South Korea") {
      countryName = "S. Korea";
    }
    return countryName;
  }
</script>

<div class="header-row">
  <img src={artist.image_uri} alt={artist.name} />
  <h2>{artist.name}</h2>
</div>
<div class="row">
  <div
    class="item large {Math.abs(
      artist.debut_album_year - mysteryArtist.debut_album_year
    ) < 6
      ? 'close'
      : ''} {artist.debut_album_year == mysteryArtist.debut_album_year
      ? 'correct'
      : ''}"
  >
    <h3>Debut</h3>
    <div class="flex-container">
      <h2>{artist.debut_album_year}</h2>
      {#if artist.debut_album_year > mysteryArtist.debut_album_year}
        <Icon width={"1.5rem"} height={"1.5rem"} name={"key_down"}></Icon>
      {/if}
      {#if artist.debut_album_year < mysteryArtist.debut_album_year}
        <Icon width={"1.5rem"} height={"1.5rem"} name={"key_up"}></Icon>
      {/if}
    </div>
  </div>
  <div
    class="item small {artist.group_size == mysteryArtist.group_size
      ? 'correct'
      : ''}"
  >
    <h3>Members</h3>
    <h2>{artist.group_size == 1 ? "Solo" : artist.group_size}</h2>
  </div>
  <div
    class="item large {Math.abs(
      artist.listener_rank - mysteryArtist.listener_rank
    ) < 51
      ? 'close'
      : ''} {artist.listener_rank == mysteryArtist.listener_rank
      ? 'correct'
      : ''}"
  >
    <h3>Popularity</h3>
    <div class="flex-container">
      <h2>#{artist.listener_rank + 1}</h2>
      {#if artist.listener_rank > mysteryArtist.listener_rank}
        <Icon width={"1.5rem"} height={"1.5rem"} name={"key_up"}></Icon>
      {/if}
      {#if artist.listener_rank < mysteryArtist.listener_rank}
        <Icon width={"1.5rem"} height={"1.5rem"} name={"key_down"}></Icon>
      {/if}
    </div>
  </div>
</div>
<div class="row">
  <div
    class="item small {artist.gender == mysteryArtist.gender ? 'correct' : ''}"
  >
    <h3>Gender</h3>
    <h2>{artist.gender}</h2>
  </div>
  <div
    class="item large {artist.genre == mysteryArtist.genre ? 'correct' : ''}"
  >
    <h3>Genre</h3>
    <h2>{artist.genre}</h2>
  </div>
  <div
    class="item small {getContinent(artist.country) ==
    getContinent(mysteryArtist.country)
      ? 'close'
      : ''} {artist.country == mysteryArtist.country ? 'correct' : ''}"
  >
    <img
      class="flag-img"
      width="80px"
      src="https://flagcdn.com/w80/{artist.country}.png"
      alt="{artist.country} Flag"
    />
    <h3 class="nationality">{getRegion(artist.country)}</h3>
  </div>
</div>

<style>
  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 100%;
    flex: 1;
  }

  .item {
    flex: 1;
    text-align: center;
    padding: 20px;
    background-color: #454545; /* Grey background */
    border-radius: 10px;
    height: 75px;
    padding: 2.5px 2.5px 2.5px 2.5px;
    margin: 5px 5px 5px 5px;
    font-size: 90%;
    justify-content: center;
    align-items: center;
    display: flex;
    flex-direction: column;
    /* transition: background-color 0s ease; */
  }

  .item h3,
  .item h2 {
    color: white; /* White text color */
    margin: 0;
    max-width: 90%;
  }

  h3 {
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
  }

  h2 {
    font-size: 20px;
    font-style: normal;
    font-weight: 700;
  }

  .large {
    flex: 1.2; /* Larger width for large items */
  }

  .small {
    flex: 0.8; /* Smaller width for small items */
  }

  .small img {
    width: 68px;
    height: 40px;
  }

  /* .item {
    margin-top: 0.1rem;
    width: 80%;
    max-height: 80%;
    margin-bottom: 5px;
    max-width: 100%;
  } */

  .header-row {
    display: flex;
    flex-direction: row; /* Change to row */
    align-items: center; /* Vertically center items */
    color: #fff;
    margin-bottom: 5px;
    margin-top: 30px;
  }
  .header-row img {
    margin-right: 0.8rem;
    border-radius: 50%;
    object-fit: cover;
    width: 80px;
    height: 80px;
  }

  .close {
    animation: flip-close 2s ease-in-out forwards;
  }

  .flex-container {
    display: flex;
    align-items: center; /* Vertically center items */
    justify-content: center; /* Horizontally center items */
  }

  .flex-container h2 {
    margin-left: 15px;
  }

  .correct .flex-container h2 {
    margin-left: -45px !important;
  }

  .correct {
    animation: flip-correct 2s ease-in-out forwards;
  }

  .nationality {
    white-space: nowrap;
    overflow: hidden;
  }

  @keyframes flip-correct {
    0% {
    }
    50% {
      transform: rotateY(0deg);
      background-color: #454545;
    }
    70% {
      transform: rotateY(180deg);
      background-color: #454545; /* Change to the original background color */
    }
    100% {
      transform: rotateY(360deg);
      background-color: #00b011; /* Change to the green background color */
    }
  }

  @keyframes flip-close {
    0% {
    }
    50% {
      transform: rotateY(0deg);
      background-color: #454545;
    }
    70% {
      transform: rotateY(180deg);
      background-color: #454545; /* Change to the original background color */
    }
    100% {
      transform: rotateY(360deg);
      background-color: rgba(
        255,
        245,
        0,
        0.7
      ); /* Change to the green background color */
    }
  }
</style>
