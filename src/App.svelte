<script lang="ts">
  import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
  import Board, { type Cell } from "./components/Board.svelte";
  import GameDisplay from "./components/GameDisplay.svelte";
  import { AUTH, currentFirebaseUser, RDB } from "./firebase";
  import { Game } from "./firebase/game.svelte";
  import { onValue, ref, update } from "firebase/database";
  import { FirebaseError } from "firebase/app";
  import Leaderboard from "./components/Leaderboard.svelte";
  import { SiteError } from "./models/error";
  import type { GameUser } from "./models/types";

  let signupPopup = $state<HTMLDialogElement>();

  let errorText = $state("");
  function showError(error: FirebaseError) {
    errorText = error.message;
    console.error(`[${error.code}]: ${error.message}\n${error}`);
  }

  let activeGame = $state<Game>();
  let boardShape = $derived<Cell[] | undefined>(
    activeGame?.board.gameBoard.map((old, idx) =>
      old
        ? {
            kind: "tile",
            tile: old.tile,
            status: old.win
              ? old.tile === activeGame?.tileType
                ? "win"
                : "loss"
              : undefined,
          }
        : {
            kind: "button",
            text: "",
            action: () => activeGame?.createMove(idx),
          },
    ),
  );

  $effect(() => {
    if (activeGame) {
      return onValue(activeGame.gameRef, (snapshot) => {
        if (!snapshot.exists()) {
          activeGame?.destroy();
          activeGame = undefined;
        }
      });
    }
  });
  // user listener to get user data
  let opponent = $state<GameUser>();
  let current = $state<GameUser>();
  $effect(() => {
    if (!activeGame || activeGame.state.kind == "awaitingOpponent") return;
    return onValue(
      ref(RDB, `users/${activeGame.state.opponentUid}`),
      (snapshot) => {
        if (!snapshot.exists()) return;
        let data = snapshot.val();
        opponent = {
          displayName: data.displayName,
          photoURL: data.photoURL,
          joinDate: data.joinDate,
          quote: data.quote,
          losses: data.losses ?? 0,
          wins: data.wins ?? 0,
          age: data.age,
          colour: data.colour,
          gender: data.gender,
          uid: snapshot.key!,
        };
      },
    );
  });
  $effect(() => {
    if (!$currentFirebaseUser) return;
    return onValue(
      ref(RDB, `users/${$currentFirebaseUser.uid}`),
      (snapshot) => {
        if (!snapshot.exists()) {
          current = undefined;
          signupPopup?.showModal();
          return
        }
        signupPopup?.close()
        let data = snapshot.val();

        current = {
          displayName: data.displayName,
          photoURL: data.photoURL,
          joinDate: data.joinDate,
          quote: data.quote,
          losses: data.losses ?? 0,
          wins: data.wins ?? 0,
          age: data.age,
          colour: data.colour,
          gender: data.gender,
          uid: snapshot.key!,
        };
      },
    );
  });

  let menuState: "menu" | "join" | "leaderboard" = $state("menu");

  let joinSubmit = async (event: SubmitEvent) => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const codeInput = form.elements.namedItem("code") as HTMLInputElement;
    codeInput.addEventListener("input", () => {
      codeInput.setCustomValidity("");
    });
    const data = Object.fromEntries(new FormData(form));
    const code = data.code as string;
    codeInput.setCustomValidity("");
    try {
      activeGame = await Game.joinGame(code);
    } catch (error) {
      form.reset();

      if (error instanceof SiteError) {
        codeInput.setCustomValidity(error.message);
      } else {
        codeInput.setCustomValidity("[UNKNOWN ERROR] " + error);
      }

      codeInput.reportValidity();
      console.error(error);
    }
  };

  let menu: Cell[] = [
    { kind: "tile", tile: "Cross" },
    { kind: "button", text: "Join", action: () => (menuState = "join") },
    { kind: "empty" },
    {
      kind: "button",
      text: "Create",
      // action: () => (createGame = Game.createGame()),
      action: async () => (activeGame = await Game.createGame()),
    },
    { kind: "empty" },
    { kind: "button", text: "Sign Out", action: () => signOut(AUTH) },
    { kind: "empty" },
    {
      kind: "button",
      text: "Scores",
      action: () => {
        menuState = "leaderboard";
      },
    },
    { kind: "tile", tile: "Circle" },
  ];
  let join: Cell[] = [
    { kind: "input", placeholder: "Enter Code...", onsubmit: joinSubmit },
    { kind: "empty" },
    { kind: "empty" },
    {
      kind: "button",
      text: "Go Back",
      action: () => {
        menuState = "menu";
      },
    },
    { kind: "empty" },
    { kind: "empty" },
    { kind: "empty" },
  ];
  let signInPressed = $state(false);
  currentFirebaseUser.subscribe((user) => {
    if (user == null) {
      signInPressed = false;
    }
  });
  let signin: Cell[] = $derived([
    signInPressed
      ? { kind: "message", text: "Loading..." }
      : {
          kind: "button",
          text: "Sign In",
          action: async () => {
            signInPressed = true;
            try {
              await signInWithPopup(AUTH, new GoogleAuthProvider());
            } catch (error) {
              if (error instanceof FirebaseError) {
                showError(error);
              }
              signInPressed = false;
            }
          },
        },
    { kind: "tile", tile: "Circle" },
    { kind: "empty" },
    { kind: "empty" },
    { kind: "tile", tile: "Cross" },
    { kind: "empty" },
    { kind: "empty" },
    { kind: "tile", tile: "Circle" },
    { kind: "tile", tile: "Cross" },
  ]);

  let updateSettings = (event: SubmitEvent) => {
    event.preventDefault()
    let target = event.target as HTMLFormElement;
    let data = Object.fromEntries(new FormData(target));    

    update(ref(RDB, `users/${AUTH.currentUser!.uid}`), {
      displayName: data.displayName,
      quote: data.quote,
      age: data.age,
      colour: data.colour,
      gender: data.gender,
    });
  };
