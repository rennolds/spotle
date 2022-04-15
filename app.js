const searchBar = document.querySelector('.search-container')
const artistList = document.querySelector('.artist-list')
const searchInput = document.querySelector('.search-input')
const guessButton = document.querySelector('.guess-btn')
const guessContainer = document.getElementById('guess-container')

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

artists.forEach(artist => {
    const optionElement = document.createElement('option')
    optionElement.setAttribute('id', artist.name)
    optionElement.textContent = artist.name
    artistList.append(optionElement)
})

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
    guessContainer.appendChild(guessElement);

    const nameElement = document.createElement('div')
    nameElement.classList.add('name');
    nameElement.textContent = currentArtist.name
    guessElement.append(nameElement)

    const albumElement = document.createElement('div')
    if (currentArtist.debutAlbumYear == mysteryArtist.debutAlbumYear) {
        albumElement.classList.add('correct');
    }
    else if (Math.abs(currentArtist.debutAlbumYear - mysteryArtist.debutAlbumYear) <= 5) {
        
    }
    albumElement.classList.add('debut-album');
    albumElement.textContent = 'Debut Album Year ' + currentArtist.debutAlbumYear
    guessElement.append(albumElement)

    const groupElement = document.createElement('div')
    
    groupElement.classList.add('placeholder');
    groupElement.textContent = "Group Size 1"
    guessElement.append(groupElement)

    const listenerRankElement = document.createElement('div')
    if (currentArtist.listenerRank == mysteryArtist.listenerRank) {
        listenerRankElement.classList.add('correct');
    }
    listenerRankElement.classList.add('listener-rank');
    listenerRankElement.textContent = 'Listener Rank # ' + currentArtist.listenerRank
    guessElement.append(listenerRankElement)

    const genderElement = document.createElement('div')
    if (currentArtist.gender == mysteryArtist.gender) {
        genderElement.classList.add('correct');
    }
    genderElement.classList.add('gender');
    genderElement.textContent = 'Gender ' + currentArtist.gender
    guessElement.append(genderElement)

    const genreElement = document.createElement('div')
    if (currentArtist.genre == mysteryArtist.genre) {
        genreElement.classList.add('correct');
    }
    genreElement.classList.add('genre');
    genreElement.textContent = 'Genre ' + currentArtist.genre
    guessElement.append(genreElement)

    const nationalityElement = document.createElement('nationality')
    if (currentArtist.nationality == mysteryArtist.nationality) {
        nationalityElement.classList.add('correct');
    }
    nationalityElement.classList.add('nationality');
    nationalityElement.textContent = 'Nationality ' + currentArtist.nationality
    guessElement.append(nationalityElement)

    return;
}

guessButton.addEventListener('click', handleGuess)

//handle guess
//set guess to lowercase
//  check if guess is valid
//      is entry blank (do nothing)
//      does artist exist (if not, print "do not know ___")
//  compare artist to mystery artist
//      if mystery artist
//          print mystery artist
//          show win   
//          add to stats
//      if not -> deduct guess, compare criteria
//          gender: y or n
//          debut album year: up or down
//          nationality: y or n
//          listener rank: up or down
//          genre: y or n
//          print output, append to container
 

