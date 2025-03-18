import { writable, derived } from 'svelte/store';
import { browser } from "$app/environment";

// Game mode store
export const gameMode = writable('splash'); // 'splash', 'normal', 'challenge', 'rewind', 'create', 'rush'

// Game status
export const gameStatus = writable('active'); // 'active', 'won', 'lost'

// Current mystery artist
export const mysteryArtist = writable(null);

// Temporary guesses for modes other than normal game
export const tempGuesses = writable([]);

// Game indexes for modes like rewind and rush
export const currentModeIndex = writable(0);

// Import the existing stores
import { 
  visited,
  currentGameDate,
  muted,
  gameOver,
  guesses,
  played,
  currentStreak,
  maxStreak,
  solveList,
  bestGuessImages
} from '../routes/store.js';

// Re-export them for centralized access
export {
  visited,
  currentGameDate,
  muted,
  gameOver,
  guesses,
  played,
  currentStreak,
  maxStreak,
  solveList,
  bestGuessImages
};

// Derived stores for convenience
export const isGameOver = derived(gameStatus, $status => $status !== 'active');
export const guessCount = derived(guesses, $guesses => $guesses.length);
export const tempGuessCount = derived(tempGuesses, $tempGuesses => $tempGuesses.length);

// Helper functions for game state management

// Start a new game in the specified mode
export function startGame(mode, options = {}) {
  gameMode.set(mode);
  gameStatus.set('active');
  
  // Reset appropriate state based on mode
  if (mode !== 'normal') {
    tempGuesses.set([]);
  }
  
  // Set mode-specific state
  if (mode === 'rewind' || mode === 'rush') {
    currentModeIndex.set(options.startIndex || 0);
  }
}

// Process a guess in the current game mode
export function processGuess(artist, mysteryArtistData) {
  const currentMode = get(gameMode);
  
  // Handle guess based on game mode
  if (currentMode === 'normal') {
    // Add to persistent guesses
    guesses.update(gs => [...gs, artist]);
    
    // Check if this was the correct guess
    if (artist.name === mysteryArtistData.name) {
      gameStatus.set('won');
      gameOver.set(true);
      handleStats(get(guessCount) - 1, true);
    } else if (get(guessCount) >= 10) {
      gameStatus.set('lost');
      gameOver.set(true);
      handleStats(get(guessCount) - 1, false);
    }
  } else {
    // For other modes, use temporary guesses
    tempGuesses.update(gs => [...gs, artist]);
    
    if (artist.name === mysteryArtistData.name) {
      if (currentMode === 'rush') {
        // Move to next artist in rush mode
        currentModeIndex.update(i => i + 1);
        tempGuesses.set([]);
      } else {
        gameStatus.set('won');
      }
    } else if (get(tempGuessCount) >= 10 && currentMode !== 'rush') {
      gameStatus.set('lost');
    }
  }
}

// Handle game statistics
function handleStats(guessCount, win) {
  played.update(p => p + 1);
  
  if (!win) {
    // Loss
    solveList.update(list => [...list, 0]);
    currentStreak.set(0);
  } else {
    // Win
    currentStreak.update(streak => streak + 1);
    solveList.update(list => [...list, guessCount + 1]);
    
    maxStreak.update(max => Math.max(max, get(currentStreak)));
    
    // Handle best guess images
    if (get(solveList).length <= 3) {
      bestGuessImages.update(images => [...images, get(mysteryArtist).image_uri]);
    } else {
      const topPerformances = [...get(solveList)]
        .filter(result => result > 0)
        .sort((a, b) => b - a)
        .slice(0, 3);
        
      if (guessCount + 1 <= topPerformances[2]) {
        bestGuessImages.update(images => {
          const newImages = [...images];
          newImages.shift();
          return [...newImages, get(mysteryArtist).image_uri];
        });
      }
    }
  }
}

// Helper function to get store value synchronously
function get(store) {
  let value;
  const unsubscribe = store.subscribe(v => value = v);
  unsubscribe();
  return value;
}