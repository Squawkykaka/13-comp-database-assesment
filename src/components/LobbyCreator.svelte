<script lang="ts">
  import { Lobby, LOBBY } from "../firebase/lobby.svelte";
  import {
    GAME_MODES,
    GAME_STYLES,
    MULTIPLAYER_MODES,
    type LobbySettings,
  } from "../models/gameSettings";

  function renderOptions(): string {
    function mapStuff(
      list: Record<string, { display: string; description: string }>,
      nameId: string,
    ) {
      return Object.entries(list).map(
        ([id, name]) => `
      <input
        type="radio"
        name="${nameId}"
        value="${id}"
        id="${id}"
        required
      />
      <label for="${id}">
        <div>
          <h3>${name.display}</h3>
          <p>${name.description}</p>
        </div>
      </label>`,
      );
    }

    let optionsFinal = `
    <div>
    ${mapStuff(GAME_MODES, "gameMode")}
    </div>
    <div>
    ${mapStuff(MULTIPLAYER_MODES, "multiplayerType")}
    </div>
    <div>
    ${mapStuff(GAME_STYLES, "gameStyle")}
    </div>
  `;

    return optionsFinal;
  }

  async function createLobby(event: SubmitEvent) {
    event.preventDefault();
    let createForm = Object.fromEntries(
      new FormData(event.target as HTMLFormElement),
    ) as LobbySettings;
    LOBBY.set(await Lobby.create(createForm));
  }
  async function joinLobby(event: SubmitEvent) {
    event.preventDefault();
    let joinForm = new FormData(event.target as HTMLFormElement).get(
      "lobbyCode",
    );
    console.log(joinForm);

    LOBBY.set(await Lobby.joinPincode(joinForm as string));
  }
</script>

<form autocomplete="off" onsubmit={joinLobby}>
  <label for="lobbyCode">Code</label>
  <input type="text" name="lobbyCode" required pattern="[a-z]{'{5}'}" />
  <button type="submit">Join Lobby</button>
</form>

<form autocomplete="off" onsubmit={createLobby}>
  {@html renderOptions()}
  <input
    type="text"
    name="description"
    placeholder="Description"
    aria-label="Description"
    defaultValue=""
  />

  <button type="submit">Create</button>
</form>
