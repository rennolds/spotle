import { writable } from "svelte/store";
import { browser } from "$app/environment";


/// NEW

let completedDatesParsed = [];
const completedDatesName = "completedDates";
if (browser) {
    const retrieved = localStorage.getItem(completedDatesName);
    if (retrieved) {
        completedDatesParsed = JSON.parse(retrieved);
    }
}
export const completedDates = writable(browser && completedDatesParsed === null ? [] : completedDatesParsed);
completedDates.subscribe((val) => {
    if (browser) return (localStorage.setItem(completedDatesName, JSON.stringify(val)));
});

// PLAYED

let playedParsed = 0;
const playedName = "played";
if (browser) {
    const retrieved = localStorage.getItem(playedName);
    if (retrieved) {
        playedParsed = parseInt(retrieved, 10);
    }
}
export const played = writable(browser && playedParsed === null ? 0 : playedParsed);
played.subscribe((val) => {
    if (browser) return (localStorage.setItem(playedName, val));
});

/* 
  currentStreak 
*/
let currentStreakParsed = 0;
const currentStreakName = "currentStreak";
if (browser) {
    const retrieved = localStorage.getItem(currentStreakName);
    if (retrieved) {
        currentStreakParsed = parseInt(retrieved, 10);
    }
}
export const currentStreak = writable(browser && currentStreakParsed === null ? 0 : currentStreakParsed);
currentStreak.subscribe((val) => {
    if (browser) return (localStorage.setItem(currentStreakName, val));
});

/* 
  maxStreak 
*/
let maxStreakParsed = 0;
const maxStreakName = "maxStreak";
if (browser) {
    const retrieved = localStorage.getItem(maxStreakName);
    if (retrieved) {
        maxStreakParsed = parseInt(retrieved, 10);
    }
}
export const maxStreak = writable(browser && maxStreakParsed === null ? 0 : maxStreakParsed);
maxStreak.subscribe((val) => {
    if (browser) return (localStorage.setItem(maxStreakName, val));
});

/*
  solveList
*/
let solveListParsed = [];
const solveListName = "solveList";
if (browser) {
    const retrieved = localStorage.getItem(solveListName);
    if (retrieved) {
        solveListParsed = JSON.parse(retrieved);
    }
}
export const solveList = writable(browser && solveListParsed === null ? [] : solveListParsed);
solveList.subscribe((val) => {
    if (browser) return (localStorage.setItem(solveListName, JSON.stringify(val)));
});

// EXISTING


export const visited = writable(browser && localStorage.getItem("visited") || false)
visited.subscribe((val) => {
    if (browser) return (localStorage.visited = val);
});

export const currentGameDate = writable(browser && localStorage.getItem("currentGameDate") || new Date("01/01/2000"))
currentGameDate.subscribe((val) => {
    if (browser) return (localStorage.currentGameDate = val);
});

let mutedParsed = "";
const mutedName = "muted";
if (browser) {
    const retrieved = localStorage.getItem(mutedName)
    if (retrieved) {
        if (retrieved == "true") {
            mutedParsed = true;
        }
        else {
            mutedParsed = false;
        }
    }
}

export const muted = writable(browser && mutedParsed === null ? false : mutedParsed)
muted.subscribe((val) => {
    if (browser) return (localStorage.setItem(mutedName, JSON.stringify(val)));
});

let gameoverParsed = "";
const gameoverName = "gameOver";
if (browser) {
    const retrieved = localStorage.getItem(gameoverParsed);
    if (retrieved) {
        if (retrived == "true") {
            gameoverParsed = true;
        }
        else {
            gameoverParsed = false;
        }
    }
}

export const gameOver = writable(browser && gameoverParsed === null ? false : gameoverParsed)
gameOver.subscribe((val) => {
    if (browser) return (localStorage.setItem(gameoverName, JSON.stringify(val)));
});

let parsed = "";
const guessesName = "guesses";
if (browser) {
    const retrieved = localStorage.getItem(guessesName)
    if (retrieved) {
        parsed = JSON.parse(retrieved);
    }
}

export const guesses = writable(browser && parsed === null ? [] : parsed)
guesses.subscribe((value) => {
    if (browser) return (localStorage.setItem(guessesName, JSON.stringify(value)))
});


/* bestGuessImages - an array of strings */
let bestGuessImagesParsed = [];
const bestGuessImagesName = "bestGuessImages";
if (browser) {
    const retrieved = localStorage.getItem(bestGuessImagesName);
    if (retrieved) {
        bestGuessImagesParsed = JSON.parse(retrieved);
    }
}
export const bestGuessImages = writable(
    browser && bestGuessImagesParsed === null ? [] : bestGuessImagesParsed
);
bestGuessImages.subscribe((val) => {
    if (browser) return localStorage.setItem(bestGuessImagesName, JSON.stringify(val));
});

export const bracketView = writable("bracket");

/* bracketRoundGradient - stores the current gradient for bracket pages */
export const bracketRoundGradient = writable("linear-gradient(180deg, #48937D 0%, rgba(18, 18, 18, 0) 39.9%)");

/* highContrast - a boolean */
let highContrastParsed = false;
const highContrastName = "highContrast";
if (browser) {
    const retrieved = localStorage.getItem(highContrastName);
    if (retrieved) {
        highContrastParsed = JSON.parse(retrieved);
    }
}
export const highContrast = writable(
    browser && highContrastParsed === null ? false : highContrastParsed
);
highContrast.subscribe((val) => {
    if (browser) return localStorage.setItem(highContrastName, JSON.stringify(val));
});
