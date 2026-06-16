<script lang="ts">
  import type { Game } from "../firebase/game.svelte";

  let { game }: { game: Game } = $props();

  async function handleClick(index: number) {
    await game.createMove(index);
  }
  let boardShape = $derived(game.boardShape);
</script>

<div class="gameBoard">
  {#each $boardShape?.entries() as [idx, tile]}
    <button
      onclick={() => handleClick(idx)}
      aria-label="Tile {idx}"
      class={tile?.win ? `winner-${tile.type}` : ""}
    >
      {#if tile?.type == "Circle"}
        O
      {:else if tile?.type == "Cross"}
        X
      {/if}
    </button>
  {/each}
</div>

<style>
  /* Game Board */
  :global(.winner-Circle) {
    background-color: red !important;
  }
  :global(.winner-Cross) {
    background-color: green !important;
  }
  .gameBoard {
    height: 100%;
    aspect-ratio: 1/1;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 25px;
    background: black;

    > button {
      aspect-ratio: 1/1;
      border: 0;
      background-color: white;

      font-size: 140px;
      letter-spacing: 0;
    }
    > button:hover {
      background-color: gainsboro;
    }
    > button:active {
      background-color: gainsboro;
      filter: brightness(85%);
    }
    > button:disabled {
      background-color: brown;
    }
  }
</style>
