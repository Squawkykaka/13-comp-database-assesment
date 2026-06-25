<script lang="ts">
  import { onValue, ref } from "firebase/database";
  import { Game } from "../firebase/game.svelte";
  import Board from "./Board.svelte";
  import { RDB } from "../firebase";
  import type { GameUser } from "../models/types";
  import Tile from "./Tile.svelte";

  let { activeGame }: { activeGame: Game } = $props();

  let opponent = $state<GameUser>({
    displayName: "Loading...",
    joinDate: new Date(),
    quote: "Are we there yet?",
    uid: "676767676767",
  });
  let current = $state<GameUser>({
    displayName: "Loading...",
    joinDate: new Date(),
    quote: "Are we there yet?",
    uid: "676767676767",
  });

  $inspect(opponent, current)
  $effect(() => {
    if (activeGame.state.kind == "awaitingOpponent") return;

    let selfListener = onValue(
      ref(RDB, `users/${activeGame.selfUid}`),
      (snapshot) => {
        if (!snapshot.exists()) return
        let data = snapshot.val();

        current = {
          displayName: data.displayName,
          photoURL: data.photoURL,
          joinDate: data.joinDate,
          quote: data.quote,
          uid: snapshot.key!,
        };
      },
    );
    let opponentListener = onValue(
      ref(RDB, `users/${activeGame.state.opponentUid}`),
      (snapshot) => {
        if (!snapshot.exists()) return
        let data = snapshot.val();
        opponent = {
          displayName: data.displayName,
          photoURL: data.photoURL,
          joinDate: data.joinDate,
          quote: data.quote,
          uid: snapshot.key!,
        };
      },
    );

    return () => {
      selfListener()
      opponentListener()
    }
  });

  let winData = $derived(activeGame.winData);
  let boardShape = $derived(activeGame.boardShape);

  async function handleClick(index: number) {
    await activeGame.createMove(index);
  }
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
          <td>{winData.loserUid == opponent.uid ? opponent.displayName : current.displayName}</td>
          <td>{winData.loserUid == opponent.uid ? current.displayName : opponent.displayName}</td>
        </tr>
      </tbody>
    </table>
  {/if}
  <p>Wait for a new game.</p>
  <!-- <button onclick={() => LOBBY?.leave()}>Leave Lobby</button> -->
</div>

{#if activeGame}
  <section class="game">
    <div class="game-ui">
      <h3>
        {(activeGame.ourTurn ? current : opponent).displayName}'s
        Turn
      </h3>
    </div>

    <div class="game-board">
      <Board>
        {#each boardShape?.entries() as [idx, tile]}
          <Tile
            tile={tile?.type}
            onclick={() => handleClick(idx)}
            status={tile?.win
              ? tile.type === activeGame.tileType
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
