import { writable } from "svelte/store";
import type { PlayerInfo } from "./user";

export const players = writable<Record<number, PlayerInfo>>({});
