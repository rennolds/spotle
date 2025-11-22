<script>
  export let bracket = null;
  export let pageError = "";
  export let currentRound = 0;
  export let hasVotedInCurrentRound = false;
  export let totalVotes = 0;
  export let timeRemaining = "";
</script>

{#if bracket}
  <div class="bracket-header">
    <div class="header-column title-column">
      <h1>{bracket.title}</h1>
      {#if pageError}
        <div class="status-pill error">{pageError}</div>
      {:else if currentRound > 0 && hasVotedInCurrentRound}
        <div class="status-pill voted desktop-only">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"
              fill="currentColor"
            />
          </svg>
          Votes submitted
        </div>
      {/if}
    </div>

    <div class="desktop-stats">
      <div class="header-column votes-column">
        <div class="column-label">Votes</div>
        <div class="column-value">{totalVotes.toLocaleString()}</div>
      </div>

      <div class="header-column timer-column">
        <div class="column-label">Next Round</div>
        <div class="column-value">
          {#if currentRound === 6}
            0:00
          {:else if timeRemaining}
            {timeRemaining}
          {:else}
            0:00
          {/if}
        </div>
      </div>
    </div>

    <div class="mobile-stats">
      <div class="header-column votes-column">
        <div class="column-label">Votes</div>
        <div class="column-value">{totalVotes.toLocaleString()}</div>
      </div>

      <div class="header-column timer-column">
        <div class="column-label">Next Round</div>
        <div class="column-value">
          {#if currentRound === 6}
            0:00
          {:else if timeRemaining}
            {timeRemaining}
          {:else}
            0:00
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .bracket-header {
    background: #000;
    border: 1px solid #666;
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
    margin: 0 auto 1rem auto;
    max-width: 600px;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 1rem;
    align-items: center;
  }

  .desktop-stats {
    display: flex;
    gap: 1rem;
  }

  .mobile-stats {
    display: none;
  }

  .header-column {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .title-column {
    align-items: flex-start;
  }

  .votes-column,
  .timer-column {
    align-items: center;
    text-align: center;
  }

  .bracket-header h1 {
    font-size: 1.4rem;
    margin: 0;
    color: #fff;
    font-weight: 600;
  }

  .column-label {
    font-size: 0.75rem;
    color: #aaa;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .column-value {
    font-size: 1.2rem;
    color: #cbff70;
    font-weight: 700;
    font-family: "Courier New", monospace;
  }

  .timer-column .column-value {
    color: #ff4444;
  }

  .status-pill {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
    white-space: nowrap;
  }

  .status-pill.error {
    background-color: #dc3545;
    color: #fff;
  }

  .status-pill.voted {
    background-color: #28a745;
    color: #fff;
  }

  .desktop-only {
    display: flex;
  }

  .votes-column,
  .timer-column {
    display: flex;
  }

  /* Mobile Styles */
  @media (max-width: 899px) {
    .desktop-only {
      display: none !important;
    }

    .bracket-header {
      padding: 0.4rem 0.75rem;
      margin: 0.5rem 1rem 0.75rem 1rem;
      max-width: none;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      text-align: left;
    }

    .title-column {
      align-items: flex-start;
    }

    .desktop-stats {
      display: none;
    }

    .mobile-stats {
      display: flex;
      gap: 1rem;
      justify-content: space-between;
    }

    .bracket-header h1 {
      font-size: 1rem;
      margin: 0;
    }

    .column-value {
      font-size: 0.95rem;
    }

    .column-label {
      font-size: 0.65rem;
    }
  }
</style>
