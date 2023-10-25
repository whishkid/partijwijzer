<script>
  import { parties } from "./data.js";
  import Warning from "./Warning.svelte";
  export let chosenParties;
  export let maxParties;
</script>

<div class="bg-green-200 font-bold p-2 rounded-xl">
  Vink 2-{maxParties} partijen aan die je wilt vergelijken
</div>
<div class="flex flex-row gap-2 mt-2">
  <div
    on:click={() => (chosenParties = [...parties])}
    class="cursor-pointer text-red-600"
  >
   [Alles aan]
  </div>
  <div
    on:click={() => (chosenParties = [])}
    class="cursor-pointer text-red-600"
  >
    [Alles uit]
  </div>
</div>
<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-2 lg:grid-cols-3 p-2">
  {#each parties.sort( (a, b) => (b.name < a.name ? 1 : a.name == b.name ? 0 : -1) ) as party}
    <div class="flex flex-row whitespace-nowrap">
      <input
        id={party.id}
        type="checkbox"
        bind:group={chosenParties}
        value={party}
        class="mr-2"
      />
      <label class="truncate select-none" title={party.name} for={party.id}
        >{party.name}</label
      >
    </div>
  {/each}
</div>

{#if chosenParties.length > 1 && chosenParties.length <= maxParties}
  <div class="py-2">
    Gekozen: {chosenParties.map((p) => " " + p.name + " ")}
  </div>
{/if}

<Warning visible={chosenParties.length < 2} text="Kies minimaal 2 parijen" />
<Warning
  visible={chosenParties.length > maxParties}
  text="Kies maximaal 8 parijen"
/>