</script>

<dialog bind:this={signupPopup}>
  <h3>Input Details</h3>
  <form onsubmit={updateSettings}>
    <div>
      <label for="displayName">Display Name</label>
      <input
        type="text"
        name="displayName"
        minlength="5"
        maxlength="15"
        value={current?.displayName}
        required
      />
    </div>

    <div>
      <label for="quote">Quote</label>
      <input type="text" name="quote" value={current?.quote} maxlength="50" />
    </div>

    <fieldset>
      <legend>Select a Gender:</legend>
      <div>
        <input
          type="radio"
          id="male"
          name="gender"
          value="male"
          required
          checked={current?.gender == "male"}
        />
        <label for="male">Male</label>
      </div>
      <div>
        <input
          type="radio"
          id="female"
          name="gender"
          value="female"
          checked={current?.gender == "female"}
        />
        <label for="female">Female</label>
      </div>
      <div>
        <input
          type="radio"
          id="non-binary"
          name="gender"
          value="non-binary"
          checked={current?.gender == "non-binary"}
        />
        <label for="non-binary">Non Binary</label>
      </div>
      <div>
        <input
          type="radio"
          name="gender"
          id="prefernottosay"
          value="prefernottosay"
          checked={current?.gender == "prefernottosay"}
        />
        <label for="prefernottosay">Prefer not to say</label>
      </div>
    </fieldset>

    <div>
      <label for="age">Age</label>
      <input
        type="number"
        name="age"
        id="age"
        min="5"
        max="99"
        value={current?.age}
        required
      />
    </div>

    <div>
      <label for="colour">Favourite Colour</label>
      <input
        type="color"
        name="colour"
        id="colour"
        required
        value={current?.colour}
      />
    </div>

    <button>Save Changes</button>
  </form>
</dialog>

<div class="container">
  {#if activeGame?.state.kind == "awaitingOpponent"}
    <div>
      <p>Waiting for Opponent...</p>
      <p>Code: {activeGame.pincode}</p>
    </div>
  {:else if activeGame?.state.kind == "active"}
    {#if !opponent || !current}
      Joining Game...
    {:else}
      <GameDisplay {activeGame} {opponent} {current} />
    {/if}
  {/if}
  {#if menuState == "leaderboard"}
    <Leaderboard />
    <button onclick={() => (menuState = "menu")}>Go Back</button>
  {:else}
    <main class="game-board">
      <Board
        cells={$currentFirebaseUser
          ? boardShape
            ? boardShape
            : menuState == "menu"
              ? menu
              : menuState == "join"
                ? join
                : []
          : signin}
      />
      <p>{errorText}</p>
    </main>
  {/if}
</div>

<style>
  .container {
    position: absolute;
    height: 100%;
    width: 100%;

    display: grid;
    grid-template-columns: 1fr 2fr;
    align-items: center;
    justify-content: space-between;
  }

  .game-board {
    position: relative;
    width: min(70vh, 90vw);
    left: 50%;
    grid-column: 2;
    aspect-ratio: 1;
    transform: translate(-50%);
  }

  dialog::backdrop {
    backdrop-filter: blur(8px);
    background: rgb(0 0 0 / 40%);
  }
</style>
