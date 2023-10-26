<script>
  export let color;
  export let rating;
  export let partyStatementRatings;
  export let party;
  export let statement;
  export let icon;

  function setRating(party, statement, rating) {
    let ratingMatrix = $partyStatementRatings
    if (!ratingMatrix[party.id]) ratingMatrix[party.id] = {};
    if (ratingMatrix[party.id][statement.id] == rating) {
        ratingMatrix[party.id][statement.id] = 0;
    } else ratingMatrix[party.id][statement.id] = rating;
    partyStatementRatings.set(ratingMatrix)
  }
</script>

<div
class="{$partyStatementRatings[party.id] &&
    $partyStatementRatings[party.id][statement.id] == rating ? `text-${color} fill-${color}` : 'fill-none'}"
  
>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="mx-2" on:click={setRating(party, statement, rating)}>
    <svelte:component this={icon} />
  </div>
</div>
