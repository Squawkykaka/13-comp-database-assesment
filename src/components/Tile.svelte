<script lang="ts">
  import Circle from "../assets/Circle.svg";
  import Cross from "../assets/Cross.svg";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import { scale } from "svelte/transition";
  import type { TileType } from "../firebase/board.svelte";
  
  type Props = HTMLButtonAttributes & {
    tile?: TileType;
    message?: string;
    status?: "win" | "loss";
  };

  let {
    tile,
    status,
    message,
    class: className = "",
    ...extra
  }: Props = $props();
</script>

<button
  class:win={status === "win"}
  class:loss={status === "loss"}
  class={className}
  disabled={tile !== undefined}
  {...extra}
>
  {#if tile}
    <img
      src={tile == "Circle" ? Circle : Cross}
      alt="{tile} tile"
      width="100%"
      transition:scale={{
        duration: 200,
        start: 1.3
      }}
    />
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
    padding: 0;

    img {
      display: block;
      object-fit: contain;
      pointer-events: none;
    }
  }

  button:not(:disabled):hover {
    filter: brightness(85%);
  }

  button:not(:disabled):active {
    filter: brightness(75%);
  }

  .win {
    background-color: green;
  }
  .loss {
    background-color: red;
  }
</style>
