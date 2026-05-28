<script lang="ts">
  import { LOBBY_PLAYERS } from "./lobby/lobby";
  import { players } from "./models/stores";

  $: playerEntries = Object.entries($players);

  let updatePlayer = (event: SubmitEvent) => {
    let target = (event.target as HTMLFormElement)
    let formData = new FormData(target);
              LOBBY_PLAYERS.updatePlayer(
                parseInt(target.dataset.userUID),
                (info) =>
                  (info.displayName = formData.get("displayName") as string),
              )}
</script>

<ul>
  {#each playerEntries as [uid, player]}
    {#if player.type == "local"}
      <form data-userUID={uid} on:submit={updatePlayer}>
        <label for="displayName" hidden>New Name</label>
        <input type="text" name="displayName" value={player.displayName} />
        <button type="submit">Submit</button>
      </form>
    {/if}
  {/each}
</ul>
