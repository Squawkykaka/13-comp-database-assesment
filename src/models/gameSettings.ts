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
  // private: {
  //   display: "Private",
  //   description:
  //     "Create a private game, that only people you send the code to can join",
  // },
};
export const GAME_STYLES = {
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
