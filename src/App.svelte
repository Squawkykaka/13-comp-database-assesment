<script lang="ts">
  import { currentUser } from "./firebase";
  import { LOBBY } from "./firebase/lobby";
  import {
    GAME_MODES,
    GAME_STYLES,
    MULTIPLAYER_MODES,
  } from "./models/gameSettings";

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

    $currentUser.updateDisplay(formData.get("displayName") as string);
  };

  let lobbyMembers = $derived($LOBBY.members);
  let members = $derived(Object.entries($lobbyMembers));
  let settings = $derived(
    $LOBBY?.settings ?? {
      gameMode: "loading...",
      multiplayerType: "loading...",
      gameStyle: "loading...",
    },
  );
  let isLobbyOwner = $derived($currentUser.auth?.uid == $LOBBY.owner.uid);
</script>

{#if $LOBBY}
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

  {#if $settings !== undefined}
    <section>
      <table>
        <caption>Game Options</caption>
        <tbody>
          <tr>
            <th scope="row">Game Mode</th>
            <td>
              <select bind:value={$settings.gameMode} disabled={!isLobbyOwner}>
                {@html renderSection(GAME_MODES)}
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
                {@html renderSection(MULTIPLAYER_MODES)}
              </select>
            </td>
          </tr>
          <tr>
            <th scope="row">Game Mode</th>
            <td>
              <select bind:value={$settings.gameStyle} disabled={!isLobbyOwner}>
                {@html renderSection(GAME_STYLES)}
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  {/if}
{/if}
<!-- 
>

  <button onclick={startButton}>Start Game</button>

  <div id="gameBoard"></div>
  <p id="errorBar">{errorMessage}</p>
</section> -->
