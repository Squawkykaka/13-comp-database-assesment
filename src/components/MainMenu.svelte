<script lang="ts">
  import { signOut } from "firebase/auth";
  import { type Cell } from "./Board.svelte";
  import { AUTH } from "../firebase";
  import { activeGame, Game } from "../firebase/game.svelte";
  import Board from "./Board.svelte";

  let menuState: "menu" | "join" = $state("menu");

  let joinSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    let data = Object.fromEntries(
      new FormData(event.target as HTMLFormElement),
    );
    let code = data.code as string;
    activeGame.set(await Game.joinGame(code));
  };

  let menu: Cell[] = [
    { kind: "tile", tile: "Cross" },
    { kind: "button", text: "Join", action: () => (menuState = "join") },
    { kind: "empty" },
    {
      kind: "button",
      text: "Create",
      // action: () => (createGame = Game.createGame()),
      action: async () => (activeGame.set(await Game.createGame())),
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

  let createGame = $state<Promise<Game>>();
</script>

<div class="container">
  <Board cells={menuState == "menu" ? menu : menuState == "join" ? join : []} />
</div>

<style>
  .container {
    width: min(70vh, 90vw);
    aspect-ratio: 1;

    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>
