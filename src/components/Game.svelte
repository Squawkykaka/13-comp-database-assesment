<script lang="ts">
  import { writable } from "svelte/store";
  import { AUTH } from "../firebase";
  import { activeGame } from "../firebase/game.svelte";
  import { LOBBY } from "../firebase/lobby.svelte";
  import GameBoard from "./GameBoard.svelte";

  let members = $derived($LOBBY?.members ?? writable<{ [t: string]: any }>({}));
  let winData = $derived($activeGame?.winData);
</script>

{#if $winData}
  <div popover="manual" id="winPopover">
    {#if $winData == "draw"}
      <p>Draw</p>
    {:else}
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
{/if}

{#if $activeGame}
  <GameBoard game={$activeGame}></GameBoard>
{/if}