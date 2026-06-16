<script lang="ts">
  import { writable } from "svelte/store";
  import { AUTH } from "../firebase";
  import { activeGame } from "../firebase/game.svelte";
  import { LOBBY } from "../firebase/lobby.svelte";
  import GameBoard from "./GameBoard.svelte";
  import type { LobbyMember } from "../models/types";

  let members = $derived(
    $LOBBY?.members ?? writable<{ [t: string]: LobbyMember }>({}),
  );
  let currentMember = $state($members[AUTH.currentUser?.uid ?? ""]);
  let winData = $derived($activeGame?.winData);
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
      <div>
        <GameBoard game={$activeGame}></GameBoard>
      </div>
    </div>
  </section>
{/if}

<style>
  .game {
    position: relative;
  }

  .game-board {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;

    > div {
      height: 80%;
      aspect-ratio: 1;
      max-width: 80%;
    }
  }
</style>
