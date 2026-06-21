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
