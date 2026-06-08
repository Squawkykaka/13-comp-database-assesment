<script>
  import GameBoard from "./components/GameBoard.svelte";
  import LobbyCreator from "./components/LobbyCreator.svelte";
  import LobbyList from "./components/LobbyList.svelte";
  import PlayerList from "./components/PlayerList.svelte";
  import SettingPicker from "./components/SettingPicker.svelte";
  import SignIn from "./components/SignIn.svelte";
  import { currentUser } from "./firebase";
  import { LOBBY } from "./firebase/lobby";
</script>

{#if $currentUser.auth === undefined}
  <SignIn></SignIn>
{:else if $LOBBY}
  <div class="container">
    <section class="settings">
      <PlayerList />
      <SettingPicker />
    </section>

    <section class="board-area">
      <GameBoard />
    </section>
  </div>
{:else}
  <h2>Join or Create a lobby</h2>
  <LobbyCreator></LobbyCreator>
  <LobbyList></LobbyList>
{/if}

<style>
  .container {
    display: grid;
    grid-template-columns: 1fr 3fr;
    width: 100%;
  }

  .settings {
    grid-column: 1;
  }

  .board-area {
    /* grid-column: 2; */
    display: flex;
    justify-content: center;
  }
</style>
