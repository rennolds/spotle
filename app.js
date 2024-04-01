document.addEventListener("touchstart", function() {}, true);

const africa = [
  'DZ',
  'AO',
  'BW',
  'BI',
  'CM',
  'CV',
  'CF',
  'TD',
  'KM',
  'YT',
  'CG',
  'CD',
  'BJ',
  'GQ',
  'ET',
  'ER',
  'DJ',
  'GA',
  'GM',
  'GH',
  'GN',
  'CI',
  'KE',
  'LS',
  'LR',
  'LY',
  'MG',
  'MW',
  'ML',
  'MR',
  'MU',
  'MA',
  'MZ',
  'NA',
  'NE',
  'NG',
  'GW',
  'RE',
  'RW',
  'SH',
  'ST',
  'SN',
  'SC',
  'SL',
  'SO',
  'ZA',
  'ZW',
  'SS',
  'EH',
  'SD',
  'SZ',
  'TG',
  'TN',
  'UG',
  'EG',
  'TZ',
  'BF',
  'ZM',
]

const asia = [
  'AF',
  'AZ',
  'BH',
  'BD',
  'AM',
  'BT',
  'IO',
  'BN',
  'MM',
  'KH',
  'LK',
  'CN',
  'TW',
  'CX',
  'CC',
  'CY',
  'GE',
  'PS',
  'HK',
  'IN',
  'ID',
  'IR',
  'IQ',
  'IL',
  'JP',
  'KZ',
  'JO',
  'KP',
  'KR',
  'KW',
  'KG',
  'LA',
  'LB',
  'MO',
  'MY',
  'MV',
  'MN',
  'OM',
  'NP',
  'PK',
  'PH',
  'TL',
  'QA',
  'RU',
  'SA',
  'SG',
  'VN',
  'SY',
  'TJ',
  'TH',
  'AE',
  'TR',
  'TM',
  'UZ',
  'YE',
  'XE',
  'XD',
  'XS',
]

const europe = [
  'AL',
  'AD',
  'AZ',
  'AT',
  'AM',
  'BE',
  'BA',
  'BG',
  'BY',
  'HR',
  'CY',
  'CZ',
  'DK',
  'EE',
  'FO',
  'FI',
  'AX',
  'FR',
  'GE',
  'DE',
  'GI',
  'GR',
  'VA',
  'HU',
  'IS',
  'IE',
  'IT',
  'KZ',
  'LV',
  'LI',
  'LT',
  'LU',
  'MT',
  'MC',
  'MD',
  'ME',
  'NL',
  'NO',
  'PL',
  'PT',
  'RO',
  'RU',
  'SM',
  'RS',
  'SK',
  'SI',
  'ES',
  'SJ',
  'SE',
  'CH',
  'TR',
  'UA',
  'MK',
  'GB',
  'GB-ENG',
  'UK',
  'GG',
  'JE',
  'IM',
]

const north_america = [
  'AG',
  'BS',
  'BB',
  'BM',
  'BZ',
  'VG',
  'CA',
  'KY',
  'CR',
  'CU',
  'DM',
  'DO',
  'SV',
  'GL',
  'GD',
  'GP',
  'GT',
  'HT',
  'HN',
  'JM',
  'MQ',
  'MX',
  'MS',
  'AN',
  'CW',
  'AW',
  'SX',
  'BQ',
  'NI',
  'UM',
  'PA',
  'PR',
  'BL',
  'KN',
  'AI',
  'LC',
  'MF',
  'PM',
  'VC',
  'TT',
  'TC',
  'US',
  'VI',
]

const oceania = [
  'AS',
  'AU',
  'SB',
  'CK',
  'FJ',
  'PF',
  'KI',
  'GU',
  'NR',
  'NC',
  'VU',
  'NZ',
  'NU',
  'NF',
  'MP',
  'UM',
  'FM',
  'MH',
  'PW',
  'PG',
  'PN',
  'TK',
  'TO',
  'TV',
  'WF',
  'WS',
  'XX',
]

const south_america = [
  'AR',
  'BO',
  'BR',
  'CL',
  'CO',
  'EC',
  'FK',
  'GF',
  'GY',
  'PY',
  'PE',
  'SR',
  'UY',
  'VE',
]

class Artist {
  constructor(name,listenerRank, imageUri, genre, debutAlbumYear, gender, nationality, groupSize, songUri, songImageUri, embeddedTrack) {
      this.name = name;
      this.listenerRank = listenerRank;
      this.imageUri = imageUri;
      this.genre = genre;
      this.debutAlbumYear = debutAlbumYear;
      this.nationality = nationality;
      this.gender = gender;
      this.groupSize = groupSize;
      this.songUri = songUri;
      this.songImageUri = songImageUri;
      this.embeddedTrack = embeddedTrack;
  }
}
let guessCount = 1;
let artists = {};
const searchable = [];

