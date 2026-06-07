export type TileType = "Circle" | "Cross";
export type WinData = {
  winner: TileType;
  winCond: number;
};
export type GameState =
  | { status: "playing" }
  | { status: "won"; data: WinData }
  | { status: "draw" };

export function numberToBits(num: number) {
  return (num >>> 0).toString(2);
}

// A general class for everything related to a single tictactoe game.
// This exposes two functions, one to run a move, and one to change a tile at a board position
// The game works by storing two ints, one for cross's and one for circles which can be compared using bit operations to determine win conditions
// e.g. a board like
// | X | X | O |
// | X | X | O |
// | O | O | X |
// would be represented as
// circles = 0b001001110
// crosses = 0b110110001
// checking for wins is super easy this way as you just AND the bit streams with all the possible win conditions, and if it equals the pattern
export class Board {
  $circleList = 0;
  $crossList = 0;
  $currentlyCirclesTurn = true;
  $state: GameState = { status: "playing" };

  runMove(position: number) {
    if (this.$state.status !== "playing") {
      return null;
    }

    this.change(position, this.$currentlyCirclesTurn ? "Circle" : "Cross");

    this.$updateGameState();
    if (this.$state.status === "playing") {
      this.$currentlyCirclesTurn = !this.$currentlyCirclesTurn;
    }
  }

  public get currentTurn(): TileType {
    return this.$currentlyCirclesTurn ? "Circle" : "Cross";
  }

  get state(): GameState {
    return this.$state;
  }

  change(position: number, tileType: TileType) {
    if (position > 8) {
      throw "Out of bounds"
    }
    console.log("Circle:", numberToBits(this.$circleList));
    console.log("Cross:", numberToBits(this.$crossList));

    let moveInt = 1 << position;
    // we need to merge the two streams into one integar as a move cannot overlay on top of multiple
    let mergedSides = this.$circleList | this.$crossList;
    // if any bit is not in the same spot as another then we can set that, and move on otherwise error out.
    if ((moveInt & mergedSides) == 0) {
      // if it is circles move OR in the new move
      if (tileType == "Circle") {
        this.$circleList |= moveInt;
      } else {
        this.$crossList |= moveInt;
      }
    } else {
      console.error(
        `Attempted to set tile type to ${tileType} at position ${position} when it is already ${this.getTile(position) ?? "Nothing"}`,
      );
    }
  }

  // checks the board to see if its been won
  $getWinner(): WinData | null {
    let circleWon = this.$checkWinCond(this.$circleList);
    let crossWon = this.$checkWinCond(this.$crossList);

    if (circleWon !== null) {
      return {
        winner: "Circle",
        winCond: circleWon,
      };
    } else if (crossWon !== null) {
      return {
        winner: "Cross",
        winCond: crossWon,
      };
    } else {
      return null;
    }
  }

  $isBoardFull(): boolean {
    const allMoves = this.$circleList | this.$crossList;
    return allMoves === 0b111111111;
  }

  $updateGameState(): void {
    const winner = this.$getWinner();

    if (winner) {
      this.$state = { status: "won", data: winner };
    } else if (this.$isBoardFull()) {
      this.$state = { status: "draw" };
    } else {
      this.$state = { status: "playing" };
    }
  }

  // checks the board for whether it has been won, by comparing against a bit board of all possible solutions
  $checkWinCond(list: number): number | null {
    const winPatterns = [
      0b111000000, // rows
      0b000111000,
      0b000000111,
      0b100100100, // columns
      0b010010010,
      0b001001001,
      0b100010001, // diagonals
      0b001010100,
    ];

    for (const pattern of winPatterns) {
      if ((list & pattern) === pattern) {
        return pattern;
      }
    }

    return null;
  }

  /**
   * Returns the tile at the specified position.
   * @param position The index of the tile you want to fetch
   * @returns The tile type, or null if none is present
   */
  getTile(position: number): TileType | null {
    let circleShifted = this.$circleList >> position;
    let crossShifted = this.$crossList >> position;

    if ((circleShifted & 1) != 0) {
      return "Circle";
    } else if ((crossShifted & 1) != 0) {
      return "Cross";
    } else {
      return null;
    }
  }
}
