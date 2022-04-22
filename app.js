// if (guess == "drake") {
//   
// } for later
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

const artists = new Map();
const searchable = [];
var mysteryArtist;

import {csv} from "https://cdn.skypack.dev/d3-fetch@3";
csv("resources/round_4_test.csv").then((data) => {
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
        x = 'Other';
      }
      artists.set(data[i].artist.toLowerCase(), new Artist(data[i].artist, i+1, data[i].image_uri, data[i].genre, data[i].year, x, data[i].country.toLowerCase(), data[i].group_size));
   }
  mysteryArtist = artists.get('the script');
});
 
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
const rollSound = new Audio("https://p.scdn.co/mp3-preview/ce8ee2cff5b6dc753c71091b1f1696941a15c1ee?cid=98f79e400795491cbc5f69b713465708");
let firstGuess = true;
let guessCount = 1;
let guessedArtists = [];


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
    console.log('guess; ' + guess);
    searchInput.value = ""; //make search bar empty 
    searchWrapper.classList.remove('show'); //hide results
    console.log('guess in loewrcase: ' + guess);
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
    console.log("YOU WIN!")
    printGuess(guess);

    winOverlay.classList.remove('win-overlay-hide');
    winOverlay.classList.add('win-overlay');
    
    rollSound.play();
    
    calculateHMSleft();
    setInterval(calculateHMSleft, 1000);
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
  
  for (var i = 1; i < guessCount; i++)
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

    printGuess(guess);
    console.log('guess: ' + guess.name);
    console.log('mystery: ' + mysteryArtist.name);

    guessCount++;
    guessCountContainer.innerHTML = "Guess #" + guessCount;
  
    if (guessCount == 9) {
      console.log("lost");
      lost();
    }

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

  if (guess.debutAlbumYear == mysteryArtist.debutAlbumYear) {
    albumElement.classList.add('correct');
  }
  else if (Math.abs(guess.debutAlbumYear - mysteryArtist.debutAlbumYear) <= 5) {
    albumElement.classList.add('close');
  }

  groupElement.innerHTML = "Group Size "
  groupSpan.innerHTML = guess.groupSize;

  if (guess.groupSize == mysteryArtist.groupSize)
    groupElement.classList.add('correct');

  listenerRankElement.innerHTML = "Listener Rank ";
  listenerRankSpan.innerHTML = guess.listenerRank;

  if (guess.listenerRank == mysteryArtist.listenerRank) {
    listenerRankElement.classList.add('correct');
  }
  else if (Math.abs(guess.listenerRank - mysteryArtist.listenerRank) <= 50) {
    listenerRankElement.classList.add('close');
  }

  albumElement.append(albumSpan);
  groupElement.append(groupSpan);
  listenerRankElement.append(listenerRankSpan);

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

guessButton.addEventListener('click', handleGuess);
shareBtn.addEventListener('click', handleShare);