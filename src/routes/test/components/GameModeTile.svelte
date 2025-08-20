<script>
  import { createEventDispatcher } from "svelte";
  import Icon from "../Icon.svelte";

  export let title = "";
  export let description = "";
  export let backgroundImage = "";
  export let iconName = "";
  export let buttonText = "Play";

  const dispatch = createEventDispatcher();

  function handleClick() {
    dispatch("select");
  }
</script>

<div class="module" on:click={handleClick}>
  <div class="module-image" style="background-image: url({backgroundImage})">
    <div class="module-header">{title}</div>
    <div class="module-icon">
      <Icon width={"1.75rem"} height={"1.75rem"} name={iconName}></Icon>
    </div>
    <button class="styled-btn module-btn">{buttonText}</button>
  </div>
  <div class="module-description">
    <p>{description}</p>
  </div>
</div>

<style>
  .module {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 340px;
    margin: 0 auto 50px;
    position: relative;
    cursor: pointer;
    font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  }

  .module-image {
    position: relative;
    width: 100%;
    max-width: 329px;
    height: 135px;
    margin-bottom: 0;
    padding-bottom: 0;
    border-radius: 5px 5px 0 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-position: center;
    background-size: contain;
  }

  .module-header {
    position: absolute;
    top: 10px;
    left: 10px;
    color: #fff;
    font-size: 24px;
    font-style: normal;
    font-weight: 800;
    line-height: normal;
    font-family: inherit;
    width: auto;
    text-align: left;
  }

  .module-btn {
    margin-top: 20px;
  }

  .module-icon {
    position: absolute;
    top: 10px;
    right: 10px;
  }

  .module-description {
    width: 100%;
    max-width: 329px;
    height: 60px;
    border-radius: 0 0 5px 5px;
    background: #2f2f2f;
    margin-top: 0;
    padding-top: 0;
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  .module-description p {
    color: #fff;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    text-align: left;
    padding-right: 5%;
    margin-left: 10px;
    margin-top: 0;
    font-family: inherit;
  }

  .styled-btn {
    width: 170px;
    height: 47px;
    color: #fff;
    text-align: center;
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    background-color: #8370de;
    font-size: 15px;
    position: relative;
    border-radius: 100px;
    border: none;
    cursor: pointer;
    font-family: inherit;
  }

  .styled-btn:hover {
    transform: scale(1.05);
  }
</style>
