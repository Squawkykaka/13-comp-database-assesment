<script lang="ts">
  import { writable } from "svelte/store";
  import { AUTH } from "../firebase";
  import { activeGame } from "../firebase/game.svelte";
  import { LOBBY } from "../firebase/lobby.svelte";
  import type { LobbyMember } from "../models/types";
  import Tile from "./Tile.svelte";
  import Board from "./Board.svelte";

  let members = $derived(
    $LOBBY?.members ?? writable<{ [t: string]: LobbyMember }>({}),
  );
  let currentMember = $state($members[AUTH.currentUser?.uid ?? ""]);

  let winData = $derived($activeGame?.winData);

  async function handleClick(index: number) {
    await $activeGame.createMove(index);
  }
  let boardShape = $derived($activeGame.boardShape);
</script>

<div popover="manual" id="winPopover">
  {#if $winData == "draw"}
    <p>Draw</p>
  {:else if $winData !== undefined}
    <h4>
      Game {$winData.winnerUid == AUTH.currentUser?.uid ? "Won" : "Lost"}
    </h4>
    <table>
      <thead>
        <tr>
          <th scope="col">Winner</th>
          <th scope="col">Loser</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{$members[$winData.winnerUid]?.displayName}</td>
          <td>{$members[$winData.loserUid]?.displayName}</td>
        </tr>
      </tbody>
    </table>
  {/if}
  <p>Wait for a new game.</p>
  <button onclick={() => $LOBBY?.leave()}>Leave Lobby</button>
</div>

{#if $activeGame}
  <section class="game">
    <div class="game-ui">
      <h3>
        {($activeGame.ourTurn
          ? currentMember
          : $members[$activeGame.opponentUid]
        ).displayName}'s Turn
      </h3>
    </div>

    <div class="game-board">
      <Board>
        {#each $boardShape?.entries() as [idx, tile]}
          <Tile
            tile={tile?.type}
            onclick={() => handleClick(idx)}
            status={tile?.win
              ? tile.type === $activeGame.tileType
                ? "win"
                : "loss"
              : undefined}
          />
        {/each}
      </Board>
    </div>
  </section>
{/if}

<style>
  .game {
    position: relative;
  }

  .game-board {
    height: 70%;
    aspect-ratio: 1;
    inset: 0;
  }
</style>
