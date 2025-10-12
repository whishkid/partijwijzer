<script lang="ts">
	import { getLogoStyle, H3 } from '$lib';

	interface Props {
		party: {
			name: string;
			fullName?: string;
			logoIndex: number | null;
		};
	}

	let { party }: Props = $props();
</script>

<div class="flex min-w-0 items-center space-x-3">
	<!-- Party Logo -->
	<div
		class="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm sm:h-12 sm:w-12"
		style={getLogoStyle(party.logoIndex)}
		aria-label="Logo van {party.name}"
		role="img"
	></div>

	<!-- Party Info -->
	<div class="min-w-0 flex-1">
		<H3 class="truncate text-base sm:text-lg">
			{party.name}
		</H3>
		{#if party.fullName && party.fullName !== party.name}
			<p class="truncate text-xs text-gray-500 sm:text-sm">
				{party.fullName}
			</p>
		{/if}
	</div>
</div>
