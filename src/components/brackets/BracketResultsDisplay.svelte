<script>
  export let topFinishers = {
    champion: null,
    second: null,
    third: null,
    fourth: null,
  };
  export let championTotalVotes = 0;
</script>

<div class="results-message">
  The tournament is over. Check back Monday for a new bracket!
</div>

<!-- Top 4 Results Container -->
<div class="results-container">
  <!-- Results Content -->
  <div class="results-content">
    <!-- Champion (left half) -->
    <div class="champion-section">
      <h3 class="section-header">This week's winner</h3>
      {#if topFinishers.champion}
        <div class="finisher-card champion-card">
          <img
            src={topFinishers.champion.image_url}
            alt={topFinishers.champion.label}
          />
          <div class="finisher-details">
            <div class="finisher-label">
              {topFinishers.champion.label}
              <span class="finisher-seed">#{topFinishers.champion.seed}</span>
            </div>
            {#if topFinishers.champion.sublabel}
              <div class="finisher-sublabel">
                {topFinishers.champion.sublabel}
              </div>
            {/if}
            <div class="champion-picks">Picks: {championTotalVotes}</div>
          </div>
        </div>
      {/if}
    </div>

    <!-- Podium (right half) -->
    <div class="podium-section">
      <h3 class="section-header runner-ups-header">Runner Ups</h3>
      <div class="podium-grid">
        <!-- 2nd Place (top) -->
        <div class="podium-top">
          {#if topFinishers.second}
            <div class="finisher-card podium-card">
              <div class="finisher-rank">2nd</div>
              <img
                src={topFinishers.second.image_url}
                alt={topFinishers.second.label}
              />
              <div class="finisher-details">
                <div class="finisher-label">
                  {topFinishers.second.label}
                  <span class="finisher-seed">#{topFinishers.second.seed}</span>
                </div>
                {#if topFinishers.second.sublabel}
                  <div class="finisher-sublabel">
                    {topFinishers.second.sublabel}
                  </div>
                {/if}
              </div>
            </div>
          {/if}
        </div>

        <!-- 3rd and 4th Place (bottom row) -->
        <div class="podium-bottom">
          {#if topFinishers.third}
            <div class="finisher-card podium-card">
              <div class="finisher-rank">3rd</div>
              <img
                src={topFinishers.third.image_url}
                alt={topFinishers.third.label}
              />
              <div class="finisher-details">
                <div class="finisher-label">
                  {topFinishers.third.label}
                  <span class="finisher-seed">#{topFinishers.third.seed}</span>
                </div>
                {#if topFinishers.third.sublabel}
                  <div class="finisher-sublabel">
                    {topFinishers.third.sublabel}
                  </div>
                {/if}
              </div>
            </div>
          {/if}

          {#if topFinishers.fourth}
            <div class="finisher-card podium-card">
              <div class="finisher-rank">4th</div>
              <img
                src={topFinishers.fourth.image_url}
                alt={topFinishers.fourth.label}
              />
              <div class="finisher-details">
                <div class="finisher-label">
                  {topFinishers.fourth.label}
                  <span class="finisher-seed">#{topFinishers.fourth.seed}</span>
                </div>
                {#if topFinishers.fourth.sublabel}
                  <div class="finisher-sublabel">
                    {topFinishers.fourth.sublabel}
                  </div>
                {/if}
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .results-message {
    background-color: #dc3545;
    color: #fff;
    text-align: center;
    padding: 0.75rem 1rem;
    margin: 0 auto 1rem auto;
    border-radius: 8px;
    font-weight: 600;
    max-width: 600px;
  }

  .results-container {
    max-width: 1000px;
    margin: 0 auto 1rem auto;
  }

  .results-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    align-items: stretch;
  }

  .champion-section {
    display: flex;
    flex-direction: column;
  }

  .champion-section .finisher-card {
    margin-top: 0.5rem;
  }

  .podium-section {
    display: flex;
    flex-direction: column;
  }

  .podium-grid {
    display: grid;
    grid-template-rows: 1fr 1fr;
    gap: 1rem;
    flex: 1;
    margin-top: 0.5rem;
  }

  .podium-bottom {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .podium-top {
    display: flex;
    flex-direction: column;
  }

  .finisher-card {
    background-color: #333;
    border-radius: 8px;
    padding: 0.75rem;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    text-align: left;
    position: relative;
    gap: 0.75rem;
  }

  .champion-card {
    height: 100%;
    padding: 1rem 0.75rem;
    justify-content: space-between;
  }

  .podium-card {
    height: 100%;
  }

  .finisher-rank {
    position: absolute;
    bottom: 0.5rem;
    right: 0.5rem;
    background-color: #cbff70;
    color: #000;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .finisher-card img {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    object-fit: cover;
    flex-shrink: 0;
  }

  .champion-card img {
    width: 200px;
    height: 200px;
    border: 1px solid #cbff70;
    border-radius: 8px;
    object-fit: cover;
  }

  .finisher-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
    justify-content: center;
  }

  .finisher-label {
    font-size: 1rem;
    font-weight: 600;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .champion-card .finisher-label {
    font-size: 1.2rem;
  }

  .finisher-label .finisher-seed {
    font-size: inherit;
    color: #888;
    font-weight: 500;
    margin-left: 0.5rem;
  }

  .finisher-sublabel {
    font-size: 0.8rem;
    color: #aaa;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .champion-picks {
    font-size: 0.9rem;
    color: #cbff70;
    font-weight: 600;
    margin-top: 0.5rem;
  }

  .section-header {
    font-size: 1.1rem;
    font-weight: 600;
    color: #fff;
    margin: 0;
    text-align: left;
  }

  .runner-ups-header {
    font-weight: 400;
  }

  /* Mobile Styles */
  @media (max-width: 899px) {
    .results-message {
      padding: 0.5rem 0.75rem;
      font-size: 0.9rem;
      margin: 0 0 1rem 0;
    }

    .results-container {
      margin: 0 0 1rem 0;
    }

    .podium-section .section-header {
      margin-bottom: 0;
    }

    .results-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .podium-section {
      gap: 1rem;
    }

    .podium-grid {
      gap: 1rem;
      display: flex;
      flex-direction: column;
      margin-top: -1rem;
    }

    .podium-top {
      flex: 1;
    }

    .podium-bottom {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      flex: 1;
    }

    .podium-bottom .finisher-card {
      flex: 1;
    }

    .finisher-card {
      padding: 0.75rem;
    }

    .champion-card {
      padding: 0.75rem;
      justify-content: space-between;
    }

    .finisher-card img {
      width: 50px;
      height: 50px;
    }

    .champion-card img {
      width: 150px;
      height: 150px;
      border: 1px solid #cbff70;
      border-radius: 8px;
      object-fit: cover;
    }

    .finisher-label {
      font-size: 0.9rem;
    }

    .champion-card .finisher-label {
      font-size: 1.1rem;
    }

    .section-header {
      font-size: 1rem;
      margin: 0;
      height: 2rem;
    }
  }
</style>

