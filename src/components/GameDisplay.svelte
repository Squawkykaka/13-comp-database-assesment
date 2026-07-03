<script lang="ts">
  import { Game } from "../firebase/game.svelte";
  import type { GameUser } from "../models/types";

  let {
    activeGame,
    current,
    opponent,
  }: { activeGame: Game; opponent: GameUser; current: GameUser } = $props();

  let rematchTimer = $state(0);
  $effect(() => {
    if (winData === undefined) return;

    rematchTimer = 5;

    const interval = setInterval(() => {
      if (rematchTimer! <= 1) {
        rematchTimer = 0;
        clearInterval(interval);

        activeGame.reset();
        return;
      }

      rematchTimer!--;
    }, 1000);

    return () => clearInterval(interval);
  });

  let winData = $derived(activeGame.winData);
</script>

<div popover="manual" id="winPopover">
  {#if winData == "draw"}
    <p>Draw</p>
  {:else if winData !== undefined}
    <h4>
      Game {winData.winnerUid == activeGame.selfUid ? "Won" : "Lost"}
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
          <td
            >{winData.loserUid == opponent.uid
              ? opponent.displayName
              : current.displayName}</td
          >
          <td
            >{winData.loserUid == opponent.uid
              ? current.displayName
              : opponent.displayName}</td
          >
        </tr>
      </tbody>
    </table>
  {/if}
  <p>Wait for a new game.</p>
  <button onclick={() => activeGame.reset()} hidden={!activeGame.isOwner}
    >Rematch</button
  >
  <p>{rematchTimer}</p>
</div>

<div class="game-ui">
  <h3>
    {activeGame.ourTurn ? "Your" : opponent.displayName + "'s"} Turn
  </h3>
  {#if activeGame.ourTurn ? current.photoURL : opponent.photoURL}
    <img
      src={activeGame.ourTurn ? current.photoURL : opponent.photoURL}
      alt="profile"
      class="profileImage"
    />
  {/if}
</div>

<style>
  .game-ui {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    width: 100%;
  }
  .profileImage {
    border: 25px solid black;
    border-radius: 100%;
    height: min(50%, 100px);
    aspect-ratio: 1;
  }
</style>
