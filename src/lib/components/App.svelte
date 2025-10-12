<script>
  import { slide } from "svelte/transition";
  import { onMount } from "svelte";
  import { H1, H2, H3, H4, Step1, Step2, PartyDisplay, parties, statements } from "$lib";

  // State using Svelte 5 runes
  let chosenParties = $state([]);
  let step = $state(1);
  let maxParties = 25;
  let isopen = $state(false);
  let partyOverlayVisible = $state(false);
  let partyStatementRatings = $state({});

  // Initialize from localStorage on mount
  onMount(() => {
    const storedPartyStatementRatings = localStorage.getItem("partyStatementRatings");
    const storedChosenParties = JSON.parse(localStorage.getItem("chosenParties") || "[]");
    const storedStep = localStorage.getItem("step");

    chosenParties = parties.filter((p) =>
      storedChosenParties.find((cp) => cp.id == p.id)
    );
    step = JSON.parse(storedStep || "1");
    partyStatementRatings = JSON.parse(storedPartyStatementRatings || "{}");
  });

  // Derived state
  let partySelectionInValid = $derived(
    chosenParties.length < 2 || chosenParties.length > maxParties
  );

  function getPartyScores(partyMatrix) {
    let partyScores = [];
    for (let partyId in partyMatrix) {
      let partyScore = 0;
      for (let statementId in partyMatrix[partyId]) {
        partyScore += partyMatrix[partyId][statementId];
      }
      const foundParty = chosenParties.find((p) => p.id == partyId);
      if(!foundParty) continue;
      partyScores.push({
        id: partyId,
        score: partyScore,
        name: foundParty.name,
        logo: foundParty.logo,
        logoIndex: foundParty.logoIndex,
        fullName: foundParty.fullName,
      });
    }
    return partyScores.sort((a, b) => b.score - a.score);
  }

  // Effects for localStorage persistence (SSR disabled, so safe to use)
  $effect(() => {
    localStorage.setItem("partyStatementRatings", JSON.stringify(partyStatementRatings));
  });

  $effect(() => {
    localStorage.setItem("chosenParties", JSON.stringify(chosenParties));
  });

  $effect(() => {
    localStorage.setItem("step", JSON.stringify(step));
  });

  function reset(){
    step = 1;
    chosenParties = [];
    partyStatementRatings = {};
  }

  // Scroll to top when step changes
  $effect(() => {
    if (step) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  });
</script>

<svelte:head>
  <title>Partijwijzer - Vind jouw politieke match</title>
  <meta name="description" content="Ontdek welke politieke partij het beste bij jouw standpunten past">
</svelte:head>