await fetch('resources/artists.json').then(function (response) {
  return response.json();
}).then(function (data) {
  for (var i = 0; i < data.length; i++) {
    searchable.push(data[i].artist);
    var x;
    if (data[i].gender == "m"){
      x = 'Male';
    }
    else if (data[i].gender == "f") {
      x = 'Female';
    }
    else if (data[i].gender == "nb") {
      x = 'Nonbinary';
   }
   else {
      x = 'Mixed';
   }
    artists[data[i].artist.toLowerCase()] = new Artist(data[i].artist, i+1, data[i].image_uri, data[i].genre, data[i].debut_album_year, x, data[i].country.toLowerCase(), data[i].group_size, data[i].song_uri, data[i].song_image_uri, data[i].embedded_track);
  }
}).catch (function (error) {
  console.error(error);
});

var mysteryArtistSong;
var mysteryArtistImage;
var mysteryArtistName;
var mysteryArtist;
var spotleNumber;
var yesterdayMysteryArtist;
var yesterdayMysteryArtistImage;
let today = new Date();

today.setTime(today.getTime()+today.getTimezoneOffset()*60*1000);
var offset = -300; //Timezone offset for EST in minutes.
today = new Date(today.getTime() + offset*60*1000);
const yyyy = today.getFullYear();
let mm = today.getMonth() + 1; // Months start at 0!
let dd = today.getDate();

if (dd < 10) dd = '0' + dd;
if (mm < 10) mm = '0' + mm;

today = mm + '/' + dd + '/' + yyyy;

async function fetchMysteryArtist() {
  await fetch('resources/mysteryArtists.json').then(function (response) {
    return response.json();
  }).then(function (data) {
    for (var i = 0; i < data.length; i++) {
      if (data[i].date == today) {
        mysteryArtist = artists[data[i].artist.toLowerCase()];
        mysteryArtistSong = data[i].song_uri;
        mysteryArtistImage = data[i].image_uri;
        mysteryArtistName = data[i].artist;
        spotleNumber = i + 1;
        
        yesterdayMysteryArtist = data[i-1].artist;
        yesterdayMysteryArtistImage = artists[data[i-1].artist.toLowerCase()].imageUri;

      }
    }
  }).catch (function (error) {
    console.error(error);
  });
}

var decodedArtist;
var decodedMessage;
const queryString = window.location.search;
const challengeGame = (queryString ? true : false);
let creatingChallenge = false;
let challengeWin = false;

if (!challengeGame) {
  await fetchMysteryArtist();
}
else {
  const urlParams = new URLSearchParams(queryString);
  let encodedArtist = urlParams.get('artist');
  let encodedMessage = urlParams.get('msg');

  decodedArtist = atob(encodedArtist);
  decodedArtist = decodedArtist.toLowerCase();

  mysteryArtist = artists[decodedArtist];
  mysteryArtistSong = mysteryArtist.songUri;
  mysteryArtistImage = mysteryArtist.songImageUri;
  mysteryArtistName = mysteryArtist.name;

  decodedMessage = atob(encodedMessage);

  document.body.style.background = "linear-gradient(137.28deg, #894986 -5.33%, #121212 36.26%)";
}

