import {
  addDoc,
  collection,
  doc,
  DocumentReference,
  onSnapshot,
  QueryDocumentSnapshot,
  setDoc,
  updateDoc,
  type SnapshotOptions,
} from "firebase/firestore";
import { DB } from ".";
import type { LobbySettings } from "../models/gameSettings";
import { lobbyOwner, lobbySettings } from "../models/stores";
import { SiteError } from "../models/error";
import { currentUser, userCollection, userConverter } from "./user";
import type { FirebaseUser } from "../models/user";
import { lobbyMembers as lobbyMembersStore } from "../models/stores";
import { get } from "svelte/store";

type LobbyData = {
  settings: LobbySettings;
  owner: DocumentReference<FirebaseUser>;
};

const lobbyConverter = {
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ): LobbyData {
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
const lobbyRef = (gameUid: string) => doc(lobbies, gameUid);
const lobbyMembers = (gameUid: string) =>
  collection(lobbies, gameUid, "users").withConverter(userConverter);

export async function handleLobbyCreation(settings: LobbySettings) {
  try {
    const user = get(currentUser);

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
    let lobbyUserRef = doc(lobbyMembers(ref.id), user.uid)
    setDoc(lobbyUserRef, user);
  
    currentUser.subscribe((user) => {
      if (user === null) return;
      updateDoc(lobbyUserRef, user);
    });
    // adds the listener to update the user's info if they change any

    onSnapshot(lobbyMembers(ref.id), (snapshot) => {
      let data = snapshot.docChanges();

      lobbyMembersStore.update((prev) => {
        for (const item of data) {
          let docData = item.doc.data();
          if (item.doc.exists()) {
            prev[docData.uid] = docData;
          } else {
            delete prev[docData.uid];
          }
        }
        
        console.log(prev);
        

        return prev;
      });
    });

    // TODO: add peerjs probably to make it so when a disconnect happens all members disappear,

    lobbyOwner.set(user);
  } catch (error) {
    if (error instanceof SiteError) {
      throw error;
    } else {
      throw new SiteError("CANNOT_CREATE_LOBBY");
    }
  }
}
