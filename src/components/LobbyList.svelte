<script lang="ts">
  import {
    onChildAdded,
    onChildChanged,
    onChildRemoved,
    ref,
  } from "firebase/database";
  import { RDB } from "../firebase";
  import type { LobbyMember } from "../models/types";
  import { LOBBY, Lobby } from "../firebase/lobby.svelte";
  import { writable } from "svelte/store";
  import type { LobbySettings } from "../models/types";

  type Lobby = {
    owner: string;
    members: { [uid: string]: LobbyMember };
    settings: LobbySettings;
  };

  let q = ref(RDB, "/lobbies");
  let lobbies = writable<{ [id: string]: Lobby }>({});
  onChildAdded(q, (snapshot) => {
    lobbies.update((old) => {
      old[snapshot.key!] = snapshot.val() as Lobby;
      return old;
    });
  });
  onChildChanged(q, (snapshot) => {
    lobbies.update((old) => {
      old[snapshot.key!] = snapshot.val() as Lobby;
      return old;
    });
  });
  onChildRemoved(q, (snapshot) => {
    lobbies.update((old) => {
      delete old[snapshot.key!];
      return old;
    });
  });

  $inspect(lobbies);
</script>

<div>
  <ul>
    {#each Object.entries($lobbies) as [id, information]}
      <p>Owner: {information?.members?.[information.owner]?.displayName ?? "Loading..."}</p>
      
      <em>
        {information.settings?.description
          ? information.settings.description
          : "No description"}
      </em>
      
      <p>Members: {Object.entries(information.members ?? {}).length}</p>
      
      <em>
        {information.settings?.gameMode ?? "Default"} -- {information.settings?.gameStyle ?? "Default"}
      </em>
      
      <button onclick={async () => LOBBY.set(await Lobby.join(id))}>Join</button>
    {/each}
  </ul>
</div>