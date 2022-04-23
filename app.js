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

// const asia = [
//   AF,
//   AZ,
//   BH,
//   BD,
//   AM,
//   BT,
//   IO,
//   BN,
//   MM,
//   KH,
//   LK,
//   CN,
//   TW,
//   CX,
//   CC,
//   CY,
//   GE,
//   PS,
//   HK,
//   IN,
//   ID,
//   IR,
//   IQ,
//   IL,
//   JP,
//   KZ,
//   JO,
//   KP,
//   KR,
//   KW,
//   KG,
//   LA,
//   LB,
//   MO,
//   MY,
//   MV,
//   MN,
//   OM,
//   NP,
//   PK,
//   PH,
//   TL,
//   QA,
//   RU,
//   SA,
//   SG,
//   VN,
//   SY,
//   TJ,
//   TH,
//   AE,
//   TR,
//   TM,
//   UZ,
//   YE,
//   XE,
//   XD,
//   XS,
// ]

// const europe = [
//   AL,
//   AD,
//   AZ,
//   AT,
//   AM,
//   BE,
//   BA,
//   BG,
//   BY,
//   HR,
//   CY,
//   CZ,
//   DK,
//   EE,
//   FO,
//   FI,
//   AX,
//   FR,
//   GE,
//   DE,
//   GI,
//   GR,
//   VA,
//   HU,
//   IS,
//   IE,
//   IT,
//   KZ,
//   LV,
//   LI,
//   LT,
//   LU,
//   MT,
//   MC,
//   MD,
//   ME,
//   NL,
//   NO,
//   PL,
//   PT,
//   RO,
//   RU,
//   SM,
//   RS,
//   SK,
//   SI,
//   ES,
//   SJ,
//   SE,
//   CH,
//   TR,
//   UA,
//   MK,
//   GB,
//   GG,
//   JE,
//   IM,
// ]

// const north_america = [
//   AG,
//   BS,
//   BB,
//   BM,
//   BZ,
//   VG,
//   CA,
//   KY,
//   CR,
//   CU,
//   DM,
//   DO,
//   SV,
//   GL,
//   GD,
//   GP,
//   GT,
//   HT,
//   HN,
//   JM,
//   MQ,
//   MX,
//   MS,
//   AN,
//   CW,
//   AW,
//   SX,
//   BQ,
//   NI,
//   UM,
//   PA,
//   PR,
//   BL,
//   KN,
//   AI,
//   LC,
//   MF,
//   PM,
//   VC,
//   TT,
//   TC,
//   US,
//   VI,
// ]

// const oceania = [
//   AS,
//   AU,
//   SB,
//   CK,
//   FJ,
//   PF,
//   KI,
//   GU,
//   NR,
//   NC,
//   VU,
//   NZ,
//   NU,
//   NF,
//   MP,
//   UM,
//   FM,
//   MH,
//   PW,
//   PG,
//   PN,
//   TK,
//   TO,
//   TV,
//   WF,
//   WS,
//   XX,
// ]

// const south_america = [
//   AR,
//   BO,
//   BR,
//   CL,
//   CO,
//   EC,
//   FK,
//   GF,
//   GY,
//   PY,
//   PE,
//   SR,
//   UY,
//   VE,
// ]



class Artist {
  constructor(name,listenerRank, imageUri, genre, debutAlbumYear, gender, nationality, groupSize) {
      this.name = name;
      this.listenerRank = listenerRank;
      this.imageUri = imageUri;
      this.genre = genre;
      this.debutAlbumYear = debutAlbumYear;
      this.nationality = nationality;
      this.gender = gender;
      this.groupSize = groupSize;
  }
}
let guessCount = 1;
const artists = new Map();
const searchable = [];
var mysteryArtist;

import {csv} from "https://cdn.skypack.dev/d3-fetch@3";
// csv("resources/round_4_test.csv").then((data) => {
//    for (var i = 0; i < data.length; i++) {
  
//       searchable.push(data[i].artist);

//       var x;
//       if (data[i].gender == "m"){
//         x = 'Male';
//       }
//       else if (data[i].gender == "f") {
//         x = 'Female';
//       }
//       else {
//         x = 'Other';
//       }
//       artists.set(data[i].artist.toLowerCase(), new Artist(data[i].artist, i+1, data[i].image_uri, data[i].genre, data[i].year, x, data[i].country.toLowerCase(), data[i].group_size));
//    }
//   mysteryArtist = artists.get('the script');
  
//   setTimeout(() => {  console.log("World!"); }, 10000);
// });

const data = await csv("resources/round_4_test.csv");
for (var i = 0; i < data.length; i++) {
  searchable.push(data[i].artist);
  var x;
  if (data[i].gender == "m"){
    x = 'Male';
  }
  else if (data[i].gender == "f") {
    x = 'Female';
  }
  else {
    x = 'Mixed';
  }
    artists.set(data[i].artist.toLowerCase(), new Artist(data[i].artist, i+1, data[i].image_uri, data[i].genre, data[i].year, x, data[i].country.toLowerCase(), data[i].group_size));
}

