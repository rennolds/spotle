<script>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  // Mock data for 32 songs/artists
  const mockSongs = [
    { id: 1, name: "Bohemian Rhapsody", artist: "Queen", votes: 156 },
    { id: 2, name: "Hotel California", artist: "Eagles", votes: 142 },
    { id: 3, name: "Stairway to Heaven", artist: "Led Zeppelin", votes: 138 },
    { id: 4, name: "Imagine", artist: "John Lennon", votes: 134 },
    { id: 5, name: "Hey Jude", artist: "The Beatles", votes: 130 },
    { id: 6, name: "Like a Rolling Stone", artist: "Bob Dylan", votes: 126 },
    { id: 7, name: "Smells Like Teen Spirit", artist: "Nirvana", votes: 122 },
    { id: 8, name: "What's Going On", artist: "Marvin Gaye", votes: 118 },
    { id: 9, name: "My Generation", artist: "The Who", votes: 114 },
    { id: 10, name: "A Change Is Gonna Come", artist: "Sam Cooke", votes: 110 },
    { id: 11, name: "Yesterday", artist: "The Beatles", votes: 106 },
    { id: 12, name: "Blowin' in the Wind", artist: "Bob Dylan", votes: 102 },
    { id: 13, name: "London Calling", artist: "The Clash", votes: 98 },
    {
      id: 14,
      name: "I Want to Hold Your Hand",
      artist: "The Beatles",
      votes: 94,
    },
    { id: 15, name: "Purple Haze", artist: "Jimi Hendrix", votes: 90 },
    { id: 16, name: "Maybellene", artist: "Chuck Berry", votes: 86 },
    { id: 17, name: "Hound Dog", artist: "Elvis Presley", votes: 82 },
    { id: 18, name: "The Twist", artist: "Chubby Checker", votes: 78 },
    { id: 19, name: "Good Vibrations", artist: "The Beach Boys", votes: 74 },
    { id: 20, name: "In My Life", artist: "The Beatles", votes: 70 },
    { id: 21, name: "People Get Ready", artist: "The Impressions", votes: 66 },
    { id: 22, name: "God Only Knows", artist: "The Beach Boys", votes: 62 },
    { id: 23, name: "Be My Baby", artist: "The Ronettes", votes: 58 },
    {
      id: 24,
      name: "In the Still of the Night",
      artist: "The Five Satins",
      votes: 54,
    },
    { id: 25, name: "Stand by Me", artist: "Ben E. King", votes: 50 },
    { id: 26, name: "Johnny B. Goode", artist: "Chuck Berry", votes: 46 },
    { id: 27, name: "I Walk the Line", artist: "Johnny Cash", votes: 42 },
    { id: 28, name: "That'll Be the Day", artist: "Buddy Holly", votes: 38 },
    { id: 29, name: "Roll Over Beethoven", artist: "Chuck Berry", votes: 34 },
    { id: 30, name: "Don't Be Cruel", artist: "Elvis Presley", votes: 30 },
    { id: 31, name: "Flying", artist: "The Chords", votes: 26 },
    {
      id: 32,
      name: "Papa's Got a Brand New Bag",
      artist: "James Brown",
      votes: 22,
    },
  ];

  // Bracket structure - 5 rounds (32 -> 16 -> 8 -> 4 -> 2 -> 1)
  let currentRound = 1;
  let maxRounds = 5;

  // Round names
  const roundNames = [
    "Round of 32",
    "Sweet Sixteen",
    "Elite Eight",
    "Final Four",
    "Championship",
  ];

  // Generate bracket matches for each round
  function generateBracket() {
    const rounds = [];

    // Round 1: 32 songs -> 16 matches with proper seeding
    // 1 vs 32, 2 vs 31, 3 vs 30, etc.
    const round1 = [];
    for (let i = 0; i < 16; i++) {
      const seed1 = i + 1;
      const seed2 = 32 - i;
      const song1 = mockSongs[seed1 - 1]; // Arrays are 0-indexed
      const song2 = mockSongs[seed2 - 1];

      round1.push({
        matchId: `r1-${i + 1}`,
        song1: { ...song1, seed: seed1 },
        song2: { ...song2, seed: seed2 },
        winner: null,
        votes1: song1.votes,
        votes2: song2.votes,
      });
    }
    rounds.push(round1);

    // Generate subsequent rounds (mock data for now)
    for (let round = 2; round <= maxRounds; round++) {
      const prevRound = rounds[round - 2];
      const currentRound = [];
      const matchesInRound = Math.pow(2, maxRounds - round);

      for (let i = 0; i < matchesInRound; i++) {
        const matchId = `r${round}-${i + 1}`;
        const song1 = prevRound[i * 2]?.winner || {
          name: "TBD",
          artist: "TBD",
          votes: 0,
        };
        const song2 = prevRound[i * 2 + 1]?.winner || {
          name: "TBD",
          artist: "TBD",
          votes: 0,
        };

        currentRound.push({
          matchId,
          song1,
          song2,
          winner: null,
          votes1: song1.votes || 0,
          votes2: song2.votes || 0,
        });
      }
      rounds.push(currentRound);
    }

    return rounds;
  }

  let bracketRounds = generateBracket();

  function handleVote(matchId, songId) {
    // Only allow voting on current round
    const currentRoundMatches = bracketRounds[currentRound - 1];
    const match = currentRoundMatches.find((m) => m.matchId === matchId);

    if (match) {
      match.winner = songId === 1 ? match.song1 : match.song2;

      // Calculate percentages
      const totalVotes = match.votes1 + match.votes2;
      match.percentage1 = Math.round((match.votes1 / totalVotes) * 100);
      match.percentage2 = Math.round((match.votes2 / totalVotes) * 100);

      bracketRounds = bracketRounds; // Trigger reactivity
    }
  }

  function nextRound() {
    if (currentRound < maxRounds) {
      currentRound++;
    }
  }

  function previousRound() {
    if (currentRound > 1) {
      currentRound--;
    }
  }
