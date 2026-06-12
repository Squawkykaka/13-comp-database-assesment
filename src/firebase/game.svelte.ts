import {
  child,
  get,
  onChildAdded,
  onDisconnect,
  onValue,
  push,
  ref,
  runTransaction,
  type DatabaseReference,
} from "firebase/database";
import { Board, type TileType } from "../game/board";
import { AUTH, RDB } from ".";
import { SiteError } from "../models/error";
import { writable, type Readable, get as getStore } from "svelte/store";
import { LOBBY } from "./lobby.svelte";

// the host when starting the game splits members into games, setting the `activeGame` setting in there members list to the game id
// the host chooses what member is circle or cross

// when a member listener fires with the active game, the client begins listening, and updates the screen with the opponent

// if the player is circle, its there turn and they can append a move to the moves list
// ```yaml
// user: uid,
// position: int
// ```

// this has no cheating prevention but whatevs,
// the other user waits until a move is added to the moves list, then lets there player make a move,
// this switches back and forth until a member detects the game is won, which then sets `winner = uidofwinner`

// once a game is done, `completed = true` is marked on the game, and the winner's uid is set on the `winner` field
// both members then remove activeGame from there profiles

// the screen lets them pick games to spectate,
// when theres enough players for another round without the same users the host starts a new game

// after 15 minutes, the player with the highest score is declared the winner (this is for onevone mode)

export const activeGame = writable<Game | undefined>();

type DatabaseMove = {
  userUid: string;
  position: number;
};

type DatabaseGame = {
  circleUid: string;
  crossUid: string;

  moves: { [id: string]: DatabaseMove };

  winner: string | undefined;
  completed: boolean;
};

export class Game {
  opponentUid: string;
  tileType: TileType;
  ourTurn: boolean;
  gameRef: DatabaseReference;
  board = $state(new Board());

  winData = writable<{ winnerUid: string; loserUid: string } | "draw">();

  private _boardShapeStore = writable<
    ({ type: TileType; win: boolean } | null)[]
  >(Array(9).fill(null));

  private _subscriptions: (() => void)[] = [];

  get boardShape(): Readable<({ type: TileType; win: boolean } | null)[]> {
    return { subscribe: this._boardShapeStore.subscribe };
  }

  private updateBoardShapeStore() {
    let array = [];
    for (let i = 0; i < 9; i++) {
      array.push(this.board.getTile(i));
    }
    this._boardShapeStore.set(array);
  }

  private constructor(
    tileType: TileType,
    opponentUid: string,
    gameRef: DatabaseReference,
  ) {
    this.tileType = tileType;
    this.gameRef = gameRef;
    this.opponentUid = opponentUid;
    this.ourTurn = $state(tileType == "Circle" ? true : false);

    onDisconnect(this.gameRef).remove();

    this.updateBoardShapeStore();

    // runs when theres a new move
    let moveUnsubscribe = onChildAdded(child(gameRef, "moves"), (snapshot) => {
      let data = snapshot.val() as DatabaseMove;

      if (data.userUid == opponentUid) {
        this.ourTurn = true;
      }

      let tileType: TileType =
        data.userUid == opponentUid
          ? this.tileType == "Circle"
            ? "Cross"
            : "Circle"
          : this.tileType;

      this.board.change(data.position, tileType);
      this.board.$updateGameState();
      this.updateBoardShapeStore();

      if (this.board.state.status !== "playing") {
        moveUnsubscribe();
        this.handleFinish();
      }
    });

    // so these get destoryed when the game is over
    this._subscriptions.push(
      onValue(gameRef, (snapshot) => {
        if (!snapshot.exists()) {
          console.log("yerted");

          this.destroy();
        }
      }),
      moveUnsubscribe,
    );
  }
  destroy() {
    this._subscriptions.forEach((unsub) => unsub());
    activeGame.set(undefined);
  }

  private async handleFinish() {
    const status = this.board.state.status;
    const currentUid = AUTH.currentUser?.uid;
    const lobbyInstance = getStore(LOBBY);

    if (!currentUid || !lobbyInstance) return;
    document.getElementById("winPopover")!.showPopover();

    // Check if there's a definitive winner (ignore draws)
    if (status === "won") {
      const weWon = this.board.state.data.winner == this.tileType;

      this.winData.set({
        winnerUid: weWon ? AUTH.currentUser?.uid! : this.opponentUid,
        loserUid: weWon ? this.opponentUid : AUTH.currentUser?.uid!,
      });
      const memberScoreRef = child(
        lobbyInstance.lobbyRef,
        `members/${currentUid}`,
      );

      // Run a transaction to safely increment win/loss records inside the lobby
      await runTransaction(memberScoreRef, (memberData) => {
        if (memberData) {
          if (weWon) {
            memberData.wins = (memberData.wins || 0) + 1;
          } else {
            memberData.losses = (memberData.losses || 0) + 1;
          }
        }
        return memberData;
      });
    }
  }

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
      userUid: AUTH.currentUser?.uid,
    } as DatabaseMove);

    this.ourTurn = false;
  }

  static async joinGame(gameId: string): Promise<Game> {
    let gameRef = ref(RDB, "games/" + gameId);
    let info = (await get(gameRef)).val() as DatabaseGame;

    let opponentUid =
      info.circleUid == AUTH.currentUser?.uid ? info.crossUid : info.circleUid;
    let tileType: TileType | undefined =
      info.circleUid == AUTH.currentUser?.uid
        ? "Circle"
        : info.crossUid == AUTH.currentUser?.uid
          ? "Cross"
          : undefined;
    if (tileType === undefined) {
      throw new SiteError("USER_NOT_AUTHENTICATED");
    }

    return new Game(tileType, opponentUid, gameRef);
  }
}