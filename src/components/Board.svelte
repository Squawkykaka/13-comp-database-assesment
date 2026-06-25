<script lang="ts">
  import type { TileType } from "../game/board.svelte";
  import Tile from "./Tile.svelte";

  export type Cell =
    | { kind: "tile"; tile: TileType; status?: "win" | "loss" }
    | { kind: "button"; text: string; action: () => void }
    | {
        kind: "input";
        placeholder: string;
        onsubmit: (event: SubmitEvent) => void;
      }
    | { kind: "empty" };

  let { cells }: { cells: Cell[] } = $props();
</script>

<div class="container">
  {#each cells as c}
    {#if c.kind == "tile"}
      <Tile tile={c.tile} status={c.status} />
    {:else if c.kind == "button"}
      <Tile message={c.text} onclick={c.action} />
    {:else if c.kind == "empty"}
      <Tile disabled />
    {:else if c.kind == "input"}
      <form id="submit-form" class="joinInput" onsubmit={c.onsubmit}>
        <input
          type="text"
          name="code"
          placeholder={c.placeholder}
          aria-label={c.placeholder}
        />
      </form>
      <Tile message="Submit" form="submit-form" />
    {/if}
  {/each}
</div>

<style>
  .container {
    height: 100%;
    aspect-ratio: 1;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 25px;
    background: black;
  }

  .joinInput {
    grid-column: span 2;
    display: grid;
    > input {
      width: 100%;
      height: 100%;
      /* box-sizing: border-box; */

      background: #d9d9d9;
      border: none;
      outline: none;
      box-shadow: none;

      font-size: 2rem;
      color: inherit;

      padding: 0 1rem;
      box-sizing: border-box;

      caret-color: currentColor; /* blinking cursor */
    }

    > input::placeholder {
      color: inherit;
      opacity: 0.5;
      font-style: italic;
    }
  }
</style>
