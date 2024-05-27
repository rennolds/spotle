import { writable } from "svelte/store";
import { browser } from "$app/environment";


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
    console.log(retrieved);
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


