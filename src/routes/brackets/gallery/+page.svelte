<script>
  import moment from "moment";

  /** @type {import('./$types').PageData} */
  export let data;

  function formatDate(dateString) {
    return moment(dateString).format("MMMM D, YY");
  }
</script>

<div class="gallery-page">
  <div class="gallery-header">
    <h1>Bracket Gallery</h1>
    <p>View past tournaments and create your own picks.</p>
  </div>

  {#if data.brackets && data.brackets.length > 0}
    <div class="brackets-grid">
      {#each data.brackets as bracket}
        <a
          href={`/brackets/gallery/${bracket.slug || bracket.id}`}
          class="bracket-tile"
        >
          <h2>{bracket.title}</h2>
          <p>Week of {formatDate(bracket.anchor_sunday)}</p>
        </a>
      {/each}
    </div>
  {:else}
    <p class="no-brackets-message">
      There are no past brackets to display yet. Check back after the current
      tournament concludes!
    </p>
  {/if}
</div>

<style>
  .gallery-page {
    padding: 1rem;
    color: #fff;
    max-width: 1200px;
    margin: 0 auto;
  }

  .gallery-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .gallery-header h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }

  .gallery-header p {
    font-size: 1.1rem;
    color: #aaa;
  }

  .brackets-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .bracket-tile {
    background-color: #1e1e1e;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 1.5rem;
    text-decoration: none;
    color: #fff;
    transition:
      transform 0.2s ease,
      border-color 0.2s ease;
  }

  .bracket-tile:hover {
    transform: translateY(-5px);
    border-color: #cbff70;
  }

  .bracket-tile h2 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: #cbff70;
  }

  .bracket-tile p {
    color: #aaa;
  }

  .no-brackets-message {
    text-align: center;
    font-size: 1.1rem;
    color: #888;
    padding: 2rem;
  }
</style>
