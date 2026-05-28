<script lang="ts">
  import { currentUser } from "../firebase/user";

  currentUser.subscribe(data => console.log("Current User:", data));
</script>

<div>
  {#if $currentUser !== null}
    <img
      src={$currentUser.photoURL ?? "https://placehold.co/80"}
      alt="user profile"
    />
    <p>{$currentUser.displayName}</p>
    <p><strong>Wins:</strong> {$currentUser.wins}</p>
    <p><strong>Losses:</strong> {$currentUser.losses}</p>
  {/if}
</div>