</script>

<div class="bracket-container">
  <div class="bracket-header">
    <h2>Weekly Music Bracket</h2>
    <div class="round-navigation">
      <button
        class="nav-btn"
        on:click={previousRound}
        disabled={currentRound === 1}
      >
        ← Previous
      </button>
      <span class="round-indicator">{roundNames[currentRound - 1]}</span>
      <button
        class="nav-btn"
        on:click={nextRound}
        disabled={currentRound === maxRounds}
      >
        Next →
      </button>
    </div>
  </div>

  <!-- Mobile view: Single column layout -->
  <div class="bracket-mobile">
    <div class="bracket-content">
      {#each bracketRounds[currentRound - 1] as match, index}
        <div class="match-container">
          <div class="match-header">Match {index + 1}</div>
          <div class="match">
            <div
              class="song-option {match.winner === match.song1
                ? 'winner'
                : ''} {currentRound === 1 ? 'clickable' : 'disabled'}"
              on:click={() =>
                currentRound === 1 && handleVote(match.matchId, 1)}
              style="--percentage: {match.winner ? match.percentage1 : 0}%"
            >
              <div class="seed-number">{match.song1.seed}</div>
              <div class="song-info">
                <div class="song-name">{match.song1.name}</div>
                <div class="song-artist">{match.song1.artist}</div>
              </div>
              <div class="vote-count">
                {match.winner ? match.percentage1 + "%" : ""}
              </div>
            </div>

            <div class="vs-divider">VS</div>

            <div
              class="song-option {match.winner === match.song2
                ? 'winner'
                : ''} {currentRound === 1 ? 'clickable' : 'disabled'}"
              on:click={() =>
                currentRound === 1 && handleVote(match.matchId, 2)}
            >
              <div class="seed-number">{match.song2.seed}</div>
              <div class="song-info">
                <div class="song-name">{match.song2.name}</div>
                <div class="song-artist">{match.song2.artist}</div>
              </div>
              <div class="vote-count">
                {match.winner ? match.percentage2 + "%" : ""}
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Desktop view: Traditional bracket layout -->
  <div class="bracket-desktop">
    <div class="bracket-grid">
      {#each bracketRounds as round, roundIndex}
        <div class="round-column">
          <div class="round-header">{roundNames[roundIndex]}</div>
          <div class="round-matches">
            {#each round as match, matchIndex}
              <div class="bracket-match" style="--match-index: {matchIndex}">
                <div class="match-line"></div>
                <div class="match-content">
                  <div
                    class="bracket-song {match.winner === match.song1
                      ? 'winner'
                      : ''} {currentRound === roundIndex + 1
                      ? 'clickable'
                      : 'disabled'}"
                    on:click={() =>
                      currentRound === roundIndex + 1 &&
                      handleVote(match.matchId, 1)}
                    style="--percentage: {match.winner
                      ? match.percentage1
                      : 0}%"
                  >
                    <div class="seed-number">{match.song1.seed}</div>
                    <div class="song-info">
                      <div class="song-name">{match.song1.name}</div>
                      <div class="song-artist">{match.song1.artist}</div>
                    </div>
                    <div class="vote-count">
                      {match.winner ? match.percentage1 + "%" : ""}
                    </div>
                  </div>
                  <div
                    class="bracket-song {match.winner === match.song2
                      ? 'winner'
                      : ''} {currentRound === roundIndex + 1
                      ? 'clickable'
                      : 'disabled'}"
                    on:click={() =>
                      currentRound === roundIndex + 1 &&
                      handleVote(match.matchId, 2)}
                    style="--percentage: {match.winner
                      ? match.percentage2
                      : 0}%"
                  >
                    <div class="seed-number">{match.song2.seed}</div>
                    <div class="song-info">
                      <div class="song-name">{match.song2.name}</div>
                      <div class="song-artist">{match.song2.artist}</div>
                    </div>
                    <div class="vote-count">
                      {match.winner ? match.percentage2 + "%" : ""}
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>

  <div class="bracket-footer">
    <div class="round-info">
      <p>
        {roundNames[currentRound - 1]}: {bracketRounds[currentRound - 1].length}
        matches remaining
      </p>
      <p class="round-schedule">Next round ends in 24 hours</p>
    </div>
  </div>
