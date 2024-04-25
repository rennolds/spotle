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


