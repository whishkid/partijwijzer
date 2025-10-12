<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { statements } from '$lib';

	onMount(() => {
		// Check localStorage for saved state
		const storedStep = localStorage.getItem('step');

		const step = JSON.parse(storedStep || '1');

		// Go to the exact last page the user was viewing
		if (step === 1) {
			// User was on party selection
			goto('/intro');
		} else if (step >= 2 && step <= 31) {
			// User was on a specific statement
			const statementIndex = step - 2;
			if (statementIndex >= 0 && statementIndex < statements.length) {
				const statement = statements[statementIndex];
				goto(`/stelling/${statement.themeId}`);
			} else {
				goto('/intro');
			}
		} else if (step > 31) {
			// User was viewing results
			goto('/resultaat');
		} else {
			// Default fallback
			goto('/intro');
		}
	});
</script>

<svelte:head>
	<title>Partijwijzer - Vind jouw politieke match</title>
	<meta
		name="description"
		content="Ontdek welke politieke partij het beste bij jouw standpunten past"
	/>
</svelte:head>

<!-- Loading state while redirecting -->
<main class="flex min-h-screen items-center justify-center">
	<div class="text-center">
		<div class="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
		<p class="text-gray-600">Laden...</p>
	</div>
</main>