const gameContainer = document.querySelector('.game-container');
const searchInput = document.getElementById('search');
const searchWrapper = document.querySelector('.search-container');
const resultsWrapper = document.querySelector('.results');
const guessContainer = document.querySelector('.guess-container');
const guessButton = document.querySelector('.guess-btn');
const intro = document.getElementById('intro');
const guessCountContainer = document.querySelector('.guesses');
const winOverlay = document.getElementById('win-overlay');
const infoPrompt = document.querySelector('.info-prompt');
const timer = document.querySelector('.timer');
const shareBtn = document.querySelector('.share-btn');
const todaysBtn = document.querySelector('.play-todays');
const createBtn = document.querySelector('.create-btn');
const exitBtn = document.querySelector('.exit-btn');
const albumImg = document.querySelector('.album-img');
const todaysName = document.querySelector('.todays-name');
const todaysMessage = document.querySelector('.todays-artist');
const congratulations = document.querySelector('.congratulations');
const muteBtn = document.querySelector('.mute-btn');
const muteImg = document.querySelector('.mute-img');
const challengeBtn = document.querySelector('.challenge-btn');
const helpExitBtn = document.querySelector('.help-exit-btn');
const helpBtn = document.querySelector('.help-btn');
const helpOverlay = document.querySelector('.help-overlay');
const yesterdayImage = document.querySelector('.yesterday-image');
const yesterdayName = document.querySelector('.yesterday-name');
const yesterdaysArtist = document.querySelector('.yesterdays-artist');
const introTitle = document.querySelector('.intro-title');
const introDescription = document.querySelector('.intro-description');
const introMusicWarning = document.querySelector('.intro-music-warning');
const nextSpotle = document.querySelector('.next-spotle');
const challengeContainer = document.querySelector('.outer-challenge-container');
const embeddedTrackContainer = document.querySelector('.embedded-track')
const challengeArtist = document.querySelector('.challenge-artist');
const challengeShareBtn = document.querySelector('.challenge-share-btn');
const challengeForm = document.querySelector('.challenge-form');
const navChallengeBtn = document.querySelector('.challenge-btn');
const challengeExitBtn = document.querySelector('.challenge-exit-btn');
// const snowContainer = document.querySelector('.snow-container');
// const snowflakesContainer = document.querySelector('.snowflakes-container');
const creditsContainer = document.querySelector('.credits');
const examplePic = document.getElementById('example-pic');

function isMobile() {
  const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return regex.test(navigator.userAgent);
}
// Function to check if a date is between two other dates
function isDateBetween(start, end, dateToCheck) {
  return dateToCheck >= start && dateToCheck <= end;
}

// Define the start and end dates
var startDate = new Date('2023-12-18');
var endDate = new Date('2023-12-25');

// Create the date to check
var dateToCheck = new Date();  // This will use the current date and time

// // Check if the date is between the specified range
// if (isDateBetween(startDate, endDate, dateToCheck)) {
//   console.log('The date is between December 18, 2023, and December 25, 2023.');
//   snowflakesContainer.classList.remove('hidden');
//   snowContainer.classList.remove('hidden');
//   creditsContainer.classList.add('hidden');
//   document.body.style.background = "linear-gradient(140deg, #811E24 0.23%, #121212 43.62%)";
//   examplePic.src = "resources/dua_lipa_santa.jpg";

// } else {
//   console.log('The date is outside the specified range.');
// }

let sharedChallengeArtist;

// const snowSvg = document.querySelector('.snow-overlay')




if (challengeGame) {
  introTitle.innerHTML = "Someone sent you a custom Spotle game. Try to guess the artist they picked!";
  introDescription.innerHTML = "";
  introMusicWarning.innerHTML = "";
  if (decodedMessage != '') {
    introDescription.innerHTML = "They wanted us to tell you:\n" + decodedMessage;
  }

  yesterdayImage.classList.add('hidden');
  yesterdayName.classList.add('hidden');
  yesterdaysArtist.classList.add('hidden');
  timer.classList.add('hidden');
  nextSpotle.classList.add('hidden');
  navChallengeBtn.classList.add('hidden');
}

if (!challengeGame) {
  yesterdayName.innerHTML += String(yesterdayMysteryArtist);
  yesterdayImage.src = yesterdayMysteryArtistImage;
}


var rollSound;

try {
  rollSound = new Audio(mysteryArtistSong);
} catch {
  console.log('failed to get audio');
}

let firstGuess = true;
let guessedArtists = [];

albumImg.src = mysteryArtistImage;
todaysName.innerHTML = mysteryArtistName;

function getCookie (name) {
	let value = `; ${document.cookie}`;
	let parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop().split(';').shift();
}

var cookie_expires = "";
var date = new Date();

date.setTime(date.getTime()+date.getTimezoneOffset()*60*1000);
var offset = -300; //Timezone offset for EST in minutes.
date = new Date(date.getTime() + offset*60*1000);

var midnight = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
const expires = "; expires=" + midnight.toGMTString();

if (getCookie('visited') != null) {

  if (getCookie('mute') == 1) {
    muteImg.src = 'resources/volume_off.svg';
  }
   
  if (!challengeGame) {
    // console.log('remembered');
    guessCount = getCookie('guessCount');
    guessCountContainer.innerHTML = "Guess " + String(guessCount) + " of 10";

    if (guessCount > 1) {
      intro.classList.add('hidden');
    }
    if (guessCount == 10 && !(getCookie('won'))) {
      guessCountContainer.classList.add('last-guess');
    }
    printPreviousGuesses();
    //print guesses function

    if (getCookie('won')) {
      intro.classList.add('hidden');
      searchInput.setAttribute('readonly', true);
      win(mysteryArtist);
    }
    if (getCookie('lost')) {
      intro.classList.add('hidden');
      searchInput.setAttribute('readonly', true);
      guessCountContainer.innerHTML = "Nice try...";
      loss();
    }
  }
}
else {
  // console.log('new person');
  document.cookie = 'mute = 0';
  document.cookie = 'visited = 1' + expires;
  document.cookie = 'guessCount = 1' + expires;
}

