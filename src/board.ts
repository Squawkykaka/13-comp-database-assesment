export type TileType = "Circle" | "Cross" | null;

function numberToBits(num) {
  return (num >>> 0).toString(2);
}

export class Board {
  $circleList = 0o000000000;
  $crossList = 0o000000000;
  $currentlyCirclesTurn = true;

  runMove(position: number) {
    console.info(
      `${this.$currentlyCirclesTurn ? "Circle" : "Cross"} making move at position ${position}`,
    );
    let success = this.change(position, this.$currentlyCirclesTurn);
    if (success) {
      this.$currentlyCirclesTurn = !this.$currentlyCirclesTurn;
    }
  }

  public get currentTurn(): string {
    return this.$currentlyCirclesTurn ? "Circle" : "Cross";
  }

  change(position: number, circlesMove: boolean): boolean {
    if (position > 8) {
      return false;
    }
    console.log("Circle:", numberToBits(this.$circleList));
    console.log("Cross:", numberToBits(this.$crossList));

    let moveInt = 1 << position;
    // we need to merge the two streams into one integar as a move cannot overlay on top of multiple
    let mergedSides = this.$circleList | this.$crossList;
    // if any bit is not in the same spot as another then we can set that, and move on otherwise error out.
    if ((moveInt & mergedSides) == 0) {
      // if it is circles move OR in the new move
      if (circlesMove) {
        this.$circleList |= moveInt;
      } else {
        this.$crossList |= moveInt;
      }
      return true;
    } else {
      console.error(
        `Attempted to set tile type to ${circlesMove ? "Circle" : "Cross"} at position ${position} when it is already ${this.getTile(position)}`,
      );
      return false;
    }
  }

  // checks the board to see if its been won
  getWinner(): [TileType, number] | null {
    let circleWon = this.$checkWinCond(this.$circleList);
    let crossWon = this.$checkWinCond(this.$crossList);

    if (circleWon !== null ) {
      return ["Circle", circleWon]
    } else if (crossWon !== null) {
      return ["Cross", crossWon];
    } else {
      return null;
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

  getTile(position: number): TileType {
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
