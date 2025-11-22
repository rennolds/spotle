<script>
  import { onMount, createEventDispatcher, onDestroy } from "svelte";

  export let trackId;

  const dispatch = createEventDispatcher();

  let iframeElement;
  let widget;
  let previewTimer;

  // Public methods that can be called on the component instance
  export function play() {
    widget?.play();
  }

  export function pause() {
    widget?.pause();
  }

  export function toggle() {
    widget?.toggle();
  }

  function setupWidget() {
    if (!iframeElement || !window.SC) return;

    widget = window.SC.Widget(iframeElement);

    widget.bind(window.SC.Widget.Events.PLAY, () => {
      dispatch("play");
      // Set a timer to pause the track after 15 seconds
      clearTimeout(previewTimer); // Clear any existing timer
      previewTimer = setTimeout(() => {
        widget.pause();
      }, 15000);
    });

    widget.bind(window.SC.Widget.Events.PAUSE, () => {
      clearTimeout(previewTimer); // Clear the timer if manually paused
      dispatch("pause");
    });

    widget.bind(window.SC.Widget.Events.FINISH, () => {
      clearTimeout(previewTimer);
      dispatch("pause"); // Treat finish as a pause
    });
  }

  onMount(() => {
    // SoundCloud's widget API script needs to be loaded.
    // To avoid loading it multiple times if many players are on the page,
    // we check if it already exists.
    if (window.SC) {
      setupWidget();
    } else {
      const script = document.createElement("script");
      script.src = "https://w.soundcloud.com/player/api.js";
      script.onload = setupWidget;
      document.head.appendChild(script);
    }
  });

  onDestroy(() => {
    clearTimeout(previewTimer);
  });
</script>

<iframe
  bind:this={iframeElement}
  style="display: none;"
  title="soundcloud-player-{trackId}"
  width="100%"
  height="166"
  scrolling="no"
  frameborder="no"
  allow="autoplay"
  src={`https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${trackId}&auto_play=false&show_comments=false&hide_related=true&visual=true`}
>
</iframe>
