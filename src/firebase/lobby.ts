import {
  addDoc,
  collection,
  doc,
  DocumentReference,
  QueryDocumentSnapshot,
  setDoc,
  updateDoc,
  type SnapshotOptions,
} from "firebase/firestore";
import { AUTH, DB } from ".";
import type { LobbySettings } from "../models/gameSettings";
import { currentUser, lobbyOwner, lobbySettings } from "../models/stores";
import { SiteError } from "../models/error";
import { userCollection, userConverter } from "./user";
import type { FirebaseUser } from "../models/user";
import { onAuthStateChanged } from "firebase/auth";

type LobbyData = {
  settings: LobbySettings;
  owner: DocumentReference<FirebaseUser>;
};

const lobbyConverter = {
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): LobbyData {
    const data = snapshot.data(options)!;
    return {
      owner: data.owner,
      settings: data.settings,
    };
  },
  toFirestore(lobby: LobbyData) {
    return {
      settings: lobby.settings,
      owner: lobby.owner,
    };
  },
};

const gameRef = doc(DB, "games", "tictactoe");
const lobbies = collection(gameRef, "lobbies").withConverter(lobbyConverter);
export const lobbyMembersRef = (gameUid: string) =>
  collection(lobbies, gameUid, "users").withConverter(userConverter);

export async function handleLobbyCreation(settings: LobbySettings) {
  try {
    await AUTH.authStateReady();
    const user = AUTH.currentUser;

    if (user === null) {
      throw new SiteError("USER_NOT_AUTHENTICATED");
    }
    let ref = await addDoc(lobbies, {
      owner: doc(userCollection, user.uid),
      settings,
    });
    lobbySettings.update((prev) => {
      return {
        ...prev,
        lobbyId: ref.id,
      };
    });

    // adds the current user to the lobby
    let lobbyUserRef = doc(lobbyMembersRef(ref.id), user.uid);

    onAuthStateChanged(AUTH, (user) => {
      if (user === null) {
        window.location.href = "/"
      }
    })

    currentUser.subscribe((user) => {
      if (user === undefined) return;
      updateDoc(lobbyUserRef, user);
    });

    // TODO: add peerjs probably to make it so when a disconnect happens all members disappear,

    lobbyOwner.set(currentUser);
  } catch (error) {
    if (error instanceof SiteError) {
      throw error;
    } else {
      throw new SiteError("CANNOT_CREATE_LOBBY");
    }
  }
}
