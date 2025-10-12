<script>
  let { rating, partyStatementRatings, party, statement, icon } = $props();

  function setRating(party, statement, rating) {
    let ratingMatrix = partyStatementRatings
    if (!ratingMatrix[party.id]) ratingMatrix[party.id] = {};
    if (ratingMatrix[party.id][statement.id] == rating) {
        ratingMatrix[party.id][statement.id] = 0;
    } else ratingMatrix[party.id][statement.id] = rating;
    // Note: partyStatementRatings should be bindable or use a function to update
  }

  let isActive = $derived(partyStatementRatings[party.id] && partyStatementRatings[party.id][statement.id] == rating);
  let buttonClass = $derived(`
    p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer 
    hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2
    ${isActive 
      ? rating === 2 ? 'border-red-500 bg-red-50 text-red-600 shadow-md' :
        rating === 1 ? 'border-green-500 bg-green-50 text-green-600 shadow-md' :
        'border-red-500 bg-red-50 text-red-600 shadow-md'
      : 'border-gray-300 bg-white text-gray-400 hover:border-gray-400 hover:text-gray-600'
    }
  `);
</script>

<button
  class={buttonClass}
  onclick={() => setRating(party, statement, rating)}
  aria-label="{
    rating === 2 ? 'Helemaal eens (+2 punten)' :
    rating === 1 ? 'Een beetje eens (+1 punt)' :
    'Oneens (-1 punt)'
  }"
  title="{
    rating === 2 ? 'Helemaal eens (+2 punten)' :
    rating === 1 ? 'Een beetje eens (+1 punt)' :
    'Oneens (-1 punt)'
  }"
>
  <svelte:component this={icon} />
</button>
