<script lang="ts">
  import { signOut } from "firebase/auth";
  import Board, { type Cell } from "./components/Board.svelte";
  import GameDisplay from "./components/GameDisplay.svelte";
  import { AUTH, currentFirebaseUser, signInGoogle } from "./firebase";
  import { Game } from "./firebase/game.svelte";
  import { onValue } from "firebase/database";
  import { FirebaseError } from "firebase/app";
  import Leaderboard from "./components/Leaderboard.svelte";

  let errorText = $state("");
  function showError(error: FirebaseError) {
    errorText = error.message;
    console.error(`[${error.code}]: ${error.message}\n${error}`);
  }

  let activeGame = $state<Game>();
  let boardShape = $derived<Cell[] | undefined>(
    activeGame?.board.gameBoard.map((old, idx) =>
      old
        ? {
            kind: "tile",
            tile: old.tile,
            status: old.win
              ? old.tile === activeGame?.tileType
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
      return onValue(activeGame.gameRef, (snapshot) => {
        if (!snapshot.exists()) {
          activeGame?.destroy();
          activeGame = undefined;
        }
      });
    }
  });

  let menuState: "menu" | "join" | "leaderboard" = $state("menu");

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
    {
      kind: "button",
      text: "Scores",
      action: () => {
        menuState = "leaderboard";
      },
    },
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
  let signInPressed = $state(false);
  currentFirebaseUser.subscribe((user) => {
    if (user == null) {
      signInPressed = false;
    }
  });
  let signin: Cell[] = $derived([
    signInPressed
      ? { kind: "message", text: "Loading..." }
      : {
          kind: "button",
          text: "Sign In",
          action: async () => {
            signInPressed = true;
            try {
              await signInGoogle();
            } catch (error) {
              if (error instanceof FirebaseError) {
                showError(error);
              }
              signInPressed = false;
            }
          },
        },
    { kind: "tile", tile: "Circle" },
    { kind: "empty" },
    { kind: "empty" },
    { kind: "tile", tile: "Cross" },
    { kind: "empty" },
    { kind: "empty" },
    { kind: "tile", tile: "Circle" },
    { kind: "tile", tile: "Cross" },
  ]);
</script>

<div class="container">
  {#if activeGame?.state.kind == "awaitingOpponent"}
    <div>
      <p>Waiting for Opponent...</p>
      <p>Code: {activeGame.pincode}</p>
    </div>
  {:else if activeGame?.state.kind == "active"}
    <GameDisplay {activeGame} />
  {/if}
  {#if menuState == "leaderboard"}
    <Leaderboard />
    <button onclick={() => menuState = "menu"}>Go Back</button>
  {:else}
    <div class="game-board">
      <Board
        cells={$currentFirebaseUser
          ? boardShape
            ? boardShape
            : menuState == "menu"
              ? menu
              : menuState == "join"
                ? join
                : []
          : signin}
      />
      <p>{errorText}</p>
    </div>
  {/if}
</div>

<style>
  .container {
    position: absolute;
    height: 100%;
    width: 100%;

    display: grid;
    grid-template-columns: 1fr 2fr;
    align-items: center;
    justify-content: space-between;
  }

  .game-board {
    position: relative;
    width: min(70vh, 90vw);
    left: 50%;
    grid-column: 2;
    aspect-ratio: 1;
    transform: translate(-50%);
  }
</style>
