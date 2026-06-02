import type { DocumentReference } from "firebase/firestore";

export type GameUser = {
  photoURL?: string;
  displayName: string;
  joinDate: Date;
  quote: string;
  readonly uid: string;
  readonly dbRef: DocumentReference<GameUser>;
};

export type LobbyMember = {
  displayName: string;
  quote: string;
  losses: number;
  wins: number;
  readonly uid: string
  user: DocumentReference<GameUser>;
};
