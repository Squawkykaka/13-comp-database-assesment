<script lang="ts">
  import {
    limitToFirst,
    onChildAdded,
    onChildChanged,
    onChildRemoved,
    onValue,
    orderByChild,
    query,
    ref,
  } from "firebase/database";
  import type { GameUser } from "../models/types";
  import { RDB } from "../firebase";

  let users: { [uid: string]: GameUser } = $state({});

  let q = query(ref(RDB, "users"), orderByChild("wins"), limitToFirst(20));
  onChildAdded(q, (snapshot) => {
    users[snapshot.key!] = snapshot.val();
  });
  onChildChanged(q, (snapshot) => {
    users[snapshot.key!] = snapshot.val();
  })
  onChildRemoved(q, (snapshot) => {
    delete users[snapshot.key!]
  })
</script>

<div>
  <a href="./.">Go Back</a>
  <table>
    <caption>High Scores (Top 20)</caption>
    <thead>
      <tr>
        <th>Profile Picture</th>
        <th>Username</th>
        <th>Wins</th>
        <th>Losses</th>
      </tr>
    </thead>
    <tbody>
      {#each Object.values(users).reverse() as guser}
        <tr>
          <td>
            {#if guser.photoURL}
              <img
                src={guser.photoURL}
                alt={guser.displayName + "'s profile"}
              />
            {/if}
          </td>
          <th scope="row">{guser.displayName}</th>
          <td>{guser.wins ?? 0}</td>
          <td>{guser.losses ?? 0}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  table {
    border-collapse: collapse;
    border: 2px solid rgb(140 140 140);
    font-family: sans-serif;
    font-size: 0.8rem;
    letter-spacing: 1px;
  }

  caption {
    caption-side: bottom;
    padding: 10px;
    font-weight: bold;
  }

  thead,
  tfoot {
    background-color: rgb(228 240 245);
  }

  th,
  td {
    border: 1px solid rgb(160 160 160);
    padding: 8px 10px;
  }

  td:last-of-type {
    text-align: center;
  }

  tbody > tr:nth-of-type(even) {
    background-color: rgb(237 238 242);
  }

  tfoot th {
    text-align: right;
  }

  tfoot td {
    font-weight: bold;
  }
</style>
