import { readonly, writable } from "svelte/store";
import type { FirebaseUser } from "./user";
import { onAuthStateChanged, type User } from "firebase/auth";
import { AUTH } from "../firebase";

export const players = writable<Record<number, FirebaseUser>>({});
const firebaseUserWritable = writable<User | null>(null);
onAuthStateChanged(AUTH, firebaseUserWritable.set)
export const firebaseAuthUser = readonly(firebaseUserWritable);