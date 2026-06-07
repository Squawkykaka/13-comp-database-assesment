<script lang="ts">
  let gameTiles = $state<{ owner: "cross" | "circle" | undefined }[]>(
    new Array(9),
  );

  function handleClick(index: number) {}
</script>

<div class="container">
  <div id="gameBoard">
    {#each gameTiles.entries() as [idx, tile]}
      <button onclick={() => handleClick(idx)} aria-label="Tile {idx}"
        >{tile?.owner == "cross"
          ? "X"
          : tile?.owner == "circle"
            ? "O"
            : ""}</button
      >
    {/each}
  </div>
</div>

<style>
  /* Game Board */
  :global(.winner-Circle) {
    background-color: red !important;
  }
  :global(.winner-Cross) {
    background-color: green !important;
  }
  .container {
    height: 700px;
    aspect-ratio: 1/1;
  }
  #gameBoard {
    flex: 0;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 10px;
    background: black;

    > button {
      flex: 0;
      min-width: 200px;
      max-width: 1/5;
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
