<script>
  // @ts-nocheck

  import Game from "./components/Game.svelte";
  import MainMenu from "./components/MainMenu.svelte";
  import SignIn from "./components/SignIn.svelte";
  import Tile from "./components/Tile.svelte";
  import { AUTH, currentUser } from "./firebase";
  import { activeGame } from "./firebase/game.svelte";

  let jsoned = $derived(JSON.stringify($activeGame));
</script>

{#if $currentUser.auth === undefined}
  <SignIn></SignIn>
{:else if $activeGame}
  {jsoned}
  {#if $activeGame.state.kind == "awaitingOpponent"}
    <p>
      Code: {$activeGame.pincode}
    </p>
  {:else if $activeGame.state.kind == "active"}
    <Game LOBBY={$LOBBY} activeGame={$activeGame} />
  {/if}
{:else}
  <MainMenu />
{/if}

<style>
  .container {
    display: grid;
    grid-template-columns: 1fr 3fr;
    height: 100vh;
  }

  .locked {
    background-color: gray;
  }

  .settings {
    grid-column: 1;
  }
</style>
