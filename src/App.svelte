<script>
  import Game from "./components/Game.svelte";
  import LobbyCreator from "./components/LobbyCreator.svelte";
  import LobbyList from "./components/LobbyList.svelte";
  import MainMenu from "./components/MainMenu.svelte";
  import PlayerList from "./components/PlayerList.svelte";
  import SettingPicker from "./components/SettingPicker.svelte";
  import SignIn from "./components/SignIn.svelte";
  import Tile from "./components/Tile.svelte";
  import { AUTH, currentUser } from "./firebase";
  import { activeGame } from "./firebase/game.svelte";
  import { LOBBY } from "./firebase/lobby.svelte";

  let members = $derived($LOBBY?.members);
  let readyStatus = $derived(
    AUTH.currentUser ? $members?.[AUTH.currentUser.uid]?.ready : false,
  );
</script>

{#if $currentUser.auth === undefined}
  <SignIn></SignIn>
{:else if $LOBBY}
  <div class="container">
    <section class="settings {$LOBBY.locked ? 'locked' : ''}">
      <p hidden={!$LOBBY.locked}>Lobby Locked</p>
      {#if $LOBBY?.isOwner}
        <section>
          <p><strong>Code: </strong> {$LOBBY.lobbyCode}</p>
        </section>
      {/if}
      <PlayerList lobby={$LOBBY} />
      <SettingPicker />
      <button
        onclick={() => ($LOBBY.ready = !readyStatus)}
        hidden={$activeGame !== undefined}
        >{AUTH.currentUser
          ? readyStatus
            ? "Unready"
            : "Ready Up"
          : "Loading..."}</button
      >
    </section>

    <Game />
  </div>
{:else}
  <!-- <h2>Join or Create a lobby</h2> -->
  <LobbyCreator></LobbyCreator>
  <!-- <LobbyList></LobbyList> -->
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
