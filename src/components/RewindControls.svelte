<script>
    import { createEventDispatcher } from 'svelte';
    import Icon from '../routes/Icon.svelte'; // Assuming we keep the Icon component where it is for now
    
    export let currentIndex = 0;
    export let maxIndex = 5;
    export let dates = [];
    
    const dispatch = createEventDispatcher();
    
    function handlePrevious() {
      if (currentIndex > 0) {
        dispatch('previous');
      }
    }
    
    function handleNext() {
      if (currentIndex < maxIndex) {
        dispatch('next');
      }
    }
  </script>
  
  <div class="rewind-btn-container">
    <button
      class="previous-btn"
      on:click={handlePrevious}
      disabled={currentIndex === 0}
    >
      <Icon width={".85rem"} height={".85rem"} name={"previous"}></Icon>
    </button>
    <div class="rewind-date">
      {dates[currentIndex] || ''}
    </div>
    <button
      class="next-btn"
      on:click={handleNext}
      disabled={currentIndex === maxIndex}
    >
      <Icon width={".85rem"} height={".85rem"} name={"next"}></Icon>
    </button>
  </div>
  
  <style>
    .rewind-btn-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding-bottom: 10px;
      width: 200px;
      margin: 0 auto;
    }
  
    .previous-btn, .next-btn {
      color: #fff;
      background: none;
      border: none;
      position: relative !important;
      cursor: pointer;
    }
    
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  
    .previous-btn {
      flex-direction: start;
    }
  
    .next-btn {
      flex-direction: end;
    }
  
    .rewind-date {
      color: #fff;
      text-align: center;
    }
  </style>