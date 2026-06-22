import { AUTH, currentUser, RDB } from ".";
import type { GameUser, LobbyMember } from "../models/types";
import { get, writable, type Writable } from "svelte/store";
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
  remove,
} from "firebase/database";
import type { LobbySettings } from "../models/types";
import { activeGame, Game } from "./game.svelte";

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
  readonly owner: string;
  readonly lobbyRef: DatabaseReference;
  // stores the current lobby member, this is different from the global user
  readonly lobbyCode: string;
  locked: boolean = $state(false);
  gamesStarted = $state(false);
  isOwner: boolean;
  private cleanup: (() => void)[] = [];

  private async startGames() {
    if (this.gamesStarted) return;

    if (!this.isOwner) throw new SiteError("NOT_LOBBY_OWNER");
    let gamesRef = child(this.lobbyRef, "games");
    let membersRef = child(this.lobbyRef, "members");

    let members = Object.keys(get(this.members)).sort(() => Math.random());
    if (members.length < 2) throw "not enough people in lobby";
    if (members.length % 2 !== 0) throw "uneven amount of people in lobby";
    set(child(this.lobbyRef, "locked"), true);

    for (let i = 0; i < members.length; i += 2) {
      const crossUid = members[i];
      const circleUid = members[i + 1];

      let gameRef = push(gamesRef, {
        circleUid,
        crossUid,
        // TODO: use this value in the code
        completed: false,
      });

      set(child(membersRef, crossUid + "/activeGame"), gameRef.key);
      set(child(membersRef, circleUid + "/activeGame"), gameRef.key);
    }

    this.gamesStarted = true;
  }

  set ready(readyStatus: boolean) {
    set(
      child(this.lobbyRef, `members/${AUTH.currentUser?.uid}/ready`),
      readyStatus,
    );
  }

  async updateSettings(next: LobbySettings) {
    if (!this.isOwner) {
      throw new SiteError("NOT_LOBBY_OWNER");
    }

    await update(child(this.lobbyRef, "settings"), next);
  }

  private constructor(
    owner: string,
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
    this.isOwner = owner == AUTH.currentUser?.uid;

    let membersRef = child(this.lobbyRef, "members");

    // delete the lobby and pincode when the game is over
    if (this.isOwner) {
      onDisconnect(this.lobbyRef).remove();

      // start the games if everyone in the lobby is ready
      let gameStartUnsubscribe = this.members.subscribe((members) => {
        let membersList = Object.values(members);

        if (membersList.length == 0 && membersList.length % 2 == 0) return;
        const allReady = membersList.every((member) => member.ready);

        if (allReady) {
          this.startGames();
          gameStartUnsubscribe();
        }
      });
    } else {
      // remove the member from the lobby
      onDisconnect(child(membersRef, get(currentUser).info!.uid)).remove();

      // listen to the updated settings
      let settingsRef = child(this.lobbyRef, "settings");
      this.cleanup.push(
        onValue(settingsRef, (snapshot) => {
          if (snapshot.exists()) {
            this.settings.set(snapshot.val());
          }
        }),
      );
    }
    onDisconnect(ref(RDB, "pincodes/" + this.lobbyCode)).remove();

    let updateChild = (data: DataSnapshot) => {
      this.members.update((old) => {
        old[data.key!] = {
          displayName: data.val().displayName,
          quote: data.val().quote,
          losses: data.val().losses ?? 0,
          wins: data.val().wins ?? 0,
          ready: data.val().ready ?? false,
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
      // join a lobby if you are joined to a lobby,
      onValue(
        child(membersRef, `${AUTH.currentUser?.uid}/activeGame`),
        async (snapshot) => {
          if (snapshot.exists()) {
            activeGame.set(
              await Game.joinGame(child(lobbyRef, `games/${snapshot.val()}`)),
            );
          } else {
            activeGame.set(undefined);
          }
        },
      ),
      currentUser.subscribe(async (user) => {
        if (user.info) {
          await update(child(membersRef, user.info.uid), {
            displayName: user.info.displayName,
            quote: user.info.quote,
          });
        }
      }),
    );
  }

  async leave(): Promise<void> {
    this.destroy();
    if (this.isOwner) {
      await remove(this.lobbyRef);
    } else {
      await remove(child(this.lobbyRef, `members/${AUTH.currentUser?.uid}`));
    }
    LOBBY.set(undefined);
  }

  static async create(settings: LobbySettings): Promise<Lobby> {
    const info = get(currentUser).info;

    if (!info) {
      throw new Error("Attempted to create a lobby without a logged in user");
    }

    let { code, lobbyRef } = await Lobby.createLobby(info, settings);
    const lobby = new Lobby(info.uid, settings, lobbyRef, code, {});

    return lobby;
  }

  static async joinPincode(code: string): Promise<Lobby> {
    let lobbyId = (await getRef(ref(RDB, "pincodes/" + code))).val();

    return Lobby.join(lobbyId);
  }
  static async join(code: string): Promise<Lobby> {
    const { ownerUid, settings, reference, members } =
      await Lobby.joinLobby(code);

    return new Lobby(ownerUid, settings, reference, code, members);
  }

  private static async createLobby(
    owner: GameUser,
    settings: LobbySettings,
  ): Promise<{ code: string; lobbyRef: DatabaseReference }> {
    let lobbysRef = ref(RDB, "lobbies");
    let lobby = push(lobbysRef);
    let code = makeid(5);

    let dbLobby: any = {
      owner: owner.uid,
      settings,
      members: {
        [owner.uid]: {
          displayName: owner.displayName,
          quote: owner.quote,
        },
      },
    };
    if (settings.multiplayerType == "private") {
      dbLobby.locked = true;
    }

    await Promise.all([
      set(lobby, dbLobby),
      set(ref(RDB, "pincodes/" + code), lobby.key),
    ]);
    return { code, lobbyRef: lobby };
  }

  private static async joinLobby(lobbyId: string): Promise<{
    ownerUid: string;
    settings: LobbySettings;
    reference: DatabaseReference;
    members: { [x: string]: LobbyMember };
  }> {
    let lobbyRef = ref(RDB, "lobbies/" + lobbyId);
    let snapshot = await getRef(lobbyRef);

    if (snapshot.exists()) {
      let data = snapshot.val();

      // // if the lobby is locked, this happens when the game is private or already playing
      // if (data.locked === true) {

      // }

      return {
        ownerUid: data.owner,
        settings: data.settings,
        reference: lobbyRef,
        members: {},
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
LOBBY.subscribe((update) => {
  removeLobby();
  if (update) {
    removeLobby = onValue(update.lobbyRef, async (snapshot) => {
      if (!snapshot.exists()) {
        update.destroy();
        LOBBY.set(undefined);
        await remove(
          child(update.lobbyRef, `members/${AUTH.currentUser?.uid}/activeGame`),
        );
        removeLobby();
      }
    });
  }
});