// var mysteryArtistSong;
// var mysteryArtistImage;
// var mysteryArtistName;
// var today = new Date();
// const yyyy = today.getFullYear();
// let mm = today.getMonth() + 1; // Months start at 0!
// let dd = today.getDate();

// if (dd < 10) dd = '0' + dd;
// if (mm < 10) mm = '0' + mm;

// today = mm + '/' + dd + '/' + yyyy;
// console.log(mysteryData);
// for (var i = 0; i < mysteryData.length; i++) {
//   if (mysteryData[i].date == today) {
//     mysteryArtist = artists.get(mysteryData[i].artist.toLowerCase());
//     mysteryArtistSong = mysteryData[i].song_uri;
//     mysteryArtistImage = mysteryData[i].image_uri;
//     mysteryArtistName = mysteryData[i].artist;
//   }
// }

async function getMysteryData() {
  const result = await csv("resources/mysteryArtists.csv")
    console.log(result);
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
const exitBtn = document.querySelector('.exit-btn');
const albumImg = document.querySelector('.album-img');
const todaysName = document.querySelector('.todays-name');
const rollSound = new Audio(mysteryArtistSong);
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
var midnight = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
const expires = "; expires=" + midnight.toGMTString();

if (getCookie('visited') != null) {
  console.log('remembered');
  guessCount = getCookie('guessCount');
  guessCountContainer.innerHTML = "Guess #" + guessCount;

  if (guessCount > 1) {
    intro.classList.add('hidden');
  }
  printPreviousGuesses();
  //print guesses function

  if (getCookie('won')) {
    intro.classList.add('hidden');
    searchInput.setAttribute('readonly', true);
    win(mysteryArtist);
  }
}
else {
  console.log('new person');
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
  // if (rollSound != null) {
  //   rollSound.pause();
  // }
  console.log('exit clicked');
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
    searchInput.value = ""; //make search bar empty 
    searchWrapper.classList.remove('show'); //hide results
    guess = guess.toLowerCase() //make guess lowercase

    if (guess == "") { //empty guess, do nothing
      return;
    }
    if (artists.get(guess) == null) { //invalid artist, not in top 500
      invalidArtist();
      return;
    }
    
    var currentArtist = artists.get(guess);
   
    if (currentArtist.name == mysteryArtist.name) {
      if (firstGuess) {
        firstGuess = false;
        intro.classList.add('hidden');
      }
      win(currentArtist);

      return;
    }

    if (guessedArtists.includes(currentArtist.name)) {
      console.log('already guessed');
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
    console.log('here 1');
    setTimeout(() => {infoPrompt.classList.remove('info-prompt-transform')}, 3000);
    console.log('here 2');
    
    return;
}

function win(guess) {

    guessCount++;
    guessCountContainer.innerHTML = "Guess #" + guessCount;

    document.cookie = "guess" + (guessCount-1) + "=" + guess.name + expires;
    document.cookie = "won=1" + expires;
    printGuess(guess);

    winOverlay.classList.remove('win-overlay-hide');
    winOverlay.classList.add('win-overlay');
    
    //rollSound.play();
    
    calculateHMSleft();
    setInterval(calculateHMSleft, 1000);

    searchInput.setAttribute('readonly', true);
    //display

    return;
}

function  calculateHMSleft() {
  var now = new Date();
  var hoursleft = 23-now.getHours();
  var minutesleft = 59-now.getMinutes();
  var secondsleft = 59-now.getSeconds();

  //format 0 prefixes
  if(minutesleft<10) minutesleft = "0"+minutesleft;
  if(secondsleft<10) secondsleft = "0"+secondsleft;  

  timer.innerHTML = hoursleft+":"+minutesleft+":"+secondsleft
}

function handleShare() {
  //copy to clipboard
  var textToCopy = "Spotle #2 \n\n🎵";
  var textToCopy2 = "";
  
  for (var i = 1; i < guessCount - 1; i++)
  {
    textToCopy2 = textToCopy2.concat("","⬜");
  }

  var textToCopy3 = "🟩🎵\n\n";
  var textToCopy4 = "spotle.io";

  let result = textToCopy.concat(textToCopy2, textToCopy3, textToCopy4);

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
  console.log('lost');
}

function incorrectGuess(guess) {

    guessCount++;
    document.cookie = "guessCount = " + String(guessCount) + expires;
    document.cookie = "guess" + (guessCount-1) + "=" + guess.name + expires;
    printGuess(guess); 
    guessCountContainer.innerHTML = "Guess #" + guessCount;
    guessedArtists.push(guess.name);

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
  const groupElement = document.createElement('div');
  const groupSpan = document.createElement('span');
  const listenerRankElement = document.createElement('div');
  const listenerRankSpan = document.createElement('span');

  albumElement.classList.add('item-long');
  groupElement.classList.add('item');
  listenerRankElement.classList.add('item-long');

  albumElement.innerHTML = "Debut Album " 
  albumSpan.innerHTML = guess.debutAlbumYear;
  const albumArrowContainer = document.createElement('div');
  albumArrowContainer.classList.add('arrow-container');
  albumArrowContainer.append(albumSpan);

  if (guess.debutAlbumYear == mysteryArtist.debutAlbumYear) {
    albumElement.classList.add('correct');
  }
  else if (Math.abs(guess.debutAlbumYear - mysteryArtist.debutAlbumYear) <= 5) {
    albumElement.classList.add('close');
  }

  const albumArrowImg = document.createElement('img');
  if (guess.debutAlbumYear - mysteryArtist.debutAlbumYear > 0) {
    albumArrowImg.src = 'resources/keyboard_down.svg';
    albumArrowContainer.append(albumArrowImg);
  }
  if (guess.debutAlbumYear - mysteryArtist.debutAlbumYear < 0) {
    albumArrowImg.src = 'resources/keyboard_up.svg';
    albumArrowContainer.append(albumArrowImg);
  }

  groupElement.innerHTML = "Group Size "
  groupSpan.innerHTML = guess.groupSize;

  if (guess.groupSize == mysteryArtist.groupSize)
    groupElement.classList.add('correct');

  listenerRankElement.innerHTML = "Listener Rank ";
  const listenerRankArrowContainer = document.createElement('div');
  listenerRankArrowContainer.classList.add('arrow-container');
  listenerRankSpan.innerHTML = guess.listenerRank;
  listenerRankArrowContainer.append(listenerRankSpan);

  if (guess.listenerRank == mysteryArtist.listenerRank) {
    listenerRankElement.classList.add('correct');
  }
  else if (Math.abs(guess.listenerRank - mysteryArtist.listenerRank) <= 50) {
    listenerRankElement.classList.add('close');
  }

  const listenerRankArrowImg = document.createElement('img');
  if (guess.listenerRank - mysteryArtist.listenerRank > 0) {
    listenerRankArrowImg.src = 'resources/keyboard_up.svg';
    listenerRankArrowContainer.append(listenerRankArrowImg);
  }
  if (guess.listenerRank - mysteryArtist.listenerRank < 0) {
    listenerRankArrowImg.src = 'resources/keyboard_down.svg';
    listenerRankArrowContainer.append(listenerRankArrowImg);
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
  const genreElement = document.createElement('div');
  const genreSpan = document.createElement('span');
  const nationalityElement = document.createElement('div');
  const nationalitySpan = document.createElement('span');

  genderElement.classList.add('item');
  genreElement.classList.add('item-long');
  nationalityElement.classList.add('item');

  genderElement.innerHTML = "Gender ";
  genderSpan.innerHTML = guess.gender;
  genreElement.innerHTML = "Genre ";
  genreSpan.innerHTML = guess.genre;

  if (guess.genre == mysteryArtist.genre)
    genreElement.classList.add('correct');

  if (guess.gender == mysteryArtist.gender)
    genderElement.classList.add('correct');

  genderElement.append(genderSpan);
  genreElement.append(genreSpan);

  const imageNationality = document.createElement('img');
  imageNationality.src = 'resources\\nationalities\\' + guess.nationality + '.png';
  imageNationality.alt = guess.nationality;

  if (guess.nationality == mysteryArtist.nationality)
    nationalityElement.classList.add('correct');
  // else if (getContinent(guess.nationality) == getContinent(mysteryArtist.nationality))
  //   nationalityElement.classList.add('close');
  nationalityElement.innerHTML = "Nationality ";
  nationalityElement.append(imageNationality);

  row3.append(genderElement);
  row3.append(genreElement);
  row3.append(nationalityElement);

  guessElement.append(row1);
  guessElement.append(row2);
  guessElement.append(row3);

  guessContainer.prepend(guessElement);
}

function printPreviousGuesses() {
  for (var i = 0; i < guessCount - 1; i++) {
    var temp = "guess" + String(i+1);
    var tempStr = getCookie(temp).toLowerCase();
    var tempArtist = artists.get(getCookie(temp).toLowerCase());
    printGuess(tempArtist);
  }
}

// function getContinent(countryCode) {
//   if (north_america.includes(countryCode.toUpperCase())) {
//     return 'North America';
//   }
//   if (europe.includes(countryCode.toUpperCase())) {
//     return 'Europe';
//   }
//   if (oceania.includes(countryCode.toUpperCase())) {
//     return 'Oceania';
//   }
//   if (south_america.includes(countryCode.toUpperCase())) {
//     return 'South America';
//   }
//   if (asia.includes(countryCode.toUpperCase())) {
//     return 'Asia';
//   }
//   if (africa.includes(countryCode.toUpperCase())) {
//     return 'Africa';
//   }
//   return 'Error';
// }

guessButton.addEventListener('click', handleGuess);
shareBtn.addEventListener('click', handleShare);