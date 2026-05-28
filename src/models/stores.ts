import { derived, readonly, writable } from "svelte/store";
import type { FirebaseUser } from "./user";
import { onAuthStateChanged, type User } from "firebase/auth";
import { AUTH } from "../firebase";
import { type LobbySettings } from "./gameSettings";
import type { Game } from "../game/lobbySplitting";

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
export const isLobbyOwner = derived([lobbyOwner, firebaseAuthUser], ([lobbyOwner, firebaseAuthUser]) => {
    if (!firebaseAuthUser) return;
    return lobbyOwner.uid == firebaseAuthUser?.uid
})
export const lobbyMembers = writable<Record<string, FirebaseUser>>({});

// active game
export const activeGameSettings = writable<Game>();
export const activeGame = derived(
  [activeGameSettings, lobbyMembers],
  ([activeGameSettings, players]) => {
    if (activeGameSettings === undefined) return;

    return {
      activeGameSettings,
      crossPlayer: players[activeGameSettings.crossPlayerUid],
      circlePlayer: players[activeGameSettings.circlePlayerUid],
    };
  },
);
