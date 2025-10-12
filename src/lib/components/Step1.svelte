<script lang="ts">
	import { parties, Warning, H3, getLogoStyle } from '$lib';
	import type { party } from '$lib/data/parties';

	interface Props {
		chosenParties: party[];
		maxParties: number;
	}

	let { chosenParties = $bindable(), maxParties }: Props = $props();

	let selectedCount = $derived(chosenParties.length);
	let isValid = $derived(selectedCount >= 2 && selectedCount <= maxParties);

	function toggleParty(party: party): void {
		const index = chosenParties.findIndex((p) => p.id === party.id);
		if (index >= 0) {
			// Remove party
			chosenParties = chosenParties.filter((p) => p.id !== party.id);
		} else {
			// Add party
			chosenParties = [...chosenParties, party];
		}
	}

	function selectAll(): void {
		chosenParties = [...parties];
	}

	function deselectAll(): void {
		chosenParties = [];
	}
</script>

<div class="space-y-6">
	<!-- Header with status -->
	<div class="flex items-center justify-between">
		<div>
			<H3 class="text-lg text-gray-900">Selecteer partijen om te vergelijken</H3>
			<p class="text-sm text-gray-600">Kies tussen 2 en {maxParties} partijen</p>
		</div>

		<div class="text-right">
			<div class="text-2xl font-bold {isValid ? 'text-green-600' : 'text-red-500'}">
				{selectedCount}
			</div>
			<div class="text-sm text-gray-500">van max {maxParties}</div>
		</div>
	</div>

	<!-- Status indicator -->
	<div class="rounded-lg bg-gray-100 p-4">
		<div class="mb-2 flex items-center justify-between">
			<span class="text-sm font-medium text-gray-700">Aantal gekozen partijen</span>
			<span class="text-sm text-gray-500">{selectedCount}/{maxParties}</span>
		</div>
		<div class="h-2 rounded-full bg-gray-200">
			<div
				class="h-2 rounded-full transition-all duration-300 {selectedCount < 2
					? 'bg-red-500'
					: selectedCount <= maxParties
						? 'bg-green-500'
						: 'bg-red-500'}"
				style="width: {Math.min((selectedCount / maxParties) * 100, 100)}%"
			></div>
		</div>
		{#if selectedCount < 2}
			<p class="mt-2 text-sm text-red-600">Selecteer minstens 2 partijen om verder te gaan</p>
		{:else if selectedCount > maxParties}
			<p class="mt-2 text-sm text-red-600">
				Je hebt te veel partijen geselecteerd (max {maxParties})
			</p>
		{:else}
			<p class="mt-2 text-sm text-green-600">Perfect! Je kunt nu verder naar de stellingen</p>
		{/if}
	</div>

	<!-- Quick actions -->
	<div class="flex gap-3">
		<button class="secondary text-sm" onclick={selectAll}> ✓ Alles selecteren </button>
		<button class="secondary text-sm" onclick={deselectAll}> ✗ Alles deselecteren </button>
	</div>

	<!-- Party grid -->
	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
		{#each parties.sort((a, b) => a.name.localeCompare(b.name)) as party (party.id)}
			{@const isSelected = chosenParties.find((p) => p.id === party.id)}
			<label
				class="flex cursor-pointer items-center space-x-3 rounded-xl border-2 p-4 transition-all hover:shadow-md
               {isSelected
					? 'border-blue-500 bg-blue-50'
					: 'border-gray-200 bg-white hover:border-gray-300'}"
				for={`party-${party.id}`}
			>
				<input
					id={`party-${party.id}`}
					type="checkbox"
					checked={!!isSelected}
					onchange={() => toggleParty(party)}
					class="sr-only"
				/>

				<!-- Custom checkbox -->
				<div
					class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-all
                    {isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'}"
				>
					{#if isSelected}
						<svg class="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
								clip-rule="evenodd"
							/>
						</svg>
					{/if}
				</div>

				<!-- Party Logo -->
				<div
					class="h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm sm:h-10 sm:w-10"
					style={getLogoStyle(party.logoIndex)}
					aria-label="Logo van {party.name}"
					role="img"
				></div>

				<div class="min-w-0 flex-1">
					<span class="block truncate font-medium text-gray-900" title={party.name}>
						{party.name}
					</span>
					{#if party.fullName && party.fullName !== party.name}
						<span class="block truncate text-xs text-gray-500" title={party.fullName}>
							{party.fullName}
						</span>
					{/if}
				</div>
			</label>
		{/each}
	</div>

	{#if !isValid}
		<div class="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
			<div class="flex items-center space-x-2">
				<svg class="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
						clip-rule="evenodd"
					/>
				</svg>
				<span class="font-medium text-yellow-800">Let op:</span>
			</div>
			<p class="mt-1 text-yellow-700">
				{#if selectedCount < 2}
					Je moet minstens 2 partijen selecteren om een goede vergelijking te kunnen maken.
				{:else}
					Je hebt te veel partijen geselecteerd. Kies er maximaal {maxParties} om overzicht te houden.
				{/if}
			</p>
		</div>
	{/if}
</div>

{#if chosenParties.length > 1 && chosenParties.length <= maxParties}
	<div class="prose py-2">
		Gekozen: {chosenParties.map((p) => ' ' + p.name + ' ')}
	</div>
{/if}

<Warning visible={chosenParties.length < 2} text="Kies minimaal 2 partijen" />
<Warning visible={chosenParties.length > maxParties} text="Kies maximaal 8 partijen" />
