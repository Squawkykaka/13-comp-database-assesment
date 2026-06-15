<script lang="ts">
  import { writable } from "svelte/store";
  import { activeGame } from "../firebase/game.svelte";
  import { LOBBY } from "../firebase/lobby.svelte";
  import {
    GAME_MODES,
    MULTIPLAYER_MODES,
  } from "../models/types";

  let settings = $derived(
    $LOBBY?.settings ??
      writable({
        gameMode: "Loading...",
        multiplayerType: "Loading...",
        gameStyle: "Loading...",
      }),
  );

  let error = $state("");

  let onclick = async () => {
    try {
      await $LOBBY?.startGames();
    } catch (e) {
      error = e as string;
    }
  };

  let disabled = $derived(
    $LOBBY?.isOwner == false || $activeGame !== undefined,
  );

  $inspect($activeGame);
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
          <select bind:value={$settings.gameMode} {disabled}>
            {@render options(GAME_MODES)}
          </select>
        </td>
      </tr>
      <tr>
        <th scope="row">Multiplayer Type</th>
        <td>
          <select bind:value={$settings.multiplayerType} {disabled}>
            {@render options(MULTIPLAYER_MODES)}
          </select>
        </td>
      </tr>
    </tbody>
  </table>
</section>

<button {onclick} hidden={disabled}>Start Game</button>
<p>{error}</p>
