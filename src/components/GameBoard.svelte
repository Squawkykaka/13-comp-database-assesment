<script lang="ts">
  import { child, onValue } from "firebase/database";
  import { AUTH } from "../firebase";
  import { LOBBY } from "../firebase/lobby.svelte";
  import { activeGame, Game } from "../firebase/game.svelte";

  async function handleClick(index: number) {
    await $activeGame?.createMove(index);
  }

  let activeGameRefRef = $derived(
    AUTH.currentUser && $LOBBY
      ? child($LOBBY.lobbyRef, `members/${AUTH.currentUser?.uid}/activeGame`)
      : undefined,
  );
  let members = $derived($LOBBY?.members);

  let winData = $derived($activeGame?.winData);
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

{#if $LOBBY && $activeGame && $members}
  <div class="container">
    <div popover="manual" id="winPopover">
      <h4>Game Won</h4>
      {#if $winData == "draw"}
        <p>Draw</p>
      {:else if $winData !== undefined}
        <p>
          Winner: {$members[$winData.winnerUid].displayName}
          Loser: {$members[$winData.loserUid].displayName}
        </p>
      {/if}
      <p>Wait for a new game.</p>
      <button>Leave Lobby</button>
    </div>
    <p>
      {($activeGame.ourTurn
        ? "Our Turn"
        : `${$members[$activeGame.opponentUid].displayName}'s Turn`) +
        ($activeGame.ourTurn
          ? $activeGame.tileType === "Circle"
            ? " (O)"
            : " (X)"
          : $activeGame.tileType === "Circle"
            ? " (X)"
            : " (O)")}
    </p>
    <div id="gameBoard">
      {#each $boardShape?.entries() as [idx, tile]}
        <button
          onclick={() => handleClick(idx)}
          aria-label="Tile {idx}"
          class={tile?.win ? `winner-${tile.type}` : ""}
          >{tile?.type == "Cross"
            ? "X"
            : tile?.type == "Circle"
              ? "O"
              : ""}</button
        >
      {/each}
    </div>
  </div>
{/if}

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