//handles autocomplete 
searchInput.addEventListener('keyup', () => {
  
  let results = [];
  let input = searchInput.value;
  if (input.length > 2) {
      results = searchable.filter((item) => {
      return item.toLowerCase().startsWith(input.toLowerCase());
    });
  }
  renderResults(results);
});

searchInput.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    handleGuess();
  }
});


exitBtn.addEventListener('click', () => {
  winOverlay.classList.add('win-overlay-hide');
  if (rollSound != null) {
    rollSound.pause();
  }
  // console.log('exit clicked');
});

  function renderResults(results) {
    if (!results.length) {
      return searchWrapper.classList.remove('show');
    }
  
    const content = results
      .map((item) => {
        return `<li>${item}</li>`;
      })
      .join('');
  
    searchWrapper.classList.add('show');
    resultsWrapper.innerHTML = `<ul>${content}</ul>`;
  }

  //when user selects an artist from search results -> put the artist in search bar and hide other results
  resultsWrapper.addEventListener("click", function() {
      var clickedElement = document.querySelector('li:hover');
      searchInput.value = clickedElement.innerHTML;
      handleGuess();
      searchWrapper.classList.remove('show');
  }); 

  gameContainer.addEventListener('click', () => {
    searchWrapper.classList.remove('show');
  });

//handle guess when player searches for an artist
const handleGuess = () => {

    let guess = searchInput.value
    // console.log("Guess ------>" + guess)
    searchInput.value = ""; //make search bar empty 
    searchWrapper.classList.remove('show'); //hide results
    guess = guess.toLowerCase() //make guess lowercase
    guess = guess.replace('amp;', '');


    if (guess == "") { //empty guess, do nothing
      return;
    }
    if (artists[guess] == null) { //invalid artist, not in top 500
      invalidArtist();
      return;
    }
    
    var currentArtist = artists[guess];

    if (creatingChallenge) {
      challengeContainer.classList.remove('hidden'); 

      setTimeout(() => {
        challengeContainer.classList.add('transition-in');
        }, 250);

      embeddedTrackContainer.src = currentArtist.embeddedTrack;
      // console.log(currentArtist.imageUri);
      var artistName = document.querySelector('.challenge-artist-name');
      var artistImage = document.querySelector('.challenge-artist-img');

      artistName.innerHTML = currentArtist.name;
      artistImage.src = currentArtist.imageUri;

      sharedChallengeArtist = currentArtist;

      // console.log(artistImage.src);

      guessCountContainer.innerHTML = "Click share to send your friend the game!"
      return;
    }
   
    if (currentArtist.name == mysteryArtist.name) {
      if (firstGuess) {
        firstGuess = false;
        intro.classList.add('hidden');
      }
      win(currentArtist);

      return;
    }

    if (guessedArtists.includes(currentArtist.name)) {
      // console.log('already guessed');
      return;
    }
    
    if (firstGuess) {
      firstGuess = false;
      intro.classList.add('hidden');
    }
    
    incorrectGuess(currentArtist);
}

function invalidArtist() {
    infoPrompt.classList.add('info-prompt-transform');
    setTimeout(() => {infoPrompt.classList.remove('info-prompt-transform')}, 3000);
    
    return;
}

