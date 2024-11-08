<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { browser } from "$app/environment";
    
    export let PUB_ID;
    export let WEBSITE_ID;
    if (browser) {  
        let rampComponentLoaded = false;
        let lastPathname;
        onMount(() => {
          if (!PUB_ID || !WEBSITE_ID) {
            console.log('Missing Publisher Id and Website Id');
            return;
          }
          window.ramp = window.ramp || {};
          window.ramp.que = window.ramp.que || [];
          window.ramp.passiveMode = true;
          // Load the Ramp configuration script
          const configScript = document.createElement("script");
          configScript.src = `https://cdn.intergient.com/${PUB_ID}/${WEBSITE_ID}/ramp.js`;
          document.body.appendChild(configScript); // Insert before closing</body> tag
          configScript.onload = () => {
            rampComponentLoaded = true;
            window.ramp.que.push(() => {
                window.ramp.spaNewPage();
                window.ramp.addTag("standard_iab_head1");
            });
          };
        });
    
        $: if (
            rampComponentLoaded &&
            window.ramp &&
            window.ramp.spaNewPage &&
            $page.url.pathname !== lastPathname
        ) {
          lastPathname = $page.url.pathname;
          window.ramp.que.push(() => {
            window.ramp.spaNewPage($page.url.pathname);
          });
        }
    }
</script>

<div data-pw-mobi="standard_iab_head1" id="standard_iab_head1"></div>