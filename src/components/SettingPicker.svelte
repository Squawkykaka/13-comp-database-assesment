<script lang="ts">
  import { currentUser } from "../firebase";
  import { LOBBY } from "../firebase/lobby";
  import {
    GAME_MODES,
    GAME_STYLES,
    MULTIPLAYER_MODES,
  } from "../models/gameSettings";

  let isLobbyOwner = $derived($currentUser.auth?.uid == $LOBBY.owner.uid);
  let settings = $derived($LOBBY?.settings);
  $inspect($settings)
</script>

{#snippet options(input: { [s: string]: any })}
  {#each Object.entries(input) as [id, settings]}
    <option value={id}>{settings.display}</option>
  {/each}
{/snippet}

<section>
  <table>
    <caption>Game Options</caption>
    <tbody>
      <tr>
        <th scope="row">Game Mode</th>
        <td>
          <select
            bind:value={$settings.gameMode}
            disabled={!isLobbyOwner}
          >
            {@render options(GAME_MODES)}
          </select>
        </td>
      </tr>
      <tr>
        <th scope="row">Multiplayer Type</th>
        <td>
          <select
            bind:value={$settings.multiplayerType}
            disabled={!isLobbyOwner}
          >
            {@render options(MULTIPLAYER_MODES)}
          </select>
        </td>
      </tr>
      <tr>
        <th scope="row">Game Mode</th>
        <td>
          <select
            bind:value={$settings.gameStyle}
            disabled={!isLobbyOwner}
          >
            {@render options(GAME_STYLES)}
          </select>
        </td>
      </tr>
    </tbody>
  </table>
</section>
