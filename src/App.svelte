<script>
  import PlayerList from "./components/PlayerList.svelte";
  import SettingPicker from "./components/SettingPicker.svelte";
  import { currentUser } from "./firebase";
  import { LOBBY } from "./firebase/lobby";

  let settings = $derived($LOBBY?.settings);
</script>

{#if $currentUser.auth == undefined}
  <p>Sign in</p>
{:else if $LOBBY}
  <PlayerList></PlayerList>
  {#if settings !== undefined}
    <SettingPicker></SettingPicker>
  {/if}
{:else}
  <h1>Loading...</h1>
{/if}
