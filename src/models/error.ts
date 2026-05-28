export const ERROR_MESSAGES = {
    LOBBY_TOO_FULL: "There are too many players to start a game\nTHIS IS AN ERROR, GAME SPLITTING NOT IMPLEMENTED",
    LOBBY_TOO_SMALL: "Too few players to start a game",
    USER_NOT_AUTHENTICATED: "The user is not signed in.",
    USER_INFO_DOES_NOT_EXIST: "The user information does not exist",
    CANNOT_CREATE_LOBBY: "Failed to create the lobby"
}
type ErrorCode = keyof typeof ERROR_MESSAGES;

export class SiteError {
    readonly code: ErrorCode;
    readonly message: string;
    constructor(code: ErrorCode) {
        this.code = code
        this.message = ERROR_MESSAGES[code]
    }
}