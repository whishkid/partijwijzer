<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { H1, H3, H4, Step1, parties } from '$lib';
	import type { party } from '$lib/data/parties';

	// State using Svelte 5 runes
	let chosenParties: party[] = $state([]);
	let maxParties = 25;

	// Initialize from localStorage on mount
	onMount(() => {
		const storedChosenParties: party[] = JSON.parse(localStorage.getItem('chosenParties') || '[]');
		chosenParties = parties.filter((p) => storedChosenParties.find((cp) => cp.id == p.id));

		// Save that we're on step 1 (intro page)
		localStorage.setItem('step', JSON.stringify(1));
	});

	// Effect for localStorage persistence
	$effect(() => {
		localStorage.setItem('chosenParties', JSON.stringify(chosenParties));
	});

	// Navigate to first statement when valid selection
	function startQuestionnaire(): void {
		if (chosenParties.length >= 2 && chosenParties.length <= maxParties) {
			goto('/stelling/hypotheekrenteaftrek');
		}
	}

	// Derived state
	let isValid = $derived(chosenParties.length >= 2 && chosenParties.length <= maxParties);
</script>

<svelte:head>
	<title>Partijkeuze - Partijwijzer</title>
	<meta
		name="description"
		content="Selecteer politieke partijen om te vergelijken in de Partijwijzer"
	/>
</svelte:head>

<main class="min-h-screen bg-gray-50">
	<div class="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-8">
		<!-- Welcome Section -->
		<div class="mb-8 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-lg">
			<div class="mb-6">
				<H1 class="mb-4">Welkom bij de Partijwijzer</H1>
				<p class="mx-auto max-w-2xl text-lg text-gray-600">
					Ontdek welke politieke partij het beste aansluit bij jouw standpunten. Selecteer eerst de
					partijen die je wilt vergelijken.
				</p>
			</div>

			<!-- Explanation about nuanced approach -->
			<div class="mx-auto mt-6 max-w-3xl rounded-lg border border-amber-200 bg-amber-50 p-4">
				<div class="flex items-start space-x-3">
					<svg
						class="mt-0.5 h-6 w-6 flex-shrink-0 text-amber-600"
						fill="currentColor"
						viewBox="0 0 20 20"
					>
						<path
							fill-rule="evenodd"
							d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
							clip-rule="evenodd"
						/>
					</svg>
					<div class="text-left">
						<H4 class="text-amber-900">Nuancering in plaats van simpel eens/oneens</H4>
						<p class="text-sm leading-relaxed text-amber-800">
							Deze partijwijzer richt zich op de <strong>daadwerkelijke stellingen</strong> van
							politieke partijen, niet op simpele eens/oneens antwoorden. Door gradaties te
							gebruiken (helemaal eens, een beetje eens, oneens, neutraal) krijg je een veel
							genuanceerder beeld van de politieke standpunten en kun je de
							<strong>fijnere verschillen</strong>
							tussen partijen beter begrijpen.
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Party Selection -->
		<div class="rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
			<Step1 bind:chosenParties {maxParties} />

			<!-- Navigation Button -->
			<div class="mt-8 border-t border-gray-200 pt-6 text-center">
				<button
					class="inline-flex items-center rounded-lg border border-transparent bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600"
					disabled={!isValid}
					onclick={startQuestionnaire}
				>
					Start de vergelijking
					<svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5l7 7-7 7"
						/>
					</svg>
				</button>
			</div>
		</div>

		<!-- Instructions -->
		<div class="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
			<H3 class="text-xl">Hoe werkt het?</H3>
			<div class="grid gap-6 md:grid-cols-2">
				<div>
					<div class="mb-4 flex items-start space-x-3">
						<div class="mt-1 rounded-full bg-blue-100 p-2 text-blue-600">
							<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
								<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<div>
							<H4 class="mb-1">1. Partijen selecteren</H4>
							<p class="text-sm text-gray-600">
								Kies 2-{maxParties} partijen die je wilt vergelijken
							</p>
						</div>
					</div>

					<div class="mb-4 flex items-start space-x-3">
						<div class="mt-1 rounded-full bg-blue-100 p-2 text-blue-600">
							<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
								<path
									d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
								/>
							</svg>
						</div>
						<div>
							<H4 class="mb-1">2. Stellingen beoordelen</H4>
							<p class="text-sm text-gray-600">Geef je mening over 30 politieke stellingen</p>
						</div>
					</div>
				</div>

				<div>
					<div class="mb-4 flex items-start space-x-3">
						<div class="mt-1 rounded-full bg-blue-100 p-2 text-blue-600">
							<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clip-rule="evenodd"
								/>
							</svg>
						</div>
						<div>
							<H4 class="mb-1">3. Resultaten bekijken</H4>
							<p class="text-sm text-gray-600">Zie welke partij het beste bij je past</p>
						</div>
					</div>

					<div class="mt-6 rounded-lg bg-gray-50 p-4">
						<H4>Beoordeling</H4>
						<div class="space-y-1 text-sm text-gray-600">
							<div>❤️ Helemaal eens (+2 punten)</div>
							<div>👍 Een beetje eens (+1 punt)</div>
							<div>👎 Oneens (-1 punt)</div>
							<div>😐 Neutraal (0 punten)</div>
						</div>
					</div>
				</div>
			</div>

			<div class="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
				<div class="flex items-start space-x-3">
					<svg class="mt-0.5 h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
							clip-rule="evenodd"
						/>
					</svg>
					<div>
						<H4 class="mb-1 text-blue-900">Privacy</H4>
						<p class="text-sm text-blue-800">
							Deze applicatie werkt volledig lokaal op jouw apparaat. Er worden geen gegevens naar
							servers gestuurd. Je antwoorden worden alleen in jouw browser opgeslagen.
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</main>
