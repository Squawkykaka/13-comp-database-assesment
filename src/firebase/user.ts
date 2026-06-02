
import { collection, doc, type QueryDocumentSnapshot, type SnapshotOptions } from "firebase/firestore";
import type { GameUser } from "../models/user";
import { DB } from ".";

export const userConverter = {
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ): GameUser {
    const data = snapshot.data(options)!;

    return {
      displayName: data.displayName,
      joinDate: data.joinDate,
      quote: "",
      photoURL: data.photoUrl === null ? undefined : data.photoURL,
      uid: snapshot.id,
      dbRef: doc(userCollection, snapshot.id),
    };
  },
  toFirestore(user: GameUser) {
    return {
      displayName: user.displayName,
      joinDate: user.joinDate,
      photoURL: user.photoURL ?? null,
    };
  },
};
export const userCollection = collection(DB, "users").withConverter(
  userConverter,
);