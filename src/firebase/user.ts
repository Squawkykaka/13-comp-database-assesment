import {
  collection,
  doc,
  QueryDocumentSnapshot,
  type SnapshotOptions,
} from "firebase/firestore";
import { DB } from ".";
import type { FirebaseUser } from "../models/user";

const userConverter = {
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
      userUID: snapshot.ref.parent.id,
    };
  },
  toFirestore(user: FirebaseUser) {
    return {
      ...user,
      photoURL: user.photoURL ?? null
    };
  },
};
export const userCollection = collection(DB, "users");
export const userProfile = (uid: string) =>
  doc(userCollection, uid, "public", "profile").withConverter(userConverter);
