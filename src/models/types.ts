export type GameUser = {
  photoURL?: string;
  displayName: string;
  joinDate: Date;
  quote: string;
  wins: number;
  losses: number;
  readonly uid: string;
};