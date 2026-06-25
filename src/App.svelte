<script>
  import Game from "./components/Game.svelte";
  import MainMenu from "./components/MainMenu.svelte";
  import SignIn from "./components/SignIn.svelte";
  import { currentUser } from "./firebase";
  import { activeGame } from "./firebase/game.svelte";
</script>

{#if $currentUser.auth === undefined}
  <SignIn></SignIn>
{:else if $activeGame?.state.kind == "awaitingOpponent"}
  <p>
    Code: {$activeGame.pincode}
  </p>
{:else if $activeGame?.state.kind == "active"}
  <Game activeGame={$activeGame} />
{:else}
  <MainMenu />
{/if}
