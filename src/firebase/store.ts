import { onAuthStateChanged, type User } from "firebase/auth";
import { AUTH } from ".";
import { doc, onSnapshot } from "firebase/firestore";
import { userCollection } from "./user";
import type { GameUser } from "../models/user";
import { derived, writable } from "svelte/store";

let currentFirebaseUser = writable<User | undefined>();
onAuthStateChanged(AUTH, (user) => {
  if (user === null) {
    currentFirebaseUser.set(undefined);
  } else {
    currentFirebaseUser.set(user);
  }
});

let currentUserWritable = writable<GameUser | undefined>();
currentFirebaseUser.subscribe((user) => {
  if (user) {
    return onSnapshot(doc(userCollection, user.uid), (next) => {
      currentUserWritable.set(next.data());
    });
  }
});
export const currentUser = derived(
  [currentFirebaseUser, currentUserWritable],
  ([currentFirebaseUser, currentUserWritable]) => {
    return {
      auth: currentFirebaseUser,
      info: currentUserWritable,
    };
  },
);
