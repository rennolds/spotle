<script>
  export let topFinishers = { champion: null };
  export let currentRound = 0;
  export let roundNames = {};
  export let getRoundDate = () => "";
</script>

<div
  class="round-container desktop-only-column champion-column"
  id="round-6"
  class:results-mode={currentRound === 6}
>
  <div class="round-header">
    <h2>{roundNames[6]}</h2>
    <span class="round-date">
      {currentRound === 6 ? getRoundDate(5) : "TBD"}
    </span>
  </div>
  <div class="matchups-column champion-single">
    <div class="champion-item-wrapper">
      <div class="item champion-item">
        <span class="seed">
          {currentRound === 6 && topFinishers.champion
            ? topFinishers.champion.seed
            : ""}
        </span>
        <div class="item-content">
          <div class="image-wrapper">
            <img
              src={currentRound === 6 && topFinishers.champion
                ? topFinishers.champion.image_url
                : "/resources/cd.png"}
              alt={currentRound === 6 && topFinishers.champion
                ? topFinishers.champion.label
                : "TBD"}
            />
          </div>
          <div class="item-details">
            <span class="label">
              {currentRound === 6 && topFinishers.champion
                ? topFinishers.champion.label
                : "TBD"}
            </span>
            {#if currentRound === 6 && topFinishers.champion && topFinishers.champion.sublabel}
              <span class="sublabel">{topFinishers.champion.sublabel}</span>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .champion-column {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .champion-single {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .champion-item-wrapper {
    width: 250px; /* Same width as matchup-card */
  }

  .champion-item {
    cursor: default;
    pointer-events: none;
    width: 100%;
    background: linear-gradient(
      135deg,
      rgba(40, 40, 40, 0.9) 0%,
      rgba(20, 20, 20, 0.95) 100%
    );
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 0;
    border-radius: 10px;
    position: relative;
    transition: all 0.2s ease;
    overflow: visible;
    min-height: 68px;
    box-shadow:
      inset 0 1px 1px rgba(255, 255, 255, 0.1),
      inset 0 4px 12px rgba(0, 0, 0, 0.6),
      inset 0 -1px 2px rgba(255, 255, 255, 0.08),
      0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .seed {
    position: absolute;
    left: -2rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.85rem;
    color: #888;
    width: 1.5rem;
    text-align: right;
    flex-shrink: 0;
    z-index: 3;
  }

  .item-content {
    display: flex;
    align-items: stretch;
    width: 100%;
    position: relative;
    z-index: 2;
    min-height: 68px;
    overflow: hidden;
    border-radius: 10px;
  }

  .image-wrapper {
    position: relative;
    flex-shrink: 0;
    width: 68px;
    height: 100%;
    padding: 4px;
  }

  .image-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    border-radius: 6px;
  }

  .item-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    overflow: hidden;
    text-align: left;
    flex-grow: 1;
    padding: 0.5rem;
    justify-content: center;
  }

  .label {
    font-size: 0.95rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sublabel {
    font-size: 0.8rem;
    color: #888;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .round-header {
    margin-bottom: 1rem;
  }

  .round-header h2 {
    font-size: 1.2rem;
    margin: 0;
    color: #aaa;
    text-align: center;
  }

  .round-date {
    font-size: 0.8rem;
    color: #777;
  }

  .matchups-column {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    justify-content: space-around;
    height: 100%;
  }

  .desktop-only-column {
    display: flex;
  }

  /* Mobile - Hide champion column */
  @media (max-width: 899px) {
    .desktop-only-column {
      display: none !important;
    }
  }

  /* Desktop - Hide round header (shown in nav bar) */
  @media (min-width: 900px) {
    .round-header {
      display: none;
    }
  }
</style>