function win(guess) {

    searchInput.setAttribute('readonly', true);

    if (guessCountContainer.classList.contains('last-guess')) {
      guessCountContainer.classList.remove('last-guess');
    }

    if (!challengeGame) {
      document.cookie = "guess" + (guessCount) + "=" + guess.name + expires;
      document.cookie = "won=1" + expires;
    }
    else {
      challengeWin = true;
      todaysBtn.classList.remove('hidden');
    }

    printGuess(guess);

    if (!challengeGame) {

      switch (guessCount) {
        case 1:
          congratulations.innerHTML = "Wow. Are they your favorite?"
          break;

        case 2:
          congratulations.innerHTML = "Did you cheat...?"
          break;  

        case 3:
          congratulations.innerHTML = "You are a savant!"
          break;

        case 4:
          congratulations.innerHTML = "4/10...incredible!"
          break;  

        case 5:
          congratulations.innerHTML = "Five. Impressive."
          break;

        case 6:
          congratulations.innerHTML = "Tell your friends!"
          break;  

        case 7:
          congratulations.innerHTML = "Congrats!"
          break;

        case 8:
          congratulations.innerHTML = "Good job, not great...but good."
          break; 

        case 9:
          congratulations.innerHTML = "Nice, that was close!"
          break;

        case 10:
          congratulations.innerHTML = "Last guess! On the buzzer!"
          break; 
      }
    }
    else {
      congratulations.innerHTML = "Tell your friend it was too easy."
      todaysMessage.innerHTML = "The artist was...";
    }

   
    try {
      if (getCookie('mute') == 0) {
        rollSound.play(); 
        rollSound.pause();
      }
      } catch(error) {
        console.error(error);
        // console.log('no audio to play');
      }
    
    
    setTimeout(() => {
      winOverlay.classList.remove('win-overlay-hide');
      winOverlay.classList.add('win-overlay');
      guessCountContainer.innerHTML = "Guess " + String(guessCount) + " of 10";
      try {
        if(getCookie('mute') == 0) {
          rollSound.play(); 
        }
        } catch(error) {
          console.error(error);
          // console.log('no audio to play');
        }
      }, 1200);
    
    
    calculateHMSleft();
    setInterval(calculateHMSleft, 1000);


    //display

    return;
}

function  calculateHMSleft() {
  var now = new Date();
  now.setTime(now.getTime() + now.getTimezoneOffset()*60*1000);
  var offset = -300;
  var estDate = new Date(now.getTime() + offset*60*1000);
  
  var hoursleft = 23-estDate.getHours();
  var minutesleft = 59-estDate.getMinutes();
  var secondsleft = 59-estDate.getSeconds();

  //format 0 prefixes
  if(minutesleft<10) minutesleft = "0"+minutesleft;
  if(secondsleft<10) secondsleft = "0"+secondsleft;  

  timer.innerHTML = hoursleft+":"+minutesleft+":"+secondsleft
}

function handleShare() {
  //copy to clipboard
  if (challengeGame) {
    var textToCopy = "Spotle Challenge 🎧\n\n";
    var textToCopy2 = "";
  }
  else {
    var textToCopy = "Spotle #" + spotleNumber + "🎧\n\n";
    var textToCopy2 = "";
  }
  
  for (var i = 1; i < guessCount; i++)
  {
    textToCopy2 = textToCopy2.concat("","⬜");
  }

  var textToCopy3 = "🟩\n\n";
  var textToCopy4 = "spotle.io";

  var result = "";
  if (getCookie('won')) {
    result = textToCopy.concat(textToCopy2, textToCopy3, textToCopy4);
  }
  else {
    if (!challengeGame) {
      result = textToCopy.concat('⬜⬜⬜⬜⬜⬜⬜⬜⬜❌\n\n', textToCopy4);
    }
    else {
      if (challengeWin) {
        result = textToCopy.concat(textToCopy2, textToCopy3, textToCopy4);
      }
      else {
        result = textToCopy.concat('⬜⬜⬜⬜⬜⬜⬜⬜⬜❌\n\n', textToCopy4);
      }
    }
  }

  if (navigator.share) { 
    navigator.share({
       text: result
     }).then(() => {
       console.log('Thanks for sharing!');
     })
     .catch(console.error);
     } else {
      navigator.clipboard.writeText(result)
      .then(() => { console.log('copied'); })
      .catch((error) => { alert(`Copy failed! ${error}`) })
    }
}

function loss() {
  // console.log('lost');

  if (guessCountContainer.classList.contains('last-guess')) {
    guessCountContainer.classList.remove('last-guess');
  }

  if (challengeGame) {
    todaysMessage.innerHTML = "The artist was...";
    congratulations.innerHTML = "";
  }
  else {
    document.cookie = "lost = " + "1" + expires;
  }

  congratulations.innerHTML = "Good try. Next time!";

  setTimeout(() => {
    winOverlay.classList.remove('win-overlay-hide');
    winOverlay.classList.add('win-overlay');
  
    try {
      if (getCookie('mute') == 0)
        rollSound.play(); 
      } catch(error) {

        console.error(error);
        // console.log('no audio to play');
      }
    }, 1000);
  
  calculateHMSleft();
  setInterval(calculateHMSleft, 1000);

  searchInput.setAttribute('readonly', true);
}

