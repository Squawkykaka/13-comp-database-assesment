<script lang="ts">
  import { signOut } from "firebase/auth";
  import Board from "./Board.svelte";
  import Tile from "./Tile.svelte";
  import { AUTH } from "../firebase";
  import { activeGame, Game } from "../firebase/game.svelte";

  let menuState: "menu" | "join" = $state("menu");

  let joinSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    let data = Object.fromEntries(
      new FormData(event.target as HTMLFormElement),
    );
    let code = data.code as string;
    activeGame.set(await Game.joinGame(code));
  };
</script>

<div class="container">
  {#if menuState === "join"}
    <Board>
      <form id="join-form" class="joinInput" onsubmit={joinSubmit}>
        <input
          type="text"
          name="code"
          placeholder="Enter Code..."
          aria-label="join code"
        />
      </form>

      <Tile message="Submit" type="submit" form="join-form" />

      <Tile disabled />
      <Tile disabled />
      <Tile
        message="Go Back"
        onclick={() => {
          menuState = "menu";
        }}
      />
      <Tile disabled />
      <Tile disabled />
      <Tile disabled />
    </Board>
  {:else if menuState == "menu"}
    <Board>
      <Tile tile="Cross" />
      <Tile
        message="Join"
        onclick={() => {
          menuState = "join";
        }}
      />
      <Tile disabled />
      <Tile
        message="Create"
        onclick={async () => {
          activeGame.set(await Game.createGame())
        }}
      />
      <Tile disabled />
      <Tile
        message="Sign Out"
        onclick={() => {
          signOut(AUTH);
        }}
      />
      <Tile disabled />
      <Tile disabled />
      <Tile tile="Circle" />
    </Board>
  {/if}
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

  :global(.joinInput) {
    grid-column: span 2;
    display: grid;
    > input {
      width: 100%;
      height: 100%;
      /* box-sizing: border-box; */

      background: #d9d9d9;
      border: none;
      outline: none;
      box-shadow: none;

      font-size: 2rem;
      color: inherit;

      padding: 0 1rem;
      box-sizing: border-box;

      caret-color: currentColor; /* blinking cursor */
    }

    > input::placeholder {
      color: inherit;
      opacity: 0.5;
      font-style: italic;
    }
  }
</style>
