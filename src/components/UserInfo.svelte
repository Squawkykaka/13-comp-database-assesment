<script lang="ts">
  import { firebaseUser } from "../models/stores";
</script>

<div>
  {#if $firebaseUser !== null}
    <img
      src={$firebaseUser.photoURL ?? "https://placehold.co/80"}
      alt="user profile"
    />
    <p>{$firebaseUser.displayName}</p>
  {/if}
</div>
