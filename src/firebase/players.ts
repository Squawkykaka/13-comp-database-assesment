import { collection } from "firebase/firestore"
import { DB } from "."

const gameRef = collection(DB, "games/tictactoe");
const lobbyRef = (lobbyId: string) => collection(gameRef, "lobbies", lobbyId);
const userRef = (uid: string) => collection(DB, "users", uid).withConverter();