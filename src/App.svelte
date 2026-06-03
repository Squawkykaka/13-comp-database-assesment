<script>
  import PlayerList from "./components/PlayerList.svelte";
  import SettingPicker from "./components/SettingPicker.svelte";
  import { LOBBY } from "./firebase/lobby";

  let settings = $derived($LOBBY?.settings);
</script>

{#if $LOBBY}
  <PlayerList></PlayerList>
  {#if $settings !== undefined}
    <SettingPicker></SettingPicker>
  {/if}
{/if}
