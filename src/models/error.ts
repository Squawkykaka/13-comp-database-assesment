export const ERROR_MESSAGES = {
  LOBBY_TOO_FULL:
    "There are too many players to start a game\nTHIS IS AN ERROR, GAME SPLITTING NOT IMPLEMENTED",
  LOBBY_TOO_SMALL: "Too few players to start a game",
  USER_NOT_AUTHENTICATED: "The user is not signed in.",
  USER_INFO_DOES_NOT_EXIST: "The user information does not exist",
  CANNOT_CREATE_LOBBY: "Failed to create the lobby",
  LOBBY_NONEXISTENT: "The requested lobby does not exist",
  INVALID_LOBBY_SETTINGS: "The requested lobby settings are invalid.",
  NOT_LOBBY_OWNER: "You cannot update settings, you are not lobby owner"
};
type ErrorCode = keyof typeof ERROR_MESSAGES;

export class SiteError {
  readonly code: ErrorCode;
  readonly message: string;
  readonly extra: any[] = [];
  constructor(code: ErrorCode, ...extraInfo: any[]) {
    this.code = code;
    this.message = ERROR_MESSAGES[code];
    this.extra = extraInfo;
  }
}
