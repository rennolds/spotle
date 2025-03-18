<script>
    import './styles.css';
    // import { onMount } from 'svelte';
    // import { browser } from "$app/environment";

    // // Only run this on the client side
    // if (browser) {
    //   onMount(() => {
    //     // Check if we're on iOS
    //     const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        
    //     if (isIOS) {
    //       // Handle touchmove events
    //       document.body.addEventListener('touchmove', function(e) {
    //         const windowHeight = window.innerHeight;
    //         const documentHeight = document.documentElement.scrollHeight;
    //         const currentScroll = window.scrollY;
            
    //         // If there's no scroll needed (content fits within viewport)
    //         if (documentHeight <= windowHeight) {
    //           // Prevent default behavior completely
    //           e.preventDefault();
    //         } 
    //         // If at the top edge and trying to pull down
    //         else if (currentScroll <= 0 && e.touches[0].clientY > 0) {
    //           e.preventDefault();
    //         } 
    //         // If at the bottom edge and trying to pull up
    //         else if (currentScroll + windowHeight >= documentHeight && e.touches[0].clientY < 0) {
    //           e.preventDefault();
    //         }
    //       }, { passive: false });
    //     }
    //   });
    // }
  </script>
  
  <slot />