<script lang="ts">
  import UserInfo from "./components/UserInfo.svelte";
  import { userCollection } from "./firebase/user";
  import { beginGames } from "./game/lobbySplitting";
  import { SiteError } from "./models/error";
  import {
    GAME_MODES,
    GAME_STYLES,
    MULTIPLAYER_MODES,
  } from "./models/gameSettings";
  import {
    activeGame,
    authReady,
    firebaseAuthUser,
    lobbySettings,
    lobbyMembers,
    isLobbyOwner,
    currentUser,
  } from "./models/stores";
  import { doc, increment, updateDoc } from "firebase/firestore";

  let playerEntries = $derived(
    Object.entries($lobbyMembers).sort(([_, a], [__, b]) =>
      a.uid == $firebaseAuthUser?.uid ? 1 : a.wins + b.wins,
    ),
  );
  let errorMessage = $state("");
  activeGame.subscribe((stuff) => console.log(stuff));
  lobbySettings.subscribe((stuff) => console.log(stuff));

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

    // if its null return itself, otherwise update the displayName
    updateDoc(doc(userCollection, $currentUser?.uid), {
      displayName: formData.get("displayName") as string,
      wins: increment(5)
    });
  };

  let startButton = () => {
    try {
      beginGames();
    } catch (error) {
      if (error instanceof SiteError) {
        errorMessage = error.message;
      }
    }
  };
</script>

<div>
  {#if $authReady}
    <p>{$firebaseAuthUser?.email}</p>
  {:else}
    <p>Loading...</p>
  {/if}
</div>

<UserInfo></UserInfo>
<div>
  <h3>Players: {playerEntries.length}</h3>
  <ul>
    {#each playerEntries as [uid, player]}
      <li>
        {#if $firebaseAuthUser && player.uid == $firebaseAuthUser.uid}
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
</section>
