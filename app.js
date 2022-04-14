const searchBar = document.querySelector('.search-container')
const artistList = document.querySelector('.artist-list')
const searchInput = document.querySelector('.search-input')
const guessButton = document.querySelector('.guess-btn')
const mysteryArtist = "Justin Bieber" // eventually we need to GET the mystery artist from somewhere

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

artists.forEach(artist => {
    const optionElement = document.createElement('option')
    optionElement.setAttribute('id', artist.name)
    optionElement.textContent = artist.name
    artistList.append(optionElement)
})

const handleGuess = () => {
    console.log("Guessed!")
    let guess = searchInput.value
    guess = guess.toLowerCase()
    if (artists.get(guess) != null) {
        var currentArtist = artists.get(guess)
        if (currentArtist.name == mysteryArtist) {
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
    
    console.log("Not the mystery artist.")
    console.log("listener rank: ", currentArtist.listenerRank)
    console.log("nationality: ", currentArtist.nationality)
    console.log("gender: ", currentArtist.gender)
    console.log("genre: ", currentArtist.genre)
    console.log("debutAlbumYear: ", currentArtist.debutAlbumYear)
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
 

