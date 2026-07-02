import {
  child,
  get,
  onChildAdded,
  onDisconnect,
  onValue,
  push,
  ref,
  remove,
  runTransaction,
  set,
  type DatabaseReference,
} from "firebase/database";
import { AUTH, RDB } from ".";
import { SiteError } from "../models/error";
import { Board, type TileType } from "./board.svelte";

// if the player is circle, its there turn and they can append a move to the moves list
// ```yaml
// user: uid,
// position: int
// ```

// this has no cheating prevention but whatevs,
// the other user waits until a move is added to the moves list, then lets there player make a move,
// this switches back and forth until a member detects the game is won, then
// a timeout is started of 5 seconds, then if you are the owner of the game the game is reset

// makes a random id of length charachters long
function makeid(length: number) {
  let result = "";
  const characters = "abcdefghijklmnopqrstuvwxyz";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

type DatabaseMove = {
  uid: string;
  position: number;
};

type DatabaseGame = {
  owner: string;
  opponent: string;

  moves: { [id: string]: DatabaseMove };
};

// this class handles syncing internal board state to firebase
export class Game {
  isOwner: boolean;
  selfUid: string;
  ourTurn: boolean = $state(false);
  pincode: string;

  state:
    | {
        kind: "active";
        opponentUid: string;
      }
    | { kind: "awaitingOpponent" } = $state({ kind: "awaitingOpponent" });

  tileType: TileType;
  gameRef: DatabaseReference;
  board = $state(new Board());
  winData = $state<{ winnerUid: string; loserUid: string } | "draw">();

  private _subscriptions: (() => void)[] = [];

  private get opponentTileType(): TileType {
    return this.tileType === "Circle" ? "Cross" : "Circle";
  }
  private setupOpponentListener() {
    const unsub = onValue(child(this.gameRef, "opponent"), (snapshot) => {
      if (!snapshot.exists()) return;

      this.state = {
        kind: "active",
        opponentUid: snapshot.val(),
      };

      unsub();
    });

    this._subscriptions.push(unsub);
  }

  private constructor(
    tileType: TileType,
    opponentUid: string | undefined,
    isOwner: boolean,
    gameRef: DatabaseReference,
    pincode: string,
  ) {
    if (!AUTH.currentUser) throw new SiteError("USER_NOT_AUTHENTICATED");
    this.tileType = tileType;
    this.gameRef = gameRef;
    this.isOwner = isOwner;
    this.ourTurn = isOwner;
    this.pincode = pincode;
    this.selfUid = AUTH.currentUser.uid;

    if (opponentUid) {
      this.state = { kind: "active", opponentUid };
    } else {
      this.state = { kind: "awaitingOpponent" };
      this.setupOpponentListener();
    }

    // remove for everyone if you leave
    onDisconnect(this.gameRef).remove();

    // runs when theres a new move
    let moveUnsubscribe = onChildAdded(child(gameRef, "moves"), (snapshot) => {
      if (this.state.kind == "awaitingOpponent") return;
      let data = snapshot.val() as DatabaseMove;

      if (data.uid == this.state.opponentUid) {
        this.ourTurn = true;
      }
      // if its the opponents move, the tile is the opposite of yours
      let tileType: TileType =
        data.uid == this.state.opponentUid
          ? this.opponentTileType
          : this.tileType;

      this.board.change(data.position, tileType);

      // if the game is over, stop listening for moves, and handle the finish
      if (this.board.state.status !== "playing") {
        this.handleFinish();
      }
    });

    this._subscriptions.push(
      // remove the subscriptions if someone leaves
      onValue(gameRef, (snapshot) => {
        if (!snapshot.exists()) {
          this.destroy();
        }
      }),
      moveUnsubscribe,
      onValue(child(this.gameRef, "moves"), (snapshot) => {
        if (!snapshot.exists() && this.winData) {
          this.board = new Board();
          this.winData = undefined;
          // when the moves has been reset, hide the popup as well
          document.getElementById("winPopover")?.hidePopover();
        }
      }),
    );
  }
  destroy() {
    this._subscriptions.forEach((unsub) => unsub());
  }

  reset() {
    if (this.isOwner) {
      remove(child(this.gameRef, "moves"));
    }
  }

  private async handleFinish() {
    const status = this.board.state.status;
    if (this.state.kind !== "active") return;

    document.getElementById("winPopover")!.showPopover();

    if (status === "won") {
      const weWon = this.board.state.data.winner == this.tileType;

      this.winData = {
        winnerUid: weWon ? this.selfUid : this.state.opponentUid,
        loserUid: weWon ? this.state.opponentUid : this.selfUid,
      };
      // Run a transaction to safely increment win/loss records inside the lobby
      await runTransaction(ref(RDB, `users/${this.selfUid}`), (memberData) => {
        if (memberData) {
          if (weWon) {
            memberData.wins = (memberData.wins || 0) + 1;
          } else {
            memberData.losses = (memberData.losses || 0) + 1;
          }
        }
        return memberData;
      });
    } else if (status == "draw") {
      this.winData = "draw";
    }
  }

  // if its our turn, and we are in the playing state and the move is valid push a new move to the moves list, and set it to not be our turn
  async createMove(index: number) {
    if (
      !this.ourTurn ||
      this.board.state.status !== "playing" ||
      !this.board.checkMoveValid(index)
    )
      return;
    // no need to set it locally, the listener will handle that
    await push(child(this.gameRef, "moves"), {
      position: index,
      uid: this.selfUid,
    } as DatabaseMove);

    this.ourTurn = false;
  }

  // Creates a new game, and puts a new pincode to allow people to join
  static async createGame(): Promise<Game> {
    let user = AUTH.currentUser?.uid;
    if (!user) throw new SiteError("USER_NOT_AUTHENTICATED");

    let gamesRef = ref(RDB, "games");
    let gameRef = push(gamesRef, {
      owner: user,
      moves: [],
    });
    let pincode = makeid(5);
    set(ref(RDB, `pincodes/${pincode}`), gameRef.key);

    return new Game("Circle", undefined, true, gameRef, pincode);
  }

  // joins a already created game
  static async joinGame(pincode: string): Promise<Game> {
    if (!AUTH.currentUser) throw new SiteError("USER_NOT_AUTHENTICATED");
    let gameIdSnap = await get(ref(RDB, `pincodes/${pincode}`));
    if (!gameIdSnap.exists()) throw new SiteError("GAME_DOESNT_EXIST");
    let gameRef = ref(RDB, `games/${gameIdSnap.val()}`);
    await set(child(gameRef, "opponent"), AUTH.currentUser?.uid);
    let info = (await get(gameRef)).val() as DatabaseGame;

    return new Game("Cross", info.owner, false, gameRef, pincode);
  }
}
