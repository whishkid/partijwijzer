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
  $: statementNumber = step - 1;
</script>

<div class="space-y-8">
  <!-- Statement Header -->
  <div class="card text-center">
    <div class="mb-4">
      <div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 mb-4">
        Stelling {statementNumber} van 30
      </div>
      <div class="text-xs uppercase tracking-wide text-gray-500 mb-2 font-medium">
        {statement.theme}
      </div>
    </div>
    
    <h2 class="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
      {#each statement.title as titleElement}
        {titleElement.text ?? titleElement}
      {/each}
    </h2>
  </div>

  <!-- Party Opinions -->
  <div class="space-y-6">
    {#each chosenParties as party}
      {@const opinion = party.statements.find((s) => s.id == statement.id)}
      
      <div class="card hover:shadow-xl transition-shadow duration-300">
        {#if opinion}
          <!-- Party with opinion -->
          <div class="space-y-4">
            <!-- Header with party and rating controls -->
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <PartyDisplay {party} />
              </div>
              
              <!-- Rating buttons -->
              <div class="flex items-center space-x-2">
                <RatingIcon
                  icon={RateMinusOne}
                  rating={-1}
                  {party}
                  {statement}
                  {partyStatementRatings}
                />
                <RatingIcon
                  icon={RatePlusOne}
                  rating={1}
                  {party}
                  {statement}
                  {partyStatementRatings}
                />
                <RatingIcon
                  icon={RatePlusTwo}
                  rating={2}
                  {party}
                  {statement}
                  {partyStatementRatings}
                />
              </div>
            </div>

            <!-- Party position indicator -->
            <div class="flex justify-center mb-4">
              <div class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium {
                opinion.position === 'agree' ? 'bg-green-100 text-green-800 border border-green-200' :
                opinion.position === 'disagree' ? 'bg-red-100 text-red-800 border border-red-200' :
                'bg-gray-100 text-gray-800 border border-gray-200'
              }">
                {#if opinion.position === 'agree'}
                  ✓ Eens
                {:else if opinion.position === 'disagree'}
                  ✗ Oneens
                {:else}
                  ⚬ Neutraal
                {/if}
              </div>
            </div>

            <!-- Party explanation -->
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div class="text-gray-800 leading-relaxed">
                {opinion.explanation}
              </div>
            </div>
          </div>
        {:else}
          <!-- Party without opinion -->
          <div class="space-y-4">
            <!-- Header with party and rating controls -->
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <PartyDisplay {party} />
              </div>
              
              <!-- Rating buttons (disabled state) -->
              <div class="flex items-center space-x-2 opacity-50">
                <RatingIcon
                  icon={RateMinusOne}
                  rating={-1}
                  {party}
                  {statement}
                  {partyStatementRatings}
                />
                <RatingIcon
                  icon={RatePlusOne}
                  rating={1}
                  {party}
                  {statement}
                  {partyStatementRatings}
                />
                <RatingIcon
                  icon={RatePlusTwo}
                  rating={2}
                  {party}
                  {statement}
                  {partyStatementRatings}
                />
              </div>
            </div>

            <!-- No position indicator -->
            <div class="flex justify-center mb-4">
              <div class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600 border border-gray-200">
                ⚪ Geen standpunt
              </div>
            </div>

            <!-- No opinion message -->
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
              <div class="text-gray-500 italic">
                Deze partij heeft geen standpunt ingenomen over deze stelling.
              </div>
            </div>
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <!-- Bottom instruction -->
  <div class="card bg-blue-50 border-blue-200">
    <div class="flex items-start space-x-3">
      <svg class="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
      </svg>
      <div>
        <h4 class="font-medium text-blue-900 mb-1">Hoe te beoordelen?</h4>
        <div class="text-blue-800 text-sm space-y-1">
          <div><span class="font-medium">❤️ Helemaal eens</span> - Je bent het volledig eens met deze partij (+2 punten)</div>
          <div><span class="font-medium">👍 Een beetje eens</span> - Je bent het grotendeels eens (+1 punt)</div>
          <div><span class="font-medium">👎 Oneens</span> - Je bent het niet eens met deze partij (-1 punt)</div>
          <div><span class="font-medium">😐 Geen reactie</span> - Neutraal of geen mening (0 punten)</div>
        </div>
      </div>
    </div>
  </div>
</div>
