<script lang="ts">
  import { onValue, ref } from "firebase/database";
  import { Game } from "../firebase/game.svelte";
  import { RDB } from "../firebase";
  import type { GameUser } from "../models/types";

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

  $effect(() => {
    if (activeGame.state.kind == "awaitingOpponent") return;

    let selfListener = onValue(
      ref(RDB, `users/${activeGame.selfUid}`),
      (snapshot) => {
        if (!snapshot.exists()) return;
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
        if (!snapshot.exists()) return;
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
      selfListener();
      opponentListener();
    };
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
</div>

<section class="game">
  <div class="game-ui">
    <h3>
      {(activeGame.ourTurn ? current : opponent).displayName}'s Turn
    </h3>
  </div>
</section>