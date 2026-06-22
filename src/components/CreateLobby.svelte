<script lang="ts">
  import { Lobby, LOBBY } from "../firebase/lobby.svelte";
  import type { GameStyle, MultiplayerMode, GameMode } from "../models/types";
  import Board from "./Board.svelte";
  import Tile from "./Tile.svelte";

  let gameMode = $state<GameMode>("original");
  let multiplayerType = $state<MultiplayerMode>();
  let gameStyle = $state<GameStyle>("onevone");

  $effect(() => {
    if (gameMode && multiplayerType && gameStyle) {
      Lobby.create({
        gameMode,
        gameStyle,
        multiplayerType,
        description: "",
      }).then((next) => {
        LOBBY.set(next);
      });
    }
  });
</script>

<Board>
  <Tile tile="Cross" />
  <Tile disabled />
  <Tile
    message="Original"
    onclick={() => (gameMode = "original")}
    tile={gameMode == "original" ? "Cross" : undefined}
  />
  <Tile disabled />
  <Tile
    message="Private"
    onclick={() => {
      multiplayerType = "private";
    }}
    tile={multiplayerType == "private" ? "Cross" : undefined}
  />
  <Tile
    message="Public"
    onclick={() => {
      multiplayerType = "public";
    }}
    tile={multiplayerType == "public" ? "Cross" : undefined}
  />
  <Tile tile="Circle" />
  <Tile disabled />
  <Tile
    message="One v One"
    onclick={() => {
      gameStyle = "onevone";
    }}
    tile={gameStyle == "onevone" ? "Cross" : undefined}
  />
</Board>
