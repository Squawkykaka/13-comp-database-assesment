import {
  collection,
  doc,
  QueryDocumentSnapshot,
  type SnapshotOptions,
} from "firebase/firestore";
import { DB } from ".";
import type { FirebaseUser } from "../models/user";

export const userConverter = {
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ): FirebaseUser {
    const data = snapshot.data(options)!;    

    return {
      displayName: data.displayName,
      joinDate: data.joinDate,
      losses: data.losses,
      wins: data.wins,
      photoURL: data.photUrl === null ? undefined : data.photoURL,
      uid: snapshot.id,
    };
  },
  toFirestore(user: FirebaseUser) {
    const { uid: userUID, ...rest } = user;

    return {
      ...rest,
      photoURL: user.photoURL ?? null,
    };
  },
};
export const userCollection = collection(DB, "users").withConverter(userConverter);
