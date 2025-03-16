<script>
  import Icon from "./Icon.svelte";

  const africa = [
    "DZ", "AO", "BW", "BI", "CM", "CV", "CF", "TD", "KM", "YT", "CG", "CD", "BJ", 
    "GQ", "ET", "ER", "DJ", "GA", "GM", "GH", "GN", "CI", "KE", "LS", "LR", "LY", 
    "MG", "MW", "ML", "MR", "MU", "MA", "MZ", "NA", "NE", "NG", "GW", "RE", "RW", 
    "SH", "ST", "SN", "SC", "SL", "SO", "ZA", "ZW", "SS", "EH", "SD", "SZ", "TG", 
    "TN", "UG", "EG", "TZ", "BF", "ZM"
  ];

  const asia = [
    "AF", "AZ", "BH", "BD", "AM", "BT", "IO", "BN", "MM", "KH", "LK", "CN", "TW", 
    "CX", "CC", "CY", "GE", "PS", "HK", "IN", "ID", "IR", "IQ", "IL", "JP", "KZ", 
    "JO", "KP", "KR", "KW", "KG", "LA", "LB", "MO", "MY", "MV", "MN", "OM", "NP", 
    "PK", "PH", "TL", "QA", "RU", "SA", "SG", "VN", "SY", "TJ", "TH", "AE", "TR", 
    "TM", "UZ", "YE", "XE", "XD", "XS"
  ];

  const europe = [
    "AL", "AD", "AZ", "AT", "AM", "BE", "BA", "BG", "BY", "HR", "CY", "CZ", "DK", 
    "EE", "FO", "FI", "AX", "FR", "GE", "DE", "GI", "GR", "VA", "HU", "IS", "IE", 
    "IT", "KZ", "LV", "LI", "LT", "LU", "MT", "MC", "MD", "ME", "NL", "NO", "PL", 
    "PT", "RO", "RU", "SM", "RS", "SK", "SI", "ES", "SJ", "SE", "CH", "TR", "UA", 
    "MK", "GB", "GB-ENG", "UK", "GG", "JE", "IM"
  ];

  const north_america = [
    "AG", "BS", "BB", "BM", "BZ", "VG", "CA", "KY", "CR", "CU", "DM", "DO", "SV", 
    "GL", "GD", "GP", "GT", "HT", "HN", "JM", "MQ", "MX", "MS", "AN", "CW", "AW", 
    "SX", "BQ", "NI", "UM", "PA", "PR", "BL", "KN", "AI", "LC", "MF", "PM", "VC", 
    "TT", "TC", "US", "VI"
  ];

  const oceania = [
    "AS", "AU", "SB", "CK", "FJ", "PF", "KI", "GU", "NR", "NC", "VU", "NZ", "NU", 
    "NF", "MP", "UM", "FM", "MH", "PW", "PG", "PN", "TK", "TO", "TV", "WF", "WS", 
    "XX"
  ];

  const south_america = [
    "AR", "BO", "BR", "CL", "CO", "EC", "FK", "GF", "GY", "PY", "PE", "SR", "UY", "VE"
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

<div class="guess-wrapper">
  <div class="header-row">
    <img src={artist.image_uri} alt={artist.name} />
    <h2 class={artist.name.length > 15 ? "header-name-small" : ""}>
      {artist.name}
    </h2>
  </div>
  
  <div class="row">
    <div
      class="item large {Math.abs(artist.debut_album_year - mysteryArtist.debut_album_year) < 6 ? 'close' : ''} 
            {artist.debut_album_year == mysteryArtist.debut_album_year ? 'correct' : ''}"
    >
      <h3>Debut</h3>
      <div class="flex-container">
        {#if artist.debut_album_year == mysteryArtist.debut_album_year}
          <h2 class="arrowless">{artist.debut_album_year}</h2>
        {:else}
          <h2>{artist.debut_album_year}</h2>
        {/if}
        {#if artist.debut_album_year > mysteryArtist.debut_album_year}
          <div class="arrow-icon">
            <Icon width={"1.25rem"} height={"1.25rem"} name={"key_down"}></Icon>
          </div>
        {/if}
        {#if artist.debut_album_year < mysteryArtist.debut_album_year}
          <div class="arrow-icon">
            <Icon width={"1.25rem"} height={"1.25rem"} name={"key_up"}></Icon>
          </div>
        {/if}
      </div>
    </div>
    
    <div
      class="item small {artist.group_size == mysteryArtist.group_size ? 'correct' : ''}"
    >
      <h3>Members</h3>
      <h2>{artist.group_size == 1 ? "Solo" : artist.group_size}</h2>
    </div>
    
    <div
      class="item large {Math.abs(artist.listener_rank - mysteryArtist.listener_rank) < 51 ? 'close' : ''} 
            {artist.listener_rank == mysteryArtist.listener_rank ? 'correct' : ''}"
    >
      <h3>Popularity</h3>
      <div class="flex-container">
        {#if artist.listener_rank == mysteryArtist.listener_rank}
          <h2 class="arrowless">#{artist.listener_rank + 1}</h2>
        {:else}
          <h2>#{artist.listener_rank + 1}</h2>
        {/if}
        {#if artist.listener_rank > mysteryArtist.listener_rank}
          <div class="arrow-icon">
            <Icon width={"1.25rem"} height={"1.25rem"} name={"key_up"}></Icon>
          </div>
        {/if}
        {#if artist.listener_rank < mysteryArtist.listener_rank}
          <div class="arrow-icon">
            <Icon width={"1.25rem"} height={"1.25rem"} name={"key_down"}></Icon>
          </div>
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
      class="item small {getContinent(artist.country) == getContinent(mysteryArtist.country) ? 'close' : ''} 
            {artist.country == mysteryArtist.country ? 'correct' : ''}"
    >
      <img
        class="flag-img"
        src="https://flagcdn.com/w80/{artist.country}.png"
        alt="{artist.country} Flag"
      />
      <h3 class="nationality">{getRegion(artist.country)}</h3>
    </div>
  </div>
</div>

<style>
  .guess-wrapper {
    width: 98%;
    max-width: 340px;
    margin: 0 auto 16px;
  }

  .row {
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 8px;
  }

  .item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #454545;
    border-radius: 10px;
    padding: 8px 6px;
    box-sizing: border-box;
    height: 73px;
    margin: 1px 5px;
    text-align: center;
  }

  .item:first-child {
    margin-left: 0;
  }

  .item:last-child {
    margin-right: 0;
  }

  .large {
    flex: 1.4;
    min-width: 110px;
  }

  .small {
    flex: 1.1;
    min-width: 80px;
  }

  .item h3, .item h2 {
    color: white;
    margin: 0;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  h3 {
    font-size: 15.2px;
    font-weight: 500;
    font-style: normal;
    margin-bottom: 4px;
  }

  h2 {
    font-size: 21px;
    font-weight: 700;
  }

  .header-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    margin-bottom: 12px;
    margin-top: 16px;
  }

  .header-row img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 16px;
  }

  .header-row h2 {
    font-size: 24px;
    font-weight: 700;
    color: #fff;
  }



  .flag-img {
    width: 60px;
    height: 36px;
    object-fit: contain;
    margin-bottom: 4px;
  }

  .nationality {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 90%;
  }

  .flex-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    width: 100%;
    margin-left: 7.5px;
  }
  .arrow-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    margin-left: -5px;
  }

  .arrowless {
    margin-right: 7.5px !important;
  }

  /* Animation styles */
  .close {
    animation: flip-close 1.65s ease-in-out forwards;
  }

  .correct {
    animation: flip-correct 1.65s ease-in-out forwards;
  }

  @keyframes flip-correct {
    0% {}
    60% {
      transform: rotateY(0deg);
      background-color: #454545;
    }
    80% {
      transform: rotateY(180deg);
      background-color: #454545;
    }
    100% {
      transform: rotateY(0deg);
      background-color: #43a865; /* Green */
    }
  }

  @keyframes flip-close {
    0% {}
    60% {
      transform: rotateY(0deg);
      background-color: #454545;
    }
    80% {
      transform: rotateY(180deg);
      background-color: #454545;
    }
    100% {
      transform: rotateY(0deg);
      background-color: #b8b105; /* Yellow */
    }
  }
</style>