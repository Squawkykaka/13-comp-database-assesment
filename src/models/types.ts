export const GAME_MODES = {
  // ultimate: {
  //   display: "Ultimate",
  //   description:
  //     "A variation of tic-tac-toe where then are a 3x3 of boards and you have to cross off all of them",
  // },
  original: {
    display: "Original",
    description: "The original form of tic-tac-toe",
  },
};
export const MULTIPLAYER_MODES = {
  // local: {
  //   display: "Local",
  //   description: "Play tic-tac-toe on one device, friends optional",
  // },
  public: {
    display: "Public",
    description: "Create a online game that people can join from anywhere",
  },
  private: {
    display: "Private",
    description:
      "Create a private game, that only people you send the code to can join",
  },
};
export const GAME_STYLES = {
  // tournament: {
  //   display: "Tournament",
  //   description: "Play vs multiple people in a showdown style match to see who is the greatest at tictactoe."
  // },
  onevone: {
    display: "One v One",
    description: "Play against one person to see who gets the highest score",
  },
  // tournament: {
  //   display: "Tournament",
  //   description:
  //     "A fight against many players, to find out the ruler of tic-tac-toe",
  // },
};

// I want a type, that contains an id, then a name for that id. I want gamemode to be a list of the id's but just as strings
// I want to be able to query the name of the id in some easy form of way

export type GameMode = keyof typeof GAME_MODES;
export type MultiplayerMode = keyof typeof MULTIPLAYER_MODES;
export type GameStyle = keyof typeof GAME_STYLES;

export type JoinLobby = { lobbyCode: string };
export type LobbySettings = {
  // The gamemode of the lobby `original` for now
  gameMode: GameMode;
  // The type of multiplayer `public` for now
  multiplayerType: MultiplayerMode;
  // the style of gameplay `onevone` for now
  gameStyle: GameStyle;
  description: string | null;
};

export type GameUser = {
  photoURL?: string;
  displayName: string;
  joinDate: Date;
  quote: string;
  wins: number;
  losses: number;
  readonly uid: string;
};

export type LobbyMember = {
  displayName: string;
  quote: string;
  losses: number;
  wins: number;
  ready: boolean;
  readonly uid: string;
};
