<script>
  let { children } = $props();
</script>

<div class="container">
  {@render children?.()}
</div>

<style>
  .container {
    height: 100%;
    aspect-ratio: 1;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 25px;
    background: black;
  }
</style>
