<script>
  import PartyDisplay from "./PartyDisplay.svelte";

  import RateMinusOne from "./Rate_minus_one.svelte";
  import RatePlusOne from "./Rate_plus_one.svelte";
  import RatePlusTwo from "./Rate_plus_two.svelte";
  import RatingIcon from "./RatingIcon.svelte";
  import { statements } from "./data.js";
  export let chosenParties;
  export let step;
  export let partyStatementRatings;
  $: statement = statements[step - 2];
  let cols = 1; //chosenParties.length % 3 == 0 ? 3 : 2;
</script>

<div class="border-b-2 border-green-500 py-2 mb-2">
  <div class="font-bold text-prose">
    {#each statement.title as titleElement}
      {titleElement.text ?? titleElement}
    {/each}
  </div>
  
  <div class="grid grid-cols-1 lg:grid-cols-{cols} gap-2">
    {#each chosenParties as party}
      {@const opinion = party.statements.find((s) => s.id == statement.id)}

      {#if opinion}
        <div class="mt-2 border-0 border-t-2 border-dashed py-2 mb-2">
          <div class="flex flex-row gap-2 justify-between">
            <RatingIcon
              icon={RateMinusOne}
              rating={-1}
              color="red-600"
              {party}
              {statement}
              {partyStatementRatings}
            />
            <PartyDisplay {party} />
            <div class="flex flex-row">
              <RatingIcon
                icon={RatePlusOne}
                color="green-600"
                rating={1}
                {party}
                {statement}
                {partyStatementRatings}
              />
              <RatingIcon
                icon={RatePlusTwo}
                rating={2}
                color="red-600"
                {party}
                {statement}
                {partyStatementRatings}
              />
            </div>
          </div>
          <div class="flex flex-row my-2 justify-center text">
            <div
              class:bg-gray-600={opinion.position == "neither"}
              class:bg-red-600={opinion.position == "disagree"}
              class:bg-green-600={opinion.position == "agree"}
              class="w-32 text-white flex flex-row justify-center"
            >
              {opinion.position == "agree"
                ? "eens"
                : opinion.position == "disagree"
                ? "oneens"
                : "geen van beide"}
            </div>
          </div>

          <div>
            {opinion.explanation}
          </div>
        </div>
      {:else}
        <div class="mt-2 border-0 border-t-2 border-dashed py-2 mb-2">
          <div class="flex flex-row gap-2 justify-between">
            <RatingIcon
              icon={RateMinusOne}
              rating={-1}
              color="red-600"
              {party}
              {statement}
              {partyStatementRatings}
            />
            <PartyDisplay {party} />
            <div class="flex flex-row">
              <RatingIcon
                icon={RatePlusOne}
                color="green-600"
                rating={1}
                {party}
                {statement}
                {partyStatementRatings}
              />
              <RatingIcon
                icon={RatePlusTwo}
                rating={2}
                color="red-600"
                {party}
                {statement}
                {partyStatementRatings}
              />
            </div>
          </div>
          <div class="flex flex-row my-2 justify-center text">
            <div class="w-32 bg-gray-400 text-white flex flex-row justify-center">
              geen standpunt
            </div>
          </div>
          <div class="text-gray-500 italic">
            Deze partij heeft geen standpunt ingenomen over deze stelling.
          </div>
        </div>
      {/if}
    {/each}
  </div>
</div>
