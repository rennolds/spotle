<script>
  import { createEventDispatcher } from "svelte";

  export let selectionsSize = 0;
  export let matchupsInCurrentRound = 0;
  export let isSubmitting = false;

  const dispatch = createEventDispatcher();

  function handleSubmit() {
    if (!isSubmitting && selectionsSize > 0) {
      dispatch("submit");
    }
  }
</script>

<div class="submit-bar">
  <span>{selectionsSize}/{matchupsInCurrentRound} picks</span>
  <button on:click={handleSubmit} disabled={selectionsSize === 0 || isSubmitting}>
    Submit
  </button>
</div>

<style>
  .submit-bar {
    position: fixed;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    background-color: #cbff70;
    color: #121212;
    padding: 0.65rem 1rem;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    width: auto;
    min-width: 200px;
    max-width: 300px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
    z-index: 100;
    font-weight: 600;
    font-size: 0.95rem;
  }

  .submit-bar button {
    background-color: #121212;
    color: #cbff70;
    border: none;
    padding: 0.4rem 1.25rem;
    border-radius: 20px;
    font-weight: 600;
    cursor: pointer;
    font-size: 0.9rem;
    transition:
      background-color 0.2s,
      color 0.2s;
  }

  .submit-bar button:disabled {
    background-color: #333;
    color: #777;
    cursor: not-allowed;
  }

  /* Mobile Styles */
  @media (max-width: 899px) {
    .submit-bar {
      position: fixed;
      bottom: 1rem;
      right: 1rem;
      left: auto;
      transform: none;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      min-width: auto;
      width: auto;
      padding: 0.75rem 1rem;
    }

    .submit-bar span {
      font-size: 0.85rem;
    }

    .submit-bar button {
      width: 100%;
      padding: 0.5rem 1.5rem;
    }
  }
</style>

