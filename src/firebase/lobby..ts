import { doc, getDoc } from "firebase/firestore";
import { currentUser, RDB, userCollection } from ".";
import type { GameUser, LobbyMember } from "../models/user";
import {
  derived,
  get,
  writable,
  type Readable,
  type Writable,
} from "svelte/store";
import { REQUESTED_LOBBY, type LobbySettings } from "../lobby";
import { SiteError } from "../models/error";

import {
  DataSnapshot,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  onValue,
  push,
  ref,
  set,
  get as getRef,
  update,
  type DatabaseReference,
  child,
  onDisconnect,
} from "firebase/database";

function makeid(length: number) {
  let result = "";
  const characters = "abcdefghijklmnopqrstuvwxyz";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

class Lobby {
  members: Writable<{ [x: string]: LobbyMember }> = writable({});
  owner: GameUser;
  settings: Writable<LobbySettings>;
  lobbyRef: DatabaseReference;
  currentUser: Readable<LobbyMember>;
  lobbyCode: string;

  private constructor(
    owner: GameUser,
    settings: LobbySettings,
    lobbyRef: DatabaseReference,
    lobbyCode: string,
  ) {
    this.owner = owner;
    this.settings = writable(settings);
    this.lobbyRef = lobbyRef;
    this.lobbyCode = lobbyCode;
    this.currentUser = derived(currentUser, (currentUser) => {
      if (currentUser.info) {
        return {
          displayName: currentUser.info.displayName,
          losses: 0,
          wins: 0,
          quote: currentUser.info.quote,
          user: currentUser.info.dbRef,
          uid: currentUser.info.uid,
        };
      } else {
        throw new SiteError("USER_NOT_AUTHENTICATED");
      }
    });

    let membersRef = child(this.lobbyRef, "members");
    let settingsRef = child(this.lobbyRef, "settings");

    // delete the lobby and pincode when the game is over
    if (owner.uid == get(currentUser).info?.uid) {
      onDisconnect(this.lobbyRef).remove();
    } else {
      onDisconnect(child(membersRef, get(currentUser).info!.uid)).remove();
    }
    onDisconnect(ref(RDB, "pincodes/" + this.lobbyCode)).remove();

    onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        let data = snapshot.val();
        let settings = data.settings as LobbySettings;
        this.settings.set(settings);
      }
    });
    this.settings.subscribe((next) => {
      if (next) {
        update(settingsRef, {
          settings: next,
        });
      }
    });

    let updateChild = (data: DataSnapshot) => {
      this.members.update((old) => {
        old[data.key!] = {
          displayName: data.val().displayName,
          quote: data.val().quote,
          losses: data.val().losses,
          wins: data.val().wins,
          uid: data.key!,
        };
        return old;
      });
    };

    onChildAdded(membersRef, updateChild);
    onChildChanged(membersRef, updateChild);
    onChildRemoved(membersRef, (snapshot) => {
      this.members.update((old) => {
        delete old[snapshot.key!];
        return old;
      });
    });

    this.currentUser.subscribe((user) => {
      let userRef = child(membersRef, user.uid);
      set(userRef, {
        displayName: user.displayName,
        quote: user.quote,
        losses: user.losses,
        wins: user.wins,
      });
    });
  }

  static async create(settings: LobbySettings): Promise<Lobby> {
    const info = get(currentUser).info;

    if (!info) {
      throw new Error("Attempted to create a lobby without a logged in user");
    }

    let { code, lobbyRef } = await Lobby.createLobby(info, settings);
    const lobby = new Lobby(info, settings, lobbyRef, code);

    return lobby;
  }

  static async join(code: string): Promise<Lobby> {
    const { owner, settings, reference } = await Lobby.joinLobby(code);

    return new Lobby(owner, settings, reference, code);
  }

  private static async createLobby(
    owner: GameUser,
    settings: LobbySettings,
  ): Promise<{ code: string; lobbyRef: DatabaseReference }> {
    let lobbysRef = ref(RDB, "lobbies");
    let lobby = push(lobbysRef);
    set(lobby, {
      owner: owner.uid,
      settings,
    });
    let code = makeid(5);
    set(ref(RDB, "pincodes/" + code), lobby.key);
    return { code, lobbyRef: lobby };
  }

  private static async joinLobby(code: string): Promise<{
    owner: GameUser;
    settings: LobbySettings;
    reference: DatabaseReference;
  }> {
    let lobbyId = (await getRef(ref(RDB, "pincodes/" + code))).val();

    let lobbyRef = ref(RDB, "lobbies/" + lobbyId);
    let snapshot = await getRef(lobbyRef);

    if (snapshot.exists()) {
      let data = snapshot.val();
      let userData = (
        await getDoc(doc(userCollection, data.owner))
      ).data() as any;

      return {
        owner: {
          displayName: userData.displayName,
          joinDate: userData.joinDate,
          quote: userData.quote,
          photoURL: userData.photoURL === null ? undefined : userData.photoURL,
          dbRef: data.owner,
          uid: data.owner.id,
        },
        settings: data.settings,
        reference: lobbyRef,
      };
    } else {
      throw new SiteError("LOBBY_NONEXISTENT");
    }
  }
}

export let LOBBY = writable<Lobby>();
let off = currentUser.subscribe(async (self) => {
  if (self.info) {
    if (REQUESTED_LOBBY.kind == "join") {
      LOBBY.set(await Lobby.join(REQUESTED_LOBBY.lobbyCode));
    } else {
      console.log("Creating lobby");
      LOBBY.set(await Lobby.create(REQUESTED_LOBBY));
    }
    off();
  }
});
