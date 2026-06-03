<script lang="ts">
  import { currentUser } from "../firebase";
  import { LOBBY } from "../firebase/lobby";

  let updatePlayer = (event: SubmitEvent) => {
    event.preventDefault();
    let target = event.target as HTMLFormElement;
    let uid = target.dataset.userUid;
    if (uid === undefined) {
      console.error(
        "Form listener does not have userUID data, this should never happen",
      );
      return;
    }

    let formData = new FormData(target);

    $currentUser.updateDisplay(formData.get("displayName") as string);
  };

  let members = $derived(Object.entries($LOBBY.members));
</script>

<section>
  <p><strong>Code: </strong> {$LOBBY.lobbyCode}</p>
</section>
<div>
  <h3>Players: {members.length}</h3>
  <ul>
    {#each members as [uid, participant]}
      <li>
        {#if $currentUser.auth && uid == $currentUser.auth.uid}
          <form data-user-uid={uid} onsubmit={updatePlayer}>
            <label for="displayName" hidden>New Name</label>
            <input
              type="text"
              name="displayName"
              value={participant.displayName}
            />
            <button type="submit">Submit</button>
          </form>
        {:else}
          <p>Name: {participant.displayName}</p>
        {/if}

        <p><em>{participant.quote == "" ? "..." : participant.quote}</em></p>
        <p><strong>Wins:</strong> {participant.wins}</p>
        <p><strong>Losses:</strong> {participant.losses}</p>
      </li>
    {/each}
  </ul>
</div>
