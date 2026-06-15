<script lang="ts">
  import { AUTH, currentUser } from "../firebase";
  import { Lobby } from "../firebase/lobby.svelte";
  let { lobby }: { lobby: Lobby } = $props()

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

  let m = $derived(lobby.members);
  // sort with the current user on top, then by wins
  let members = $derived($m ? Object.entries($m).sort((a,b ) => a[0] == AUTH.currentUser?.uid ? 1 : a[1].wins - b[1].wins) : []);
  
  </script>

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
              maxlength="15"
              minlength="5"
              value={participant.displayName}
            />;
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
