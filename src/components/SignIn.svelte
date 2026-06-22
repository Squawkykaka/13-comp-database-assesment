<script>
  import { signInGoogle } from "../firebase";
  import Board from "./Board.svelte";
  import Tile from "./Tile.svelte";
</script>

<div class="container">
  <Board>
    <Tile message="Sign In" onclick={signInGoogle} />
    <Tile tile="Circle" />
    <Tile disabled/>
    <Tile disabled/>
    <Tile tile="Cross" />
    <Tile disabled/>
    <Tile disabled/>
    <Tile tile="Circle" />
    <Tile tile="Cross" />
  </Board>
</div>

<style>
  .container {
    width: min(70vh, 90vw);
    aspect-ratio: 1;

    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>
