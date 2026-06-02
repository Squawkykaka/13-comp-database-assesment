import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  DocumentReference,
  getDoc,
  onSnapshot,
  QueryDocumentSnapshot,
  runTransaction,
  setDoc,
  updateDoc,
  writeBatch,
  type SnapshotOptions,
} from "firebase/firestore";
import { AUTH, DB } from ".";
import type { GameUser, LobbyMember } from "../models/user";
import { currentUser } from "./store";
import { get, readable, readonly, writable, type Writable } from "svelte/store";
import { REQUESTED_LOBBY, type JoinLobby, type LobbySettings } from "../lobby";
import { SiteError } from "../models/error";
import { userCollection } from "./user";

const gameRef = doc(DB, "games", "tictactoe");
const lobbies = collection(gameRef, "lobbies");

class Lobby {
  members: Writable<LobbyMember[]> = writable([]);
  owner: GameUser;
  settings: Writable<LobbySettings>;
  lobbyRef: DocumentReference;
  currentUser: Writable<LobbyMember>;

  private constructor(
    owner: GameUser,
    settings: LobbySettings,
    lobbyRef: typeof this.lobbyRef,
  ) {
    this.owner = owner;
    this.settings = writable(settings);
    this.lobbyRef = lobbyRef;
    this.currentUser = writable({
      displayName: owner.displayName,
      losses: 0,
      wins: 0,
      quote: owner.quote,
      user: owner.dbRef,
      uid: owner.uid,
    });

    // if the settings change
    // TODO: find some way to remove these when a lobby is deleted
    onSnapshot(lobbyRef, (next) => {
      if (next.exists()) {
        let data = next.data();
        let settings = data.settings as LobbySettings;
        this.settings.set(settings);
      }
    });
    this.settings.subscribe((next) => {
      updateDoc(this.lobbyRef, {
        settings: next,
      });
    });

    onSnapshot(collection(lobbyRef, "members"), (next) => {
      let docs: LobbyMember[] = next.docs.map((current) => {
        let data = current.data();
        return {
          dbRef: current,
          displayName: data.displayName,
          quote: data.quote,
          losses: data.losses,
          wins: data.wins,
          uid: current.id,
          user: doc(userCollection, current.id),
        };
      });
      this.members.set(docs);
    });

    this.currentUser.subscribe((user) => {
      console.log(user);
      setDoc(doc(this.lobbyRef, "members", user.uid), {
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

    let ref = await Lobby.createLobby(info, settings);
    const lobby = new Lobby(info, settings, ref);

    return lobby;
  }

  static async join(code: string): Promise<Lobby> {
    const { owner, settings } = await Lobby.joinLobby(code);

    return new Lobby(owner, settings, doc(lobbies, code));
  }

  private static async createLobby(
    owner: GameUser,
    settings: LobbySettings,
  ): Promise<DocumentReference> {
    // create lobby on server
    let ref = await addDoc(lobbies, {
      owner: owner.dbRef,
      settings,
    });

    return ref;
  }

  private static async joinLobby(code: string): Promise<{
    owner: GameUser;
    settings: LobbySettings;
  }> {
    let snapshot = await getDoc(doc(lobbies, code));

    if (snapshot.exists()) {
      let data = snapshot.data();
      let userData = (await getDoc(data.owner)).data();

      return { owner: userData as GameUser, settings: data.settings };
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