</div>

<style>
  .bracket-container {
    width: 100% !important;
    max-width: 1200px !important;
    margin: 0 auto !important;
    padding: 20px !important;
    color: white !important;
    position: relative !important;
  }

  .bracket-header {
    text-align: center;
    margin-bottom: 30px;
  }

  .bracket-header h2 {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 15px;
    color: white;
  }

  .round-navigation {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 20px;
  }

  .nav-btn {
    background: #cbff70;
    color: black;
    border: none;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .nav-btn:hover:not(:disabled) {
    background: #b8e65f;
  }

  .nav-btn:disabled {
    background: #444;
    cursor: not-allowed;
  }

  .round-indicator {
    font-size: 16px;
    font-weight: 600;
    color: #b5b5b5;
  }

  /* Mobile layout */
  .bracket-mobile {
    display: block;
  }

  .bracket-content {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .match-container {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 15px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .match-header {
    font-size: 14px;
    font-weight: 600;
    color: #b5b5b5;
    margin-bottom: 10px;
    text-align: center;
  }

  .match {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .song-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 15px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    border: 2px solid transparent;
    position: relative;
    overflow: hidden;
  }

  .song-option::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: var(--percentage, 0%);
    height: 100%;
    background: rgba(203, 255, 112, 0.15);
    transition: width 0.3s ease;
    z-index: 0;
  }

  .song-option > * {
    position: relative;
    z-index: 1;
  }

  .seed-number {
    font-size: 14px;
    font-weight: 700;
    color: #cbff70;
    min-width: 25px;
    text-align: center;
    margin-right: 10px;
  }

  .song-option:hover {
    background: rgba(255, 255, 255, 0.12);
    transform: translateY(-1px);
  }

  .song-option.disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .song-option.disabled:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: none;
  }

  .song-option.winner {
    border-color: #cbff70;
    background: rgba(203, 255, 112, 0.15);
  }

  .song-info {
    flex: 1;
    text-align: left;
  }

  .song-name {
    font-size: 16px;
    font-weight: 600;
    color: white;
    margin-bottom: 2px;
  }

  .song-artist {
    font-size: 14px;
    color: #b5b5b5;
  }

  .vote-count {
    font-size: 18px;
    font-weight: 700;
    color: #cbff70;
    min-width: 40px;
    text-align: right;
  }

  .vs-divider {
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    color: #666;
    margin: 5px 0;
  }

  /* Desktop bracket layout */
  .bracket-desktop {
    display: none;
  }

  .bracket-grid {
    display: flex !important;
    gap: 20px;
    overflow-x: auto;
    padding: 20px 0;
    width: 100% !important;
    max-width: none !important;
  }

  .round-column {
    min-width: 200px;
    flex-shrink: 0;
    display: flex !important;
    flex-direction: column !important;
  }

  .round-header {
    text-align: center;
    font-size: 18px;
    font-weight: 700;
    color: #cbff70;
    margin-bottom: 20px;
    padding: 10px;
    background: rgba(203, 255, 112, 0.1);
    border-radius: 8px;
  }

  .round-matches {
    display: flex;
    flex-direction: column;
    gap: 30px;
  }

  .bracket-match {
    position: relative;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;
  }

  .match-line {
    position: absolute;
    right: -20px;
    top: 50%;
    width: 20px;
    height: 2px;
    background: #cbff70;
    transform: translateY(-50%);
  }

  .match-content {
    padding: 8px;
  }

  .bracket-song {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 10px;
    cursor: pointer;
    transition: all 0.2s;
    border-radius: 4px;
    margin-bottom: 2px;
    position: relative;
    overflow: hidden;
  }

  .bracket-song::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: var(--percentage, 0%);
    height: 100%;
    background: rgba(203, 255, 112, 0.15);
    transition: width 0.3s ease;
    z-index: 0;
  }

  .bracket-song > * {
    position: relative;
    z-index: 1;
  }

  .bracket-song .seed-number {
    font-size: 11px;
    font-weight: 700;
    color: #cbff70;
    min-width: 20px;
    text-align: center;
    margin-right: 6px;
  }

  .bracket-song:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .bracket-song.disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .bracket-song.disabled:hover {
    background: transparent;
  }

  .bracket-song.winner {
    background: rgba(203, 255, 112, 0.15);
    border: 1px solid #cbff70;
  }

  .bracket-song .song-info {
    flex: 1;
    min-width: 0;
    text-align: left;
  }

  .bracket-song .song-name {
    font-size: 13px;
    font-weight: 600;
    color: white;
    margin-bottom: 1px;
    line-height: 1.2;
  }

  .bracket-song .song-artist {
    font-size: 11px;
    color: #b5b5b5;
    line-height: 1.1;
  }

  .bracket-song .vote-count {
    font-size: 12px;
    font-weight: 700;
    color: #cbff70;
    min-width: 25px;
    text-align: right;
    margin-left: 8px;
  }

  .bracket-footer {
    margin-top: 30px;
    text-align: center;
  }

  .round-info p {
    margin: 5px 0;
    color: #b5b5b5;
  }

  .round-schedule {
    font-size: 14px;
    color: #cbff70;
    font-weight: 600;
  }

  /* Desktop styles */
  @media (min-width: 768px) {
    .bracket-mobile {
      display: none !important;
    }

    .bracket-desktop {
      display: block !important;
    }

    .bracket-container {
      padding: 20px 40px !important;
      max-width: 1200px !important;
    }

    .bracket-grid {
      display: flex !important;
      flex-direction: row !important;
    }

    .round-navigation {
      display: none !important;
    }
  }

  /* Mobile optimizations */
  @media (max-width: 480px) {
    .bracket-container {
      padding: 15px;
    }

    .bracket-header h2 {
      font-size: 20px;
    }

    .song-name {
      font-size: 14px;
    }

    .song-artist {
      font-size: 12px;
    }

    .vote-count {
      font-size: 16px;
    }

    .match-container {
      padding: 12px;
    }

    .song-option {
      padding: 10px 12px;
    }
  }
</style>