<main class="min-h-screen">
  <!-- Header -->
  <header class="bg-white/90 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
      <div class="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:items-center sm:justify-between">
        <button onclick={() => step = 1} class="cursor-pointer text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent text-center sm:text-left border-0 bg-transparent p-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded">
          <H1 class="m-0 text-xl sm:text-2xl">
            {#snippet children()}Partijwijzer{/snippet}
          </H1>
        </button>
        
        <!-- Progress Indicator -->
        <div class="flex-1 max-w-md mx-0 sm:mx-8">
          <div class="bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden">
            <div 
              class="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 ease-out"
              style="width: {Math.min((step / 32) * 100, 100)}%"
            ></div>
          </div>
          <div class="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2 text-center">
            {#if step === 1}
              Partijen selecteren
            {:else if step <= 31}
              Stelling {step - 1} van 30
            {:else}
              Resultaten
            {/if}
          </div>
        </div>

        <!-- Step Navigation -->
        <div class="flex items-center gap-2 sm:gap-3 justify-center sm:justify-end">
          <button 
            class="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all duration-200"
            disabled={step === 1}
            onclick={() => step--}
          >
            <svg class="w-4 h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span class="hidden sm:inline">Vorige</span>
            <span class="sm:hidden">←</span>
          </button>
          
          <select 
            class="text-xs sm:text-sm border border-gray-300 rounded-lg px-2 sm:px-3 py-2 bg-white min-w-[120px] sm:min-w-[200px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={partySelectionInValid} 
            bind:value={step}
          >
            <option value={1}>Partijen kiezen</option>
            {#each Array(30) as _, i}
              <option value={i + 2}>
                {i + 1}. {statements[i].theme}
              </option>
            {/each}
            <option value={32}>Resultaten</option>
          </select>
          
          <button 
            class="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent rounded-lg text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 transition-all duration-200"
            disabled={partySelectionInValid || step > 31} 
            onclick={() => step++}
          >
            <span class="hidden sm:inline">Volgende</span>
            <span class="sm:hidden">→</span>
            <svg class="w-4 h-4 ml-1 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </header>  <!-- Party Overlay -->
  {#if partyOverlayVisible}
    <div
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
      in:slide={{ duration: 800 }}
      out:slide={{ duration: 400 }}
    >
      <div class="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div class="p-4 sm:p-6">
          <div class="flex items-center justify-between mb-6">
            <H2 class="text-xl mb-0">
              {#snippet children()}Partijen selecteren{/snippet}
            </H2>
            <button 
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              onclick={() => (partyOverlayVisible = false)}
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Sluiten
            </button>
          </div>
          <Step1 bind:chosenParties {maxParties} />
        </div>
      </div>
    </div>
  {/if}

  <!-- Main Content -->
  <div class="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
    {#if step === 1}
      <div class="animate-fade-in">
        <!-- Welcome Section -->
        <div class="bg-white rounded-xl shadow-lg p-6 border border-slate-200 mb-8 text-center">
          <div class="mb-6">
            <H2 class="font-bold">
              {#snippet children()}Welkom bij de Partijwijzer{/snippet}
            </H2>
            <p class="text-lg text-gray-600 max-w-2xl mx-auto">
              Ontdek welke politieke partij het beste aansluit bij jouw standpunten. 
              Selecteer eerst de partijen die je wilt vergelijken.
            </p>
          </div>
          
          <!-- Explanation about nuanced approach -->
          <div class="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200 max-w-3xl mx-auto">
            <div class="flex items-start space-x-3">
              <svg class="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              <div class="text-left">
                <H4 class="text-amber-900">
                  {#snippet children()}Nuancering in plaats van simpel eens/oneens{/snippet}
                </H4>
                <p class="text-amber-800 text-sm leading-relaxed">
                  Deze partijwijzer richt zich op de <strong>daadwerkelijke stellingen</strong> van politieke partijen, 
                  niet op simpele eens/oneens antwoorden. Door gradaties te gebruiken (helemaal eens, een beetje eens, oneens, neutraal) 
                  krijg je een veel genuanceerder beeld van de politieke standpunten en kun je de <strong>fijnere verschillen</strong> 
                  tussen partijen beter begrijpen.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Party Selection -->
        <div class="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <Step1 bind:chosenParties {maxParties} />
        </div>

        <!-- Instructions -->
        <div class="bg-white rounded-xl shadow-lg p-6 border border-slate-200 mt-8">
          <H3 class="text-xl">
            {#snippet children()}Hoe werkt het?{/snippet}
          </H3>
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <div class="flex items-start space-x-3 mb-4">
                <div class="bg-blue-100 text-blue-600 rounded-full p-2 mt-1">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div>
                  <H4 class="mb-1">
                    {#snippet children()}1. Partijen selecteren{/snippet}
                  </H4>
                  <p class="text-gray-600 text-sm">Kies 2-{maxParties} partijen die je wilt vergelijken</p>
                </div>
              </div>
              
              <div class="flex items-start space-x-3 mb-4">
                <div class="bg-blue-100 text-blue-600 rounded-full p-2 mt-1">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
                <div>
                  <H4 class="mb-1">
                    {#snippet children()}2. Stellingen beoordelen{/snippet}
                  </H4>
                  <p class="text-gray-600 text-sm">Geef je mening over 30 politieke stellingen</p>
                </div>
              </div>
            </div>
            
            <div>
              <div class="flex items-start space-x-3 mb-4">
                <div class="bg-blue-100 text-blue-600 rounded-full p-2 mt-1">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <H4 class="mb-1">
                    {#snippet children()}3. Resultaten bekijken{/snippet}
                  </H4>
                  <p class="text-gray-600 text-sm">Zie welke partij het beste bij je past</p>
                </div>
              </div>

              <div class="bg-gray-50 rounded-lg p-4 mt-6">
                <H4>
                  {#snippet children()}Beoordeling{/snippet}
                </H4>
                <div class="space-y-1 text-sm text-gray-600">
                  <div>❤️ Helemaal eens (+2 punten)</div>
                  <div>👍 Een beetje eens (+1 punt)</div>
                  <div>👎 Oneens (-1 punt)</div>
                  <div>😐 Neutraal (0 punten)</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
              </svg>
              <div>
                <H4 class="text-blue-900 mb-1">
                  {#snippet children()}Privacy{/snippet}
                </H4>
                <p class="text-blue-800 text-sm">
                  Deze applicatie werkt volledig lokaal op jouw apparaat. Er worden geen gegevens naar servers gestuurd. 
                  Je antwoorden worden alleen in jouw browser opgeslagen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}

    {#if step > 1 && step <= 31 && !partyOverlayVisible}
      <div class="animate-fade-in">
        <Step2 bind:partyStatementRatings {chosenParties} {step} bind:partyOverlayVisible />
      </div>
    {/if}

    {#if step > 31}
      <div class="animate-fade-in">
        <div class="bg-white rounded-xl shadow-lg p-6 border border-slate-200 text-center mb-8">
          <H2 class="font-bold">
            {#snippet children()}Jouw resultaten{/snippet}
          </H2>
          <p class="text-lg text-gray-600">
            Op basis van jouw antwoorden zijn dit de partijen die het beste bij je passen:
          </p>
        </div>

        <div class="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <div class="space-y-4">
            {#each getPartyScores(partyStatementRatings) as party, index}
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                <div class="flex items-center space-x-4">
                  <div class="bg-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-blue-600 border-2 border-blue-200 shadow-sm">
                    {index + 1}
                  </div>
                  <PartyDisplay {party} />
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-gray-900">{party.score}</div>
                  <div class="text-sm text-gray-500">punten</div>
                </div>
              </div>
            {/each}
          </div>
          
          <div class="mt-8 pt-6 border-t border-gray-200 text-center space-x-4">
            <button 
              class="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              onclick={reset}
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Opnieuw beginnen
            </button>
            <button 
              class="inline-flex items-center px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              onclick={() => (partyOverlayVisible = true)}
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
    {/if}
  </div>
</main>
