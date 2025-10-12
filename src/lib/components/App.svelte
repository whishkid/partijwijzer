<script lang="ts">
	import { slide } from 'svelte/transition';
	import { onMount } from 'svelte';
	import {
		H1,
		H2,
		H3,
		H4,
		Step1,
		Step2,
		PartyDisplay,
		parties,
		statements,
		getPartyScores,
		type PartyStatementRatings
	} from '$lib';
	import type { party } from '$lib/data/parties';

	// State using Svelte 5 runes
	let chosenParties: party[] = $state([]);
	let step = $state(1);
	let maxParties = 25;
	let partyOverlayVisible = $state(false);
	let partyStatementRatings: PartyStatementRatings = $state({});

	// Derived state
	let partySelectionInValid = $derived(
		chosenParties.length < 2 || chosenParties.length > maxParties
	);

	function reset() {
		step = 1;
		chosenParties = [];
		partyStatementRatings = {};
	}

	// Scroll to top when step changes
	$effect(() => {
		if (step) {
			localStorage.setItem('step', JSON.stringify(step));
			setTimeout(() => {
				window.scrollTo({ top: 0, behavior: 'smooth' });
			}, 100);
		}
	});

	// Effects for localStorage persistence (SSR disabled, so safe to use)
	$effect(() => {
		localStorage.setItem('partyStatementRatings', JSON.stringify(partyStatementRatings));
	});

	$effect(() => {
		localStorage.setItem('chosenParties', JSON.stringify(chosenParties));
	});

	// Initialize from localStorage on mount
	onMount(() => {
		const storedPartyStatementRatings = localStorage.getItem('partyStatementRatings');
		const storedChosenParties = JSON.parse(localStorage.getItem('chosenParties') || '[]');
		const storedStep = localStorage.getItem('step');

		chosenParties = parties.filter((p) => storedChosenParties.find((cp) => cp.id == p.id));
		step = JSON.parse(storedStep || '1');
		partyStatementRatings = JSON.parse(storedPartyStatementRatings || '{}');
	});
</script>

<svelte:head>
	<title>Partijwijzer - Vind jouw politieke match</title>
	<meta
		name="description"
		content="Ontdek welke politieke partij het beste bij jouw standpunten past"
	/>
</svelte:head>

<main class="min-h-screen">
	<!-- Header -->
	<header class="sticky top-0 z-50 border-b border-gray-200/50 bg-white/90 backdrop-blur-lg">
		<div class="mx-auto max-w-6xl px-3 py-3 sm:px-4 sm:py-4">
			<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
				<button
					onclick={() => (step = 1)}
					class="cursor-pointer rounded border-0 bg-transparent bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text p-0 text-center text-xl font-bold text-transparent focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none sm:text-left sm:text-2xl"
				>
					<H1 class="m-0 text-xl sm:text-2xl">Partijwijzer</H1>
				</button>

				<!-- Progress Indicator -->
				<div class="mx-0 max-w-md flex-1 sm:mx-8">
					<div class="h-2 overflow-hidden rounded-full bg-gray-200 sm:h-3">
						<div
							class="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
							style="width: {Math.min((step / 32) * 100, 100)}%"
						></div>
					</div>
					<div class="mt-1 text-center text-xs text-gray-600 sm:mt-2 sm:text-sm">
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
				<div class="flex items-center justify-center gap-2 sm:justify-end sm:gap-3">
					<button
						class="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-300 disabled:hover:bg-white sm:px-4 sm:text-sm"
						disabled={step === 1}
						onclick={() => step--}
					>
						<svg class="mr-1 h-4 w-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 19l-7-7 7-7"
							/>
						</svg>
						<span class="hidden sm:inline">Vorige</span>
						<span class="sm:hidden">←</span>
					</button>

					<select
						class="min-w-[120px] rounded-lg border border-gray-300 bg-white px-2 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[200px] sm:px-3 sm:text-sm"
						disabled={partySelectionInValid}
						bind:value={step}
					>
						<option value={1}>Partijen kiezen</option>
						{#each { length: 30 } as _, i (i)}
							<option value={i + 2}>
								{i + 1}. {statements[i].theme}
							</option>
						{/each}
						<option value={32}>Resultaten</option>
					</select>

					<button
						class="inline-flex items-center rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-xs font-medium text-white transition-all duration-200 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600 sm:px-4 sm:text-sm"
						disabled={partySelectionInValid || step > 31}
						onclick={() => step++}
					>
						<span class="hidden sm:inline">Volgende</span>
						<span class="sm:hidden">→</span>
						<svg class="ml-1 h-4 w-4 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
		</div>
	</header>
	<!-- Party Overlay -->
	{#if partyOverlayVisible}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-4"
			in:slide={{ duration: 800 }}
			out:slide={{ duration: 400 }}
		>
			<div class="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl bg-white">
				<div class="p-4 sm:p-6">
					<div class="mb-6 flex items-center justify-between">
						<H2 class="mb-0 text-xl">Partijen selecteren</H2>
						<button
							class="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
							onclick={() => (partyOverlayVisible = false)}
						>
							<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
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
	<div class="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-8">
		{#if step === 1}
			<div class="animate-fade-in">
				<!-- Welcome Section -->
				<div class="mb-8 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-lg">
					<div class="mb-6">
						<H2 class="font-bold">Welkom bij de Partijwijzer</H2>
						<p class="mx-auto max-w-2xl text-lg text-gray-600">
							Ontdek welke politieke partij het beste aansluit bij jouw standpunten. Selecteer eerst
							de partijen die je wilt vergelijken.
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
									Deze applicatie werkt volledig lokaal op jouw apparaat. Er worden geen gegevens
									naar servers gestuurd. Je antwoorden worden alleen in jouw browser opgeslagen.
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
				<div class="mb-8 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-lg">
					<H2 class="font-bold">Jouw resultaten</H2>
					<p class="text-lg text-gray-600">
						Op basis van jouw antwoorden zijn dit de partijen die het beste bij je passen:
					</p>
				</div>

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
							onclick={() => (partyOverlayVisible = true)}
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
			</div>
		{/if}
	</div>
</main>
