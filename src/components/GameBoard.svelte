<script lang="ts">
  import type { Game } from "../firebase/game.svelte";
  import Tile from "./Tile.svelte";

  let { game }: { game: Game } = $props();

  async function handleClick(index: number) {
    await game.createMove(index);
  }
  let boardShape = $derived(game.boardShape);
</script>

<div class="gameBoard">
  {#each $boardShape?.entries() as [idx, tile]}
    <Tile
      tile={tile?.type}
      onclick={() => handleClick(idx)}
      status={tile?.win
        ? tile.type === game.tileType
          ? "win"
          : "loss"
        : undefined}
    />
  {/each}
</div>

<style>
  .gameBoard {
    height: 100%;
    aspect-ratio: 1/1;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 25px;
    background: black;
  }
</style>
