let searchable = [
    'Coldplay',
    'Justin Bieber',
    'Ed Sheeran',
    'Taylor Swift',
    'The Weeknd',
    'Dua Lipa',
  ];
  
  const searchInput = document.getElementById('search');
  const searchWrapper = document.querySelector('.search-container');
  const resultsWrapper = document.querySelector('.results');
  const guessContainer = document.querySelector('.guess-container');
  const guessButton = document.querySelector('.guess-btn');
  
  searchInput.addEventListener('keyup', () => {
    let results = [];
    let input = searchInput.value;
    if (input.length) {
      results = searchable.filter((item) => {
        return item.toLowerCase().includes(input.toLowerCase());
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

  resultsWrapper.addEventListener("click", function() {
      var clickedElement = document.querySelector('li:hover');
      searchInput.value = clickedElement.innerHTML;
  }); 

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
artists.set('the weeknd', new Artist("The Weeknd",1,2013,"Canadian","Pop","Male"))
artists.set('justin bieber', new Artist("Justin Bieber",2,2010,"Canadian","Pop","Male"))
artists.set('ed sheeran', new Artist("Ed Sheeran",3,2011,"English","Pop","Male"))
artists.set('dua lipa', new Artist("Dua Lipa",4,2017,"English","Pop","Female"))
artists.set('taylor swift', new Artist("Taylor Swift",5,2006,"American","Pop","Female"))
artists.set('coldplay', new Artist("Coldplay",6,2000,"American","Alternative","Male"))
const mysteryArtist = artists.get("justin bieber")

const handleGuess = () => {
    let guess = searchInput.value
    guess = guess.toLowerCase()
    if (artists.get(guess) != null) {
        var currentArtist = artists.get(guess)
        if (currentArtist.name == mysteryArtist.name) {
            win()
        }
        else {
            incorrectGuess(currentArtist)
        }

    }
    else {
        invalidArtist()
    }
}

function invalidArtist() {
    console.log("We don't have that artist: ", searchInput.value)
    return;
}

function win() {
    console.log("YOU WIN!")
    return;
}

function incorrectGuess(currentArtist) {
    
    const guessElement = document.createElement('div');
    guessElement.classList.add('guess');
    
    const row1 = document.createElement('div');
    row1.classList.add('guessRow');


    guessElement.append('row1');
    guessElement.append('row2');
    guessElement.append('row3');
    guessContainer.prepend(guessElement);

    return;
}

guessButton.addEventListener('click', handleGuess)