<script lang="ts">
  import type { TileType } from "../game/board";
  import Circle from "../assets/Circle.svg";
  import Cross from "../assets/Cross.svg";
  import type { HTMLButtonAttributes } from "svelte/elements";

  type Props = HTMLButtonAttributes & {
    tile?: TileType;
    message?: string;
    status?: "win" | "loss";
  };

  let { tile, status, message, ...extra }: Props = $props();
</script>

<button class={status ?? ""} {...extra}>
  {#if tile == "Circle"}
    <img src={Circle} alt="Circle tile" width="100%" />
  {:else if tile == "Cross"}
    <img src={Cross} alt="Cross tile" width="100%" />
  {:else if message}
    {message}
  {/if}
</button>

<style>
  button {
    background-color: #d9d9d9;
    border: none;
    font-size: 2rem;
    text-align: center;
    font-weight: bolder;
    width: 100%;
    aspect-ratio: 1;
    padding: 0;

    img {
      display: block;
      object-fit: contain;
      pointer-events: none;
    }
  }

  button:hover {
    filter: brightness(85%);
  }
  button:active {
    filter: brightness(75%);
  }

  .win {
    background-color: green;
  }
  .loss {
    background-color: red;
  }
</style>
