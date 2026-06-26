<script lang="ts">
  import { signOut } from "firebase/auth";
  import Board, { type Cell } from "./components/Board.svelte";
  import GameDisplay from "./components/GameDisplay.svelte";
  import { AUTH, signInGoogle, currentUser } from "./firebase";
  import { Game } from "./firebase/game.svelte";
  import { onValue } from "firebase/database";

  let activeGame = $state<Game>();
  let boardShape = $derived<Cell[] | undefined>(
    activeGame?.boardShape.map((old, idx) =>
      old
        ? {
            kind: "tile",
            tile: old.type,
            status: old.win
              ? old.type === activeGame?.tileType
                ? "win"
                : "loss"
              : undefined,
          }
        : {
            kind: "button",
            text: "",
            action: () => activeGame?.createMove(idx),
          },
    ),
  );

  $effect(() => {
    if (activeGame) {
      return onValue(activeGame.gameRef, snapshot => {
        if (!snapshot.exists()) {
          activeGame?.destroy()
          activeGame = undefined
        } 
      })
    }
  })


  let menuState: "menu" | "join" = $state("menu");

  let joinSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    let data = Object.fromEntries(
      new FormData(event.target as HTMLFormElement),
    );
    let code = data.code as string;
    activeGame = await Game.joinGame(code);
  };

  let menu: Cell[] = [
    { kind: "tile", tile: "Cross" },
    { kind: "button", text: "Join", action: () => (menuState = "join") },
    { kind: "empty" },
    {
      kind: "button",
      text: "Create",
      // action: () => (createGame = Game.createGame()),
      action: async () => (activeGame = await Game.createGame()),
    },
    { kind: "empty" },
    { kind: "button", text: "Sign Out", action: () => signOut(AUTH) },
    { kind: "empty" },
    { kind: "empty" },
    { kind: "tile", tile: "Circle" },
  ];
  let join: Cell[] = [
    { kind: "input", placeholder: "Enter Code...", onsubmit: joinSubmit },
    { kind: "empty" },
    { kind: "empty" },
    {
      kind: "button",
      text: "Go Back",
      action: () => {
        menuState = "menu";
      },
    },
    { kind: "empty" },
    { kind: "empty" },
    { kind: "empty" },
  ];
  let signin: Cell[] = [
    { kind: "button", text: "Sign In", action: () => signInGoogle() },
    { kind: "tile", tile: "Circle" },
    { kind: "empty" },
    { kind: "empty" },
    { kind: "tile", tile: "Cross" },
    { kind: "empty" },
    { kind: "empty" },
    { kind: "tile", tile: "Circle" },
    { kind: "tile", tile: "Cross" },
  ];
</script>

<div class="container">
  <div>
    {#if activeGame?.state.kind == "awaitingOpponent"}
      <p>Waiting for Opponent...</p>
      <p>Code: {activeGame.pincode}</p>
    {:else if activeGame?.state.kind == "active"}
      <GameDisplay {activeGame} />
    {/if}
  </div>
  <div class="game-board">
    <Board
      cells={$currentUser.auth
        ? boardShape
          ? boardShape
          : menuState == "menu"
            ? menu
            : menuState == "join"
              ? join
              : []
        : signin}
    />
  </div>
</div>

<style>
  .container {
    position: absolute;
    height: 100%;

    display: grid;
    grid-template-columns: 1fr 2fr;
    align-items: center;
    justify-content: space-between;
  }

  .game-board {
    width: min(70vh, 90vw);
    grid-column: 2;
    aspect-ratio: 1;
  }
</style>
