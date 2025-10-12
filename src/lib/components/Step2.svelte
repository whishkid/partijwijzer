<script lang="ts">
	import {
		PartyDisplay,
		H2,
		H4,
		RateMinusOne,
		RatePlusOne,
		RatePlusTwo,
		RatingIcon,
		statements,
		type PartyStatementRatings
	} from '$lib';
	import type { party } from '$lib/data/parties';

	interface Props {
		chosenParties: party[];
		step: number;
		partyStatementRatings: PartyStatementRatings;
		partyOverlayVisible: boolean;
	}

	let {
		chosenParties,
		step,
		partyStatementRatings = $bindable(),
		partyOverlayVisible = $bindable()
	}: Props = $props();

	let statement = $derived(statements[step - 2]);
	let statementNumber = $derived(step - 1);
</script>

<div class="space-y-8">
	<!-- Statement Header -->
	<div class="rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
		<div class="mb-6">
			<div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div
					class="mx-auto inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 sm:mx-0"
				>
					Stelling {statementNumber} van 30
				</div>
				<button
					class="mx-auto inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none sm:mx-0"
					onclick={() => (partyOverlayVisible = true)}
					title="Partijen wijzigen"
				>
					<svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
					Partijen
				</button>
			</div>
			<div class="mb-4 text-center text-xs font-medium tracking-wide text-gray-500 uppercase">
				{statement.theme}
			</div>
		</div>

		<!-- Enhanced statement display for better mobile visibility -->
		<div
			class="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6"
		>
			<H2
				class="text-center text-lg leading-relaxed font-bold break-words text-gray-900 sm:text-xl lg:text-2xl"
			>
				{#each statement.title as titleElement, index (index)}
					{titleElement}
				{/each}
			</H2>
		</div>
	</div>

	<!-- Party Opinions -->
	<div class="space-y-6">
		{#each chosenParties as party (party.id)}
			{@const opinion = party.statements.find((s) => s.id == statement.id)}

			<div
				class="rounded-xl border border-slate-200 bg-white p-6 shadow-lg transition-shadow duration-300 hover:shadow-xl"
			>
				{#if opinion}
					<!-- Party with opinion -->
					<div class="space-y-4">
						<!-- Header with party and rating controls -->
						<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
							<div class="flex min-w-0 items-center space-x-3">
								<PartyDisplay {party} />
								<!-- Party position indicator (moved next to party) -->
								<div class="flex-shrink-0">
									<div
										class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium {opinion.position ===
										'agree'
											? 'border border-green-200 bg-green-100 text-green-800'
											: opinion.position === 'disagree'
												? 'border border-red-200 bg-red-100 text-red-800'
												: 'border border-gray-200 bg-gray-100 text-gray-800'}"
									>
										<span class="mr-1 text-gray-500">Partij standpunt:</span>
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
							<div class="flex flex-shrink-0 items-center justify-center space-x-3 sm:justify-end">
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
						<div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
							<div class="leading-relaxed text-gray-800">
								{opinion.explanation}
							</div>
						</div>
					</div>
				{:else}
					<!-- Party without opinion -->
					<div class="space-y-4">
						<!-- Header with party and rating controls -->
						<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
							<div class="flex min-w-0 items-center space-x-3">
								<PartyDisplay {party} />
								<!-- No position indicator (moved next to party) -->
								<div class="flex-shrink-0">
									<div
										class="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
									>
										<span class="mr-1 text-gray-500">Standpunt:</span>
										⚪ Geen standpunt
									</div>
								</div>
							</div>

							<!-- Rating buttons (disabled state) -->
							<div
								class="flex flex-shrink-0 items-center justify-center space-x-3 opacity-50 sm:justify-end"
							>
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
						<div class="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
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
	<div class="rounded-xl border border-blue-200 bg-blue-50 p-6 shadow-lg">
		<div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
			<div class="flex flex-1 items-start space-x-3">
				<svg
					class="mt-0.5 h-6 w-6 flex-shrink-0 text-blue-600"
					fill="currentColor"
					viewBox="0 0 20 20"
				>
					<path
						fill-rule="evenodd"
						d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
						clip-rule="evenodd"
					/>
				</svg>
				<div>
					<H4 class="mb-1 text-blue-900">Hoe te beoordelen?</H4>
					<div class="space-y-1 text-sm text-blue-800">
						<div>
							<span class="font-medium">❤️ Helemaal eens</span> - Je bent het volledig eens met deze
							partij (+2 punten)
						</div>
						<div>
							<span class="font-medium">👍 Een beetje eens</span> - Je bent het grotendeels eens (+1
							punt)
						</div>
						<div>
							<span class="font-medium">👎 Oneens</span> - Je bent het niet eens met deze partij (-1
							punt)
						</div>
						<div>
							<span class="font-medium"
								>😐 Geen reactie (je klikt dus geen van de drie like buttons)</span
							> - Neutraal of geen mening (0 punten)
						</div>
					</div>
				</div>
			</div>

			<!-- Party selection button -->
			<div class="flex flex-shrink-0 justify-center lg:justify-end">
				<button
					class="inline-flex w-full items-center rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none sm:w-auto"
					onclick={() => (partyOverlayVisible = true)}
					title="Wijzig je partijselectie"
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
</div>
