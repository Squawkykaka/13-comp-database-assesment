import { doc, getDoc } from "firebase/firestore";
import { AUTH, currentUser, RDB, userCollection } from ".";
import type { GameUser, LobbyMember } from "../models/user";
import { derived, get, writable, type Readable, type Writable } from "svelte/store";
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
import type { LobbySettings } from "../models/gameSettings";
import { activeGame } from "./game.svelte";

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

export class Lobby {
  readonly members = writable<{ [x: string]: LobbyMember }>({});
  readonly settings: Writable<LobbySettings>; // initialized in constructor
  readonly owner: GameUser;
  readonly lobbyRef: DatabaseReference;
  // stores the current lobby member, this is different from the global user
  readonly currentMember: Readable<LobbyMember>;
  readonly lobbyCode: string;
  locked: boolean = $state(false);
  isOwner: boolean;
  cleanup: (() => void)[] = [];

  async startGames() {
    if (!this.isOwner) throw "You are not the lobby owner";
    let gamesRef = ref(RDB, "games");
    let membersRef = child(this.lobbyRef, "members");

    let members = Object.entries(get(this.members));
    if (members.length % 2 !== 0) throw "There is an uneven amount of players in the lobby";
    set(child(this.lobbyRef, "locked"), true);

    for (let i = 0; i < members.length; i += 2) {
      const crossUid = members[i][0];
      const circleUid = members[i + 1][0];

      let gameRef = push(gamesRef, {
        circleUid,
        crossUid,
        moves: {},
        completed: false,
      });

      set(child(membersRef, crossUid + "/activeGame"), gameRef.key);
      set(child(membersRef, circleUid + "/activeGame"), gameRef.key);
    }
  }

  async updateSettings(next: LobbySettings) {
    if (!this.isOwner) {
      throw new SiteError("NOT_LOBBY_OWNER");
    }

    await update(child(this.lobbyRef, "settings"), next);
  }

  private constructor(
    owner: GameUser,
    settings: LobbySettings,
    lobbyRef: DatabaseReference,
    lobbyCode: string,
    members: { [x: string]: LobbyMember },
  ) {
    this.owner = owner;
    this.members = writable(members);
    this.settings = writable(settings);
    this.lobbyRef = lobbyRef;
    this.lobbyCode = lobbyCode;
    this.isOwner = owner.uid == AUTH.currentUser?.uid;

    let membersRef = child(this.lobbyRef, "members");
    if (!this.isOwner) {
      let settingsRef = child(this.lobbyRef, "settings");

      this.cleanup.push(
        onValue(settingsRef, (snapshot) => {
          if (snapshot.exists()) {
            this.settings.set(snapshot.val());
          }
        }),
      );
    }

    this.currentMember = derived(currentUser, (currentUser) => {
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

    // delete the lobby and pincode when the game is over
    if (this.isOwner) {
      onDisconnect(this.lobbyRef).remove();
    } else {
      // remove the member from the lobby
      onDisconnect(child(membersRef, get(currentUser).info!.uid)).remove();
    }
    onDisconnect(ref(RDB, "pincodes/" + this.lobbyCode)).remove();

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

    this.cleanup.push(
      onChildAdded(membersRef, updateChild),
      onChildChanged(membersRef, updateChild),
      onChildRemoved(membersRef, (snapshot) => {
        this.members.update((old) => {
          delete old[snapshot.key!];
          return old;
        });
      }),
      onValue(child(this.lobbyRef, "locked"), (snapshot) => {
        let data = snapshot.val() as boolean;
        this.locked = data;
      }),
      this.currentMember.subscribe((user) => {
        let userRef = child(membersRef, user.uid);
        update(userRef, {
          displayName: user.displayName,
          quote: user.quote,
        });
      }),
    );
  }

  static async create(settings: LobbySettings): Promise<Lobby> {
    const info = get(currentUser).info;

    if (!info) {
      throw new Error("Attempted to create a lobby without a logged in user");
    }

    let { code, lobbyRef } = await Lobby.createLobby(info, settings);
    const lobby = new Lobby(info, settings, lobbyRef, code, {});

    return lobby;
  }

  static async joinPincode(code: string): Promise<Lobby> {
    let lobbyId = (await getRef(ref(RDB, "pincodes/" + code))).val();

    const { owner, settings, reference, members } = await Lobby.joinLobby(lobbyId);

    return new Lobby(owner, settings, reference, code, members);
  }
  static async join(code: string): Promise<Lobby> {
    const { owner, settings, reference, members } = await Lobby.joinLobby(code);

    return new Lobby(owner, settings, reference, code, members);
  }

  private static async createLobby(
    owner: GameUser,
    settings: LobbySettings,
  ): Promise<{ code: string; lobbyRef: DatabaseReference }> {
    let lobbysRef = ref(RDB, "lobbies");
    let lobby = push(lobbysRef);
    let code = makeid(5);
    await Promise.all([
      set(lobby, {
        owner: owner.uid,
        settings,
      }),
      set(ref(RDB, "pincodes/" + code), lobby.key),
    ]);
    return { code, lobbyRef: lobby };
  }

  private static async joinLobby(lobbyId: string): Promise<{
    owner: GameUser;
    settings: LobbySettings;
    reference: DatabaseReference;
    members: { [x: string]: LobbyMember };
  }> {
    let lobbyRef = ref(RDB, "lobbies/" + lobbyId);
    let snapshot = await getRef(lobbyRef);

    if (snapshot.exists()) {
      let data = snapshot.val();
      let userData = (await getDoc(doc(userCollection, data.owner))).data() as any;

      let membersData = (await getRef(child(lobbyRef, "members"))).val() ?? {};
      for (const id of Object.keys(membersData)) {
        membersData[id].uid = id;
      }
      console.log(membersData);

      return {
        owner: {
          displayName: userData.displayName,
          joinDate: userData.joinDate,
          quote: userData.quote,
          photoURL: userData.photoURL === null ? undefined : userData.photoURL,
          dbRef: data.owner,
          uid: data.owner,
        },
        settings: data.settings,
        reference: lobbyRef,
        members: membersData,
      };
    } else {
      throw new SiteError("LOBBY_NONEXISTENT");
    }
  }

  destroy() {
    this.cleanup.forEach((fn) => fn());
  }
}

export let LOBBY = writable<Lobby | undefined>();
let removeLobby = () => {};
LOBBY.subscribe(update => {
  removeLobby()
  if (update) {
    removeLobby = onValue(update.lobbyRef, snapshot => {
      if (!snapshot.exists()) {
        LOBBY.set(undefined)
        removeLobby()
      }
    })
  }
})
// let off = currentUser.subscribe(async (self) => {
//   if (self.info) {
//     if (REQUESTED_LOBBY.kind == "join") {
//       LOBBY.set(await Lobby.join(REQUESTED_LOBBY.lobbyCode));
//     } else {
//       console.log("Creating lobby");
//     }
//     off();
//   }
// });
