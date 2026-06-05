<script lang="ts">
  import {
    onChildAdded,
    onChildChanged,
    onChildRemoved,
    ref,
  } from "firebase/database";
  import { RDB } from "../firebase";
  import type { LobbyMember } from "../models/user";
  import type { LobbySettings } from "../lobby";

  type Lobby = {
    owner: string;
    members: { [uid: string]: LobbyMember };
    settings: LobbySettings;
  };

  let q = ref(RDB, "/lobbies");
  let lobbies = $state<{ [id: string]: Lobby }>({});  
  onChildAdded(q, (snapshot) => {
    console.log("added child");
    
    lobbies[snapshot.key!] = snapshot.val() as Lobby;
  });
  onChildChanged(q, (snapshot) => {
    lobbies[snapshot.key!] = snapshot.val() as Lobby;
  });
  onChildRemoved(q, (snapshot) => {
    delete lobbies[snapshot.key!];
  });

  $inspect(lobbies)
</script>

<p>Lobbies: {Object.entries(lobbies)}</p>
