<script lang="ts">
  import UserInfo from "./components/UserInfo.svelte";
  import { beginGames } from "./game/lobbySplitting";
  import { LOBBY_PLAYERS } from "./lobby/lobby";
  import { SiteError } from "./models/error";
  import { firebaseUser, players } from "./models/stores";

  let playerEntries = $derived(
    Object.entries($players).sort(([_, a], [__, b]) => a.wins + b.wins),
  );
  let errorMessage = $state("");

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

    LOBBY_PLAYERS.updatePlayer(
      parseInt(uid),
      (info) => (info.displayName = formData.get("displayName") as string),
    );
  };

  let startButton = (event: SubmitEvent) => {
    event.preventDefault();

    try {
      beginGames();
    } catch (error) {
      if (error instanceof SiteError) {
        errorMessage = error.message;
      }
    }
  };
</script>

<UserInfo></UserInfo>
<div>
  <h3>Players: {playerEntries.length}</h3>
  <ul>
    {#each playerEntries as [uid, player]}
      <li>
        {#if $firebaseUser && player.userUID == $firebaseUser.uid}
          <form data-user-uid={uid} onsubmit={updatePlayer}>
            <label for="displayName" hidden>New Name</label>
            <input type="text" name="displayName" value={player.displayName} />
            <button type="submit">Submit</button>
          </form>
        {:else}
          <p>{player.displayName}</p>
        {/if}

        <p><strong>Wins:</strong> {player.wins}</p>
        <p><strong>Losses:</strong> {player.losses}</p>
      </li>
    {/each}
  </ul>
</div>

<section>
  <table>
    <caption>Game Options</caption>
    <tbody>
      <tr>
        <th scope="row">Game Type</th>
        <td>
          <select name="gameType" id="gameType"></select>
        </td>
      </tr>
      <tr>
        <th scope="row">Multiplayer Type</th>
        <td>
          <select name="Multiplayer" id="multiplayer"></select>
        </td>
      </tr>
      <tr>
        <th scope="row">Game Mode</th>
        <td>
          <select name="gameStyle" id="gameStyle"></select>
        </td>
      </tr>
    </tbody>
  </table>

  <form onsubmit={startButton}>
    <button type="submit">Start Game</button>
  </form>

  <div id="gameBoard"></div>
  <p id="errorBar">{errorMessage}</p>
</section>
