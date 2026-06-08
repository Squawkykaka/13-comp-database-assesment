<script lang="ts">
  import { child, onValue } from "firebase/database";
  import { AUTH } from "../firebase";
  import { LOBBY } from "../firebase/lobby";
  import { activeGame, Game } from "../firebase/game";

  async function handleClick(index: number) {
    await $activeGame?.createMove(index);
  }

  let activeGameRefRef = $derived(
    AUTH.currentUser
      ? child($LOBBY.lobbyRef, `members/${AUTH.currentUser?.uid}/activeGame`)
      : undefined,
  );
  let boardShape = $derived($activeGame?.boardShape);
  $effect(() => {
    if (activeGameRefRef === undefined) {
      activeGame.set(undefined);
      return;
    }
    return onValue(activeGameRefRef, async (snapshot) => {
      if (snapshot.exists()) {
        let gameId = snapshot.val() as string;

        activeGame.set(await Game.joinGame(gameId));
      }
    });
  });
</script>

<div class="container">
  {#if $activeGame}
    <p>
      {($activeGame.ourTurn ? "Our Turn" : "Their Turn") +
        $activeGame.tileType ==
      "Circle"
        ? "(O)"
        : "(X)"}
    </p>
    <div id="gameBoard">
      {#each $boardShape?.entries() as [idx, tile]}
        <button onclick={() => handleClick(idx)} aria-label="Tile {idx}"
          >{tile == "Cross" ? "X" : tile == "Circle" ? "O" : ""}</button
        >

      {/each}
    </div>
  {/if}
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
