// if (guess == "drake") {
//   const rollSound = new Audio("https://p.scdn.co/mp3-preview/997cd19a9e46b086516c57114a4ba6da5b078d91?cid=98f79e400795491cbc5f69b713465708");
//   rollSound.play();
// } for later
class Artist {
  constructor(name,listenerRank, debutAlbumYear, nationality, genre, gender) {
      this.name = name;
      this.listenerRank = listenerRank;
      this.debutAlbumYear = debutAlbumYear;
      this.nationality = nationality;
      this.genre = genre;
      this.gender = gender;
  }
}

var artists = new Map();

let searchable = [

];



import {csv} from "https://cdn.skypack.dev/d3-fetch@3";
csv("top1000artists.csv").then((data) => {
   console.log(data);
   for (var i = 0; i < data.length; i++) {
      //set artists and searchable here
      searchable.push(data[i].Artist);
   }
});


  const searchInput = document.getElementById('search');
  const searchWrapper = document.querySelector('.search-container');
  const resultsWrapper = document.querySelector('.results');
  const guessContainer = document.querySelector('.guess-container');
  const guessButton = document.querySelector('.guess-btn');
  const intro = document.getElementById('intro');
  const guessCountContainer = document.querySelector('.guesses');
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
      searchWrapper.classList.remove('show');
  }); 

artists.set('the weeknd', new Artist("The Weeknd",1,2013,"Canada","Pop","Male"));
artists.set('justin bieber', new Artist("Justin Bieber",2,2010,"Canada","Pop","Male"));
artists.set('ed sheeran', new Artist("Ed Sheeran",3,2011,"England","Pop","Male"));
artists.set('dua lipa', new Artist("Dua Lipa",4,2017,"England","Pop","Female"));
artists.set('taylor swift', new Artist("Taylor Swift",5,2006,"United States","Pop","Female"));
artists.set('coldplay', new Artist("Coldplay",6,2000,"United States","Alternative","Male"));
artists.set('drake', new Artist("Drake", 7, 2006, "Canada", "Rap",  "Male"));
const mysteryArtist = artists.get("justin bieber")

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
      win();
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
    console.log("We don't have that artist: ", searchInput.value)
    return;
}

function win() {
    console.log("YOU WIN!")
    return;
}

function incorrectGuess(guess) {

    printGuess(guess);

    guessCount++;
    guessCountContainer.innerHTML = "Guess " + guessCount + " of 6";
    if (guessCount == 7) {
      console.log("lost");
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
  imageArtist.src = "resources\\artists\\" + guess.name + ".jpg";
  
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
  groupElement.innerHTML = "Group Size";
  groupSpan.innerHTML = "1";
  listenerRankElement.innerHTML = "Listener Rank ";
  listenerRankSpan.innerHTML = guess.listenerRank;

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

  genderElement.append(genderSpan);
  genreElement.append(genreSpan);

  const imageNationality = document.createElement('img');
  imageNationality.src = 'resources\\nationalities\\' + guess.nationality + '.png';
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

guessButton.addEventListener('click', handleGuess)