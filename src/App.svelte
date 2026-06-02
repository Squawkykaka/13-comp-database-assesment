<script lang="ts">
  import { LOBBY } from "./firebase/lobby.";
  import { currentUser } from "./firebase/store";
  import { userCollection } from "./firebase/user";
  import { doc, increment, updateDoc } from "firebase/firestore";

  function renderSection(
    list: Record<string, { display: string; description: string }>,
  ) {
    return Object.entries(list).map(
      ([id, settings]) => `
      <option value="${id}">${settings.display}</option>
    `,
    );
  }

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

    updateDoc(doc(userCollection, $currentUser.info?.uid), {
      displayName: formData.get("displayName") as string,
    });
  };

  let members = $derived($LOBBY.members);
  // let currentLobbyUser = $derived($LOBBY.currentUser);
</script>

{#if $LOBBY}
  <section>
    <p><strong>Code: </strong> {$LOBBY.lobbyRef.id}</p>
  </section>
  <div>
    <h3>Players: {$members.length}</h3>
    <ul>
      {#each $members as participant}
        <li>
          {#if $currentUser.auth && participant.uid == $currentUser.auth.uid}
            <form data-user-uid={participant.uid} onsubmit={updatePlayer}>
              <label for="displayName" hidden>New Name</label>
              <input
                type="text"
                name="displayName"
                value={participant.displayName}
              />
              <button type="submit">Submit</button>
            </form>
          {:else}
            <p>{participant.displayName}</p>
          {/if}

          <p><em>{participant.quote == "" ? "..." : participant.quote}</em></p>
          <p><strong>Wins:</strong> {participant.wins}</p>
          <p><strong>Losses:</strong> {participant.losses}</p>
        </li>
      {/each}
    </ul>
  </div>
{/if}

<!-- 
<section>
  <table>
    <caption>Game Options</caption>
    <tbody>
      <tr>
        <th scope="row">Game Type</th>
        <td>
          <select
            bind:value={$lobbySettings.gameType}
            disabled={$activeGame !== undefined && !$isLobbyOwner}
          >
            {@html renderSection(GAME_MODES)}
          </select>
        </td>
      </tr>
      <tr>
        <th scope="row">Multiplayer Type</th>
        <td>
          <select
            bind:value={$lobbySettings.multiplayer}
            disabled={$activeGame !== undefined && !$isLobbyOwner}
          >
            {@html renderSection(MULTIPLAYER_MODES)}
          </select>
        </td>
      </tr>
      <tr>
        <th scope="row">Game Mode</th>
        <td>
          <select
            bind:value={$lobbySettings.style}
            disabled={$activeGame !== undefined && !$isLobbyOwner}
          >
            {@html renderSection(GAME_STYLES)}
          </select>
        </td>
      </tr>
    </tbody>
  </table>

  <button onclick={startButton}>Start Game</button>

  <div id="gameBoard"></div>
  <p id="errorBar">{errorMessage}</p>
</section> -->
