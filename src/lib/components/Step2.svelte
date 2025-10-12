<script>
  import PartyDisplay from "./PartyDisplay.svelte";
  import RateMinusOne from "./Rate_minus_one.svelte";
  import RatePlusOne from "./Rate_plus_one.svelte";
  import RatePlusTwo from "./Rate_plus_two.svelte";
  import RatingIcon from "./RatingIcon.svelte";
  import { statements } from "../data/data.js";
  
  let { chosenParties, step, partyStatementRatings = $bindable(), partyOverlayVisible = $bindable() } = $props();
  
  let statement = $derived(statements[step - 2]);
  let statementNumber = $derived(step - 1);
</script>

<div class="space-y-8">
  <!-- Statement Header -->
  <div class="card">
    <div class="mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 mx-auto sm:mx-0">
          Stelling {statementNumber} van 30
        </div>
        <button 
          class="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 mx-auto sm:mx-0"
          onclick={() => (partyOverlayVisible = true)}
          title="Partijen wijzigen"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Partijen
        </button>
      </div>
      <div class="text-xs uppercase tracking-wide text-gray-500 mb-4 font-medium text-center">
        {statement.theme}
      </div>
    </div>
    
    <!-- Enhanced statement display for better mobile visibility -->
    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-blue-100">
      <h2 class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-relaxed text-center break-words">
        {#each statement.title as titleElement}
          {titleElement.text ?? titleElement}
        {/each}
      </h2>
    </div>
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
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div class="flex items-center space-x-3 min-w-0">
                <PartyDisplay {party} />
                <!-- Party position indicator (moved next to party) -->
                <div class="flex-shrink-0">
                  <div class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium {
                    opinion.position === 'agree' ? 'bg-green-100 text-green-800 border border-green-200' :
                    opinion.position === 'disagree' ? 'bg-red-100 text-red-800 border border-red-200' :
                    'bg-gray-100 text-gray-800 border border-gray-200'
                  }">
                    <span class="text-gray-500 mr-1">Partij standpunt:</span>
                    {#if opinion.position === 'agree'}
                      ✓ Eens
                    {:else if opinion.position === 'disagree'}
                      ✗ Oneens
                    {:else}
                      ⚬ Neutraal
                    {/if}
                  </div>
                </div>
              </div>
              
              <!-- Rating buttons -->
              <div class="flex items-center justify-center sm:justify-end space-x-3 flex-shrink-0">
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
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div class="flex items-center space-x-3 min-w-0">
                <PartyDisplay {party} />
                <!-- No position indicator (moved next to party) -->
                <div class="flex-shrink-0">
                  <div class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                    <span class="text-gray-500 mr-1">Standpunt:</span>
                    ⚪ Geen standpunt
                  </div>
                </div>
              </div>
              
              <!-- Rating buttons (disabled state) -->
              <div class="flex items-center justify-center sm:justify-end space-x-3 flex-shrink-0 opacity-50">
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
    <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-6">
      <div class="flex items-start space-x-3 flex-1">
        <svg class="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
        </svg>
        <div>
          <h4 class="font-medium text-blue-900 mb-1">Hoe te beoordelen?</h4>
          <div class="text-blue-800 text-sm space-y-1">
            <div><span class="font-medium">❤️ Helemaal eens</span> - Je bent het volledig eens met deze partij (+2 punten)</div>
            <div><span class="font-medium">👍 Een beetje eens</span> - Je bent het grotendeels eens (+1 punt)</div>
            <div><span class="font-medium">👎 Oneens</span> - Je bent het niet eens met deze partij (-1 punt)</div>
            <div><span class="font-medium">😐 Geen reactie  (je klikt dus geen van de drie like buttons)</span> - Neutraal of geen mening (0 punten)</div>
          </div>
        </div>
      </div>
      
      <!-- Party selection button -->
      <div class="flex-shrink-0 flex justify-center lg:justify-end">
        <button 
          class="inline-flex items-center px-4 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm w-full sm:w-auto"
          onclick={() => (partyOverlayVisible = true)}
          title="Wijzig je partijselectie"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Partijen wijzigen
        </button>
      </div>
    </div>
  </div>
</div>
