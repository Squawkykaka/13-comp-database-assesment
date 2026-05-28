import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { EVENT_BUS } from "../models/eventBus";
import { AUTH } from ".";

async function signInGoogle() {
    const userCred = await signInWithPopup(AUTH, new GoogleAuthProvider());
}