function incorrectGuess(guess) {

    guessCount++;
    if (!challengeGame) {
      document.cookie = "guessCount = " + String(guessCount) + expires;
      document.cookie = "guess" + (guessCount-1) + "=" + guess.name + expires;
    }

    printGuess(guess); 
    guessCountContainer.innerHTML = "Guess " + guessCount + " of 10";
    guessedArtists.push(guess.name);

    if (guessCount == 10) {
      guessCountContainer.classList.add('last-guess');
    }
    if (guessCount > 10) {
      guessCountContainer.innerHTML = "Nice try...";
      loss();
      // console.log('here');
    }

    return;
}

function printGuess(guess) {
  
  const guessElement = document.createElement('div');
  guessElement.classList.add('guess');

  //create row1
  const row1 = document.createElement('div');
  row1.classList.add('guessRow');

  //create name div and image div
  const nameElement = document.createElement('div');
  nameElement.classList.add('item-name');
  nameElement.innerHTML = guess.name;
  const imageArtist = document.createElement('img');
  imageArtist.src = guess.imageUri;
  imageArtist.alt = guess.name;
  
  //add image to nameElement div
  nameElement.prepend(imageArtist);
  row1.append(nameElement);

  //row2
  const row2 = document.createElement('div');
  row2.classList.add('guessRow');

  const albumElement = document.createElement('div');
  const albumSpan = document.createElement('span');
  albumSpan.classList.add('data');
  const groupElement = document.createElement('div');
  const groupSpan = document.createElement('span');
  groupSpan.classList.add('data');
  const listenerRankElement = document.createElement('div');
  const listenerRankSpan = document.createElement('span');
  listenerRankSpan.classList.add('data');

  albumElement.classList.add('item-long');
  groupElement.classList.add('item');
  listenerRankElement.classList.add('item-long');

  albumElement.innerHTML = "Debut Album " 
  albumSpan.innerHTML = guess.debutAlbumYear;
  const albumArrowContainer = document.createElement('div');
  albumArrowContainer.classList.add('arrow-container');
  albumArrowContainer.append(albumSpan);

  const albumArrowImg = document.createElement('img');
  if (guess.debutAlbumYear - mysteryArtist.debutAlbumYear > 0) {
    albumArrowImg.src = 'resources/keyboard_down.svg';
    albumArrowContainer.append(albumArrowImg);
  }
  if (guess.debutAlbumYear - mysteryArtist.debutAlbumYear < 0) {
    albumArrowImg.src = 'resources/keyboard_up.svg';
    albumArrowContainer.append(albumArrowImg);
  }
  if (guess.debutAlbumYear == mysteryArtist.debutAlbumYear) {
    albumElement.classList.add('placeholder');
  }

  groupElement.innerHTML = "Group Size "
  groupSpan.innerHTML = guess.groupSize;

  listenerRankElement.innerHTML = "Listener Rank ";
  const listenerRankArrowContainer = document.createElement('div');
  listenerRankArrowContainer.classList.add('arrow-container');
  listenerRankSpan.innerHTML = guess.listenerRank;
  listenerRankArrowContainer.append(listenerRankSpan);

  const listenerRankArrowImg = document.createElement('img');
  if (guess.listenerRank - mysteryArtist.listenerRank > 0) {
    listenerRankArrowImg.src = 'resources/keyboard_up.svg';
    listenerRankArrowContainer.append(listenerRankArrowImg);
  }
  if (guess.listenerRank - mysteryArtist.listenerRank < 0) {
    listenerRankArrowImg.src = 'resources/keyboard_down.svg';
    listenerRankArrowContainer.append(listenerRankArrowImg);
  }
  if (guess.listenerRank == mysteryArtist.listenerRank) {
    listenerRankElement.classList.add('placeholder');
  }

  albumElement.append(albumArrowContainer);
  groupElement.append(groupSpan);
  listenerRankElement.append(listenerRankArrowContainer);

  row2.append(albumElement);
  row2.append(groupElement);
  row2.append(listenerRankElement);

  //row3
  const row3 = document.createElement('div');
  row3.classList.add('guessRow');

  const genderElement = document.createElement('div');
  const genderSpan = document.createElement('span');
  genderSpan.classList.add('data');
  const genreElement = document.createElement('div');
  const genreSpan = document.createElement('span');
  genreSpan.classList.add('data');
  const nationalityElement = document.createElement('div');
  const nationalitySpan = document.createElement('span');
  nationalitySpan.classList.add('data');

  genderElement.classList.add('item');
  genreElement.classList.add('item-long');
  nationalityElement.classList.add('item');

  genderElement.innerHTML = "Gender ";
  genderSpan.innerHTML = guess.gender;
  genreElement.innerHTML = "Genre ";
  genreSpan.innerHTML = guess.genre;

  genderElement.append(genderSpan);
  genreElement.append(genreSpan);

  const imageNationality = document.createElement('img');
  imageNationality.src = 'resources\\nationalities\\' + guess.nationality + '.png';
  imageNationality.alt = guess.nationality;

  
  nationalityElement.innerHTML = "Nationality ";
  nationalityElement.append(imageNationality);

  row3.append(genderElement);
  row3.append(genreElement);
  row3.append(nationalityElement);

  guessElement.append(row1);
  guessElement.append(row2);
  guessElement.append(row3);

  guessContainer.prepend(guessElement);

  if (guess.listenerRank != mysteryArtist.listenerRank) {
    setTimeout(() => {
      checkCriteria(nationalityElement, genreElement, genderElement, groupElement, albumElement,listenerRankElement, guess);
      }, 750);
  }
  else {
    setTimeout(() => {
      flipWinnerGreen(nationalityElement, genreElement, genderElement, groupElement, albumElement,listenerRankElement);
      }, 750);
  }  
}

