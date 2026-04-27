
export type TileType = "Circle" | "Cross";
export class Tile {
  $type: TileType;

  constructor() {
    this.$type = null;
  }

  set(type: TileType) {
    if (this.$type == null) {
      this.$type = type;
    } else {
      throw "This tile has already been set.";
    }
  }

  get type(): TileType | null {
    return this.$type;
  }
}

export class Board {
  $tiles: Tile[] = Array.from({ length: 9 }, (_, __) => new Tile());
  $currentlyNoughtsPlaying = true;

  runMove(position: number) {
    console.info(`${this.$currentlyNoughtsPlaying ? "Circle" : "Cross"} making move at position ${position}`);    
    let success = this.change(position, this.$currentlyNoughtsPlaying ? "Circle" : "Cross")
    if (success) {
      this.$currentlyNoughtsPlaying = !this.$currentlyNoughtsPlaying;
    }
  }

  
  public get currentTurn() : string {
    return this.$currentlyNoughtsPlaying ? "Nought" : "Cross"
  }
  

  change(position: number, type: TileType): boolean {
    try {
      this.$tiles[position]!.set(type);
      console.info("Syncing to firebase (TODO: sync to firebase)");
      return true;
    } catch (e) {
      let tile = this.$tiles[position];
      console.error(
        `Attempted to set tile type to ${type} at position ${position} when it is already ${tile.type}`,
      );
      return false;
    }
  }

  checkIfWon() {

  }

  getTile(position: number): Tile {
    return this.$tiles[position];
  }
}
