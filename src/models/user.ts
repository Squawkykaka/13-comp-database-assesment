export type GameUser = {
  photoURL?: string;
  displayName: string;
  joinDate: Date;
  quote: string;
  readonly uid: string,
};

export type LobbyMember = {
  displayName: string;
  quote: string;
  losses: number;
  wins: number;
  readonly uid: string;
};