function flipWinnerGreen(nationalityElement, genreElement, genderElement, groupElement, albumElement, listenerRankElement) {
  
  if (today === "07/21/2023" || today === "07/22/2023") {
    flipDiv(nationalityElement,'correct-barbie');
    flipDiv(genreElement, 'correct-barbie');
    flipDiv(genderElement, 'correct-barbie');
    flipDiv(groupElement, 'correct-barbie');
    flipDiv(albumElement, 'correct-barbie');
    flipDiv(listenerRankElement,'correct-barbie');
    shareBtn.classList.add('correct-barbie');
    createBtn.classList.add('correct-barbie');
  }
  else {
    flipDiv(nationalityElement,'correct');
    flipDiv(genreElement, 'correct');
    flipDiv(genderElement, 'correct');
    flipDiv(groupElement, 'correct');
    flipDiv(albumElement, 'correct');
    flipDiv(listenerRankElement,'correct');
  }
 
}

function checkCriteria(nationalityElement, genreElement, genderElement, groupElement, albumElement,listenerRankElement, guess) {
  if (guess.nationality === mysteryArtist.nationality) {
    //nationalityElement.classList.add('correct');
    flipDiv(nationalityElement, 'correct');
  }
  else if (getContinent(guess.nationality) == getContinent(mysteryArtist.nationality)) {
    //nationalityElement.classList.add('close');
    flipDiv(nationalityElement, 'close');
  }

  if (guess.genre === mysteryArtist.genre) {
    //genreElement.classList.add('correct');
    flipDiv(genreElement, 'correct');
  }

  if (guess.gender === mysteryArtist.gender) {
    //genderElement.classList.add('correct');
    flipDiv(genderElement, 'correct');
  }

  if (guess.listenerRank === mysteryArtist.listenerRank) {
    //listenerRankElement.classList.add('correct');
    flipDiv(listenerRankElement, 'correct');
  }
  else if (Math.abs(guess.listenerRank - mysteryArtist.listenerRank) <= 50) {
    //listenerRankElement.classList.add('close');
    flipDiv(listenerRankElement, 'close');
  }

  if (guess.groupSize === mysteryArtist.groupSize) {
    //groupElement.classList.add('correct');
    flipDiv(groupElement, 'correct');
  }

  if (guess.debutAlbumYear === mysteryArtist.debutAlbumYear) {
    flipDiv(albumElement, 'correct');
    //albumElement.classList.add('correct');
  }
  else if (Math.abs(guess.debutAlbumYear - mysteryArtist.debutAlbumYear) <= 5) {
    //albumElement.classList.add('close');
    flipDiv(albumElement, 'close');
  }
}
function printPreviousGuesses() {
  for (var i = 0; i < guessCount - 1; i++) {
    var temp = "guess" + String(i+1);
    var tempStr = getCookie(temp).toLowerCase();
    var tempArtist = artists[getCookie(temp).toLowerCase()];
    printGuess(tempArtist);
  }
}

function flipDiv(div, state) {
  div.classList.add('flip-in');

  setTimeout(() => {
    div.classList.add(state);
    }, 250);
  setTimeout(() => {
    div.classList.remove('flip-in');
    div.classList.add('flip-out');
  }, 250);
  setTimeout(() => {
    div.classList.remove('flip-out'); 
  }, 1500);
}

function handleMute() {
  if (getCookie('mute') == 0) {
    //mute
    document.cookie = 'mute = 1';
    muteImg.src = 'resources/volume_off.svg';

    rollSound.pause();
  }
  else {
    //unmute
    document.cookie = 'mute = 0';
    muteImg.src = 'resources/volume_on.svg';

  }
}

