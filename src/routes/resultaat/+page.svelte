<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { H2, PartyDisplay, getPartyScores, parties } from '$lib';
	import type { PartyStatementRatings } from '$lib';
	import type { party } from '$lib/data/parties';

	// State using Svelte 5 runes
	let chosenParties: party[] = $state([]);
	let partyStatementRatings: PartyStatementRatings = $state({});

	// Initialize from localStorage on mount
	onMount(() => {
		const storedPartyStatementRatings = localStorage.getItem('partyStatementRatings');
		const storedChosenParties: party[] = JSON.parse(localStorage.getItem('chosenParties') || '[]');

		chosenParties = parties.filter((p) => storedChosenParties.find((cp) => cp.id == p.id));
		partyStatementRatings = JSON.parse(storedPartyStatementRatings || '{}');

		// Redirect to intro if no parties selected
		if (chosenParties.length < 2) {
			goto('/intro');
		}

		// Save that we're on step 32 (results page)
		localStorage.setItem('step', JSON.stringify(32));
	});

	function reset(): void {
		chosenParties = [];
		partyStatementRatings = {};
		localStorage.removeItem('partyStatementRatings');
		localStorage.removeItem('chosenParties');
		goto('/intro');
	}
</script>

<svelte:head>
	<title>Resultaten - Partijwijzer</title>
	<meta
		name="description"
		content="Jouw partijwijzer resultaten - zie welke partijen het beste bij jouw standpunten passen"
	/>
</svelte:head>

<main class="min-h-screen">
	<!-- Header -->
	<header class="sticky top-0 z-50 border-b border-gray-200/50 bg-white/90 backdrop-blur-lg">
		<div class="mx-auto max-w-6xl px-3 py-3 sm:px-4 sm:py-4">
			<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
				<button
					onclick={() => goto('/intro')}
					class="cursor-pointer rounded border-0 bg-transparent bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text p-0 text-center text-xl font-bold text-transparent focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none sm:text-left sm:text-2xl"
				>
					Partijwijzer
				</button>

				<!-- Progress Indicator -->
				<div class="mx-0 max-w-md flex-1 sm:mx-8">
					<div class="h-2 overflow-hidden rounded-full bg-gray-200 sm:h-3">
						<div
							class="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
							style="width: 100%"
						></div>
					</div>
					<div class="mt-1 text-center text-xs text-gray-600 sm:mt-2 sm:text-sm">Resultaten</div>
				</div>

				<!-- Navigation -->
				<div class="flex items-center justify-center gap-2 sm:justify-end sm:gap-3">
					<button
						class="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none sm:px-4 sm:text-sm"
						onclick={reset}
					>
						<svg class="mr-1 h-4 w-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
							/>
						</svg>
						<span class="hidden sm:inline">Opnieuw</span>
						<span class="sm:hidden">↻</span>
					</button>
				</div>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<div class="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-8">
		<div class="animate-fade-in">
			<!-- Header -->
			<div class="mb-8 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-lg">
				<H2 class="font-bold">Jouw resultaten</H2>
				<p class="text-lg text-gray-600">
					Op basis van jouw antwoorden zijn dit de partijen die het beste bij je passen:
				</p>
			</div>

			<!-- Results -->
			<div class="rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
				<div class="space-y-4">
					{#each getPartyScores(partyStatementRatings, chosenParties) as party, index (party.id)}
						<div
							class="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4 transition-shadow hover:shadow-md"
						>
							<div class="flex items-center space-x-4">
								<div
									class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-200 bg-white font-bold text-blue-600 shadow-sm"
								>
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

				<!-- Action Buttons -->
				<div class="mt-8 space-x-4 border-t border-gray-200 pt-6 text-center">
					<button
						class="inline-flex items-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
						onclick={reset}
					>
						<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
							/>
						</svg>
						Opnieuw beginnen
					</button>
					<button
						class="inline-flex items-center rounded-lg border border-transparent bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
						onclick={() => goto('/intro')}
					>
						<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
							/>
						</svg>
						Partijen wijzigen
					</button>
				</div>
			</div>

			<!-- Share Section -->
			<div class="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-6 shadow-lg">
				<div class="text-center">
					<h3 class="mb-2 text-lg font-semibold text-blue-900">Deel je resultaten</h3>
					<p class="mb-4 text-sm text-blue-800">
						Vond je de partijwijzer nuttig? Deel hem met vrienden en familie!
					</p>
					<button
						class="inline-flex items-center rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-medium text-blue-700 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
						onclick={() => {
							if (navigator.share) {
								navigator.share({
									title: 'Partijwijzer - Vind jouw politieke match',
									text: 'Ik heb de Partijwijzer gedaan! Probeer het zelf ook.',
									url: window.location.origin
								});
							} else {
								navigator.clipboard.writeText(window.location.origin);
								alert('Link gekopieerd naar klembord!');
							}
						}}
					>
						<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
							/>
						</svg>
						Deel link
					</button>
				</div>
			</div>
		</div>
	</div>
</main>
