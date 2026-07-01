export const ERROR_MESSAGES = {
  USER_NOT_AUTHENTICATED: "The user is not signed in.",
  GAME_DOESNT_EXIST: "The requested game does not exist."
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