function toggleChallenge() {

  const container = document.querySelector('.outer-guess-container');
    //no guesses, hide intro/show intro

  if (challengeGame) {

    if (!challengeContainer.classList.contains('hidden')) {
      window.location='http://www.spotle.io';
    }
    else {
      container.classList.add('hidden');
      guessCountContainer.innerHTML = "Choose an artist for your friends to guess!";
      winOverlay.classList.add('hidden');
      creatingChallenge = true;
      searchInput.removeAttribute('readonly');
      let textContainer =  document.querySelector('.challenge-btn-text');
      textContainer.innerHTML = "Return to Spotle";
      if (rollSound != null) {
        rollSound.pause();
      }
    }

  }
  
  if (getCookie('guessCount') == 1 && getCookie('won') != 1) {
    if (intro.classList.contains('hidden')) {
      if (!challengeGame)
        history.go(0);
    }
    else {
      intro.classList.add('hidden');
      guessCountContainer.innerHTML = "Choose an artist for your friends to guess!";
      winOverlay.classList.add('hidden');
      creatingChallenge = true;
      searchInput.removeAttribute('readonly');
      let textContainer = document.querySelector('.challenge-btn-text');
      textContainer.innerHTML = "Back to Game";
      if (rollSound != null) {
        rollSound.pause();
      }
    }
  }
  else {
    if (container.classList.contains('hidden')) {
      if (!challengeGame)
        history.go(0);
    }
    else {
      container.classList.add('hidden');
      guessCountContainer.innerHTML = "Select an artist for your friend to guess!";
      winOverlay.classList.add('hidden');
      creatingChallenge = true;
      searchInput.removeAttribute('readonly');
      let textContainer =  document.querySelector('.challenge-btn-text');
      textContainer.innerHTML = "Return to Spotle";
      if (rollSound != null) {
        rollSound.pause();
      }
    }
  }
}

function getContinent(countryCode) {
  if (north_america.includes(countryCode.toUpperCase())) {
    return 'North America';
  }
  if (europe.includes(countryCode.toUpperCase())) {
    return 'Europe';
  }
  if (oceania.includes(countryCode.toUpperCase())) {
    return 'Oceania';
  }
  if (south_america.includes(countryCode.toUpperCase())) {
    return 'South America';
  }
  if (asia.includes(countryCode.toUpperCase())) {
    return 'Asia';
  }
  if (africa.includes(countryCode.toUpperCase())) {
    return 'Africa';
  }
  return 'Error';
}

function shareChallenge() {

  var artistName = sharedChallengeArtist.name;
  var message = challengeForm.value;

  if (message == "I'm not sure what to write here..." || message == "") {
    message = '';
  }

  var encodedArtist = btoa(artistName);
  var encodedMessage = btoa(message);

  var url = "https://" + "spotle.io" + "/?artist=" + encodedArtist + "&" + "msg=" + encodedMessage;

  var shareMessage = "I made a custom Spotle game, try it now! 🎧🤍";

  var fullText = shareMessage + "\n\n" + url;

  if (isMobile()) {
    if (navigator.share) { 
      navigator.share({
        text: fullText
      }).then(() => {

      })
      .catch(console.error);
      } else {
        guessCountContainer.innerHTML = "Text copied to clipboard.\t"
        navigator.clipboard.writeText(fullText)
        .then(() => { console.log('copied'); })
        .catch((error) => { alert(`Copy failed! ${error}`) })
      }
    }
    else {
      navigator.clipboard.writeText(fullText)
      guessCountContainer.innerHTML = "Text copied to clipboard.\t"
    }
}

function handleTodays() {
  window.location='http://www.spotle.io';
}

guessButton.addEventListener('click', handleGuess);
shareBtn.addEventListener('click', handleShare);
muteBtn.addEventListener('click', handleMute);
challengeShareBtn.addEventListener('click', shareChallenge);
challengeBtn.addEventListener('click', toggleChallenge);
navChallengeBtn.addEventListener('click', toggleChallenge);
challengeExitBtn.addEventListener('click', toggleChallenge);
todaysBtn.addEventListener('click', handleTodays);
// createBtn.addEventListener('click', toggleChallenge);
helpBtn.addEventListener('click', function () {
  if (helpOverlay.classList.contains('hidden'))
    helpOverlay.classList.remove('hidden');
  else
    helpOverlay.classList.add('hidden');
});

helpExitBtn.addEventListener('click', function() {
  helpOverlay.classList.add('hidden');
});
