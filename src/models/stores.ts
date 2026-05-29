import { derived, readonly, writable, type Readable } from "svelte/store";
import type { FirebaseUser } from "./user";
import { onAuthStateChanged, type User } from "firebase/auth";
import { AUTH, createFirestoreCollectionStore } from "../firebase";
import { type LobbySettings } from "./gameSettings";
import type { Game } from "../game/lobbySplitting";
import { lobbyMembersRef } from "../firebase/lobby";
import { doc, getDoc } from "firebase/firestore";
import { userCollection } from "../firebase/user";

// current auth status
const firebaseUserWritable = writable<User | null>(null);
const authReadyWritable = writable(false);

let initialized = false;
(function initAuth() {
  if (initialized) return;
  initialized = true;

  onAuthStateChanged(AUTH, (user) => {
    firebaseUserWritable.set(user);
    authReadyWritable.set(true);
  });
})();

export const authReady = readonly(authReadyWritable);
export const firebaseAuthUser = readonly(firebaseUserWritable);

// current lobby settings.
export const lobbySettings = writable<LobbySettings>();
export const lobbyOwner = writable<FirebaseUser>();
export const isLobbyOwner = derived(
  [lobbyOwner, firebaseAuthUser],
  ([lobbyOwner, firebaseAuthUser]) => {
    if (!firebaseAuthUser) return;
    return lobbyOwner.uid == firebaseAuthUser?.uid;
  },
);

export const lobbyMembers = derived(
  lobbySettings,
  ($lobbySettings) => {
    let lobbyID = $lobbySettings?.lobbyId;

    if (lobbyID === undefined) {
      return [];
    } else {
      console.log("Making a store, ID:", lobbyID);

      const store = createFirestoreCollectionStore(
        // lobbyId is present because of above check
        lobbyMembersRef(lobbyID),
      );
      console.log(store);

      
      return unsubscribe;
    }
  },
  [] as FirebaseUser[],
);

export const currentUser = derived<
  [Readable<User | null>, Readable<FirebaseUser[]>],
  FirebaseUser | undefined
>([firebaseAuthUser, lobbyMembers], ([firebaseAuthUser, lobbyMembers], set) => {
  if (firebaseAuthUser === null) {
    set(undefined);
    return;
  }
  let find = lobbyMembers.find((el) => el.uid == firebaseAuthUser.uid);
  if (find) {
    set(find);
    return;
  }
  set(undefined);
});

// active game
export const activeGameSettings = writable<Game>();
export const activeGame = derived(
  [activeGameSettings, lobbyMembers],
  ([activeGameSettings, players]) => {
    if (activeGameSettings === undefined) return;

    return {
      activeGameSettings,
      crossPlayer: players.find(
        (el) => el.uid == activeGameSettings.crossPlayerUid,
      ),
      circlePlayer: players.find(
        (el) => el.uid == activeGameSettings.circlePlayerUid,
      ),
    };
  },
);
