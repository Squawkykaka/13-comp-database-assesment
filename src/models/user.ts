export type LocalUser = {
  displayName: string,
  wins: number,
  losses: number
}

export type FirebaseUser = {
  photoURL?: string;
  displayName: string
  wins: number,
  losses: number,
  joinDate: Date,
  readonly uid: string,
}