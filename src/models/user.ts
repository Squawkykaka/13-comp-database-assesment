export type User = {
  profilePicture: URL;
  wonGames: number;
  lostGames: number;
  joinDate: Date;
  level: number;
};
export type PlayerInfo = {
  displayName: string;
  type: "local" | "firebase";
  losses: number;
  wins: number;
  readonly user?: User;
};
