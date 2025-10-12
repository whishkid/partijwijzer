<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Step2, statements, parties } from '$lib';
	import type { PartyStatementRatings } from '$lib';
	import type { party } from '$lib/data/parties';

	// Get themeId from URL params
	let themeId = $derived($page.params.themeId);

	// Find current statement by themeId
	let statement = $derived(statements.find((s) => s.themeId === themeId));
	let statementIndex = $derived(statements.findIndex((s) => s.themeId === themeId));
	let statementNumber = $derived(statementIndex + 1);

	// State using Svelte 5 runes
	let chosenParties: party[] = $state([]);
	let partyStatementRatings: PartyStatementRatings = $state({});
	let partyOverlayVisible: boolean = $state(false);

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
	});

	// Save current step when statement changes
	$effect(() => {
		if (statement && statementNumber) {
			localStorage.setItem('step', JSON.stringify(statementNumber + 1));
		}
	});

	// Effects for localStorage persistence
	$effect(() => {
		localStorage.setItem('partyStatementRatings', JSON.stringify(partyStatementRatings));
	});

	$effect(() => {
		localStorage.setItem('chosenParties', JSON.stringify(chosenParties));
	});

	// Navigation functions
	function goToPrevious(): void {
		if (statementIndex > 0) {
			const prevStatement = statements[statementIndex - 1];
			goto(`/stelling/${prevStatement.themeId}`);
		} else {
			goto('/intro');
		}
	}

	function goToNext(): void {
		if (statementIndex < statements.length - 1) {
			const nextStatement = statements[statementIndex + 1];
			goto(`/stelling/${nextStatement.themeId}`);
		} else {
			goto('/resultaat');
		}
	}

	function goToStatement(index: number): void {
		if (index === 0) {
			goto('/intro');
		} else if (index <= statements.length) {
			const targetStatement = statements[index - 1];
			goto(`/stelling/${targetStatement.themeId}`);
		} else {
			goto('/resultaat');
		}
	}

	// Scroll to top when statement changes
	$effect(() => {
		if (statement) {
			setTimeout(() => {
				window.scrollTo({ top: 0, behavior: 'smooth' });
			}, 100);
		}
	});

	// Derived state for validation
	let partySelectionInValid = $derived(chosenParties.length < 2 || chosenParties.length > 25);
</script>

<svelte:head>
	<title
		>{statement ? `Stelling ${statementNumber}: ${statement.theme}` : 'Stelling'} - Partijwijzer</title
	>
	<meta
		name="description"
		content={statement
			? `Stelling over ${statement.theme}: ${statement.title}`
			: 'Politieke stelling in de Partijwijzer'}
	/>
</svelte:head>

{#if statement}
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
								style="width: {Math.min(((statementNumber + 1) / 32) * 100, 100)}%"
							></div>
						</div>
						<div class="mt-1 text-center text-xs text-gray-600 sm:mt-2 sm:text-sm">
							Stelling {statementNumber} van 30
						</div>
					</div>

					<!-- Step Navigation -->
					<div class="flex items-center justify-center gap-2 sm:justify-end sm:gap-3">
						<button
							class="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-300 disabled:hover:bg-white sm:px-4 sm:text-sm"
							disabled={statementIndex === 0}
							onclick={goToPrevious}
						>
							<svg
								class="mr-1 h-4 w-4 sm:mr-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
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
							value={statementNumber}
							onchange={(e: Event) => {
								const target = e.target as HTMLSelectElement;
								goToStatement(parseInt(target.value));
							}}
						>
							<option value={0}>Partijen kiezen</option>
							{#each statements as stmt, i (stmt.id)}
								<option value={i + 1}>
									{i + 1}. {stmt.theme}
								</option>
							{/each}
							<option value={32}>Resultaten</option>
						</select>

						<button
							class="inline-flex items-center rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-xs font-medium text-white transition-all duration-200 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600 sm:px-4 sm:text-sm"
							disabled={partySelectionInValid}
							onclick={goToNext}
						>
							<span class="hidden sm:inline">Volgende</span>
							<span class="sm:hidden">→</span>
							<svg
								class="ml-1 h-4 w-4 sm:ml-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
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

		<!-- Main Content -->
		<div class="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-8">
			<div class="animate-fade-in">
				<Step2
					bind:partyStatementRatings
					{chosenParties}
					step={statementNumber + 1}
					bind:partyOverlayVisible
				/>
			</div>
		</div>

		<!-- Party Overlay -->
		{#if partyOverlayVisible}
			<div
				class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-4"
			>
				<div class="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl bg-white">
					<div class="p-4 sm:p-6">
						<div class="mb-6 flex items-center justify-between">
							<h2 class="mb-0 text-xl font-semibold">Partijen selecteren</h2>
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
						<!-- TODO: Include Step1 component here or create a simplified party selector -->
						<p class="text-gray-600">Partij selectie functionaliteit komt hier...</p>
					</div>
				</div>
			</div>
		{/if}
	</main>
{:else}
	<!-- 404 for invalid themeId -->
	<main class="flex min-h-screen items-center justify-center">
		<div class="text-center">
			<h1 class="mb-4 text-4xl font-bold text-gray-900">Stelling niet gevonden</h1>
			<p class="mb-8 text-gray-600">De stelling die je zoekt bestaat niet.</p>
			<button
				class="inline-flex items-center rounded-lg border border-transparent bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
				onclick={() => goto('/intro')}
			>
				Terug naar start
			</button>
		</div>
	</main>
{/if}
