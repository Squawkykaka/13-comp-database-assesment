<script>
  import LobbyCreator from "./components/LobbyCreator.svelte";
  import LobbyList from "./components/LobbyList.svelte";
  import PlayerList from "./components/PlayerList.svelte";
  import SettingPicker from "./components/SettingPicker.svelte";
  import SignIn from "./components/SignIn.svelte";
  import { currentUser } from "./firebase";
  import { LOBBY } from "./firebase/lobby";

  let settings = $derived($LOBBY?.settings);
</script>

{#if $currentUser.auth === undefined}
  <SignIn></SignIn>
{:else if $LOBBY}
  <PlayerList></PlayerList>
  {#if settings !== undefined}
    <SettingPicker></SettingPicker>
  {/if}
{:else}
  <h2>Join or Create a lobby</h2>
  <LobbyCreator></LobbyCreator>
  <LobbyList></LobbyList>
{/if}
