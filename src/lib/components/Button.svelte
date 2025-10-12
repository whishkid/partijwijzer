<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		disabled?: boolean;
		class?: string;
		onclick?: () => void;
		children: Snippet;
	}

	let { disabled = false, class: extraclass = '', onclick, children }: Props = $props();
</script>

<button
	class:opacity-50={disabled}
	{disabled}
	{onclick}
	class="h-10 justify-self-end rounded-md border-2 bg-green-200 px-2 py-0 hover:bg-green-300 lg:h-auto lg:py-2 {extraclass}"
>
	{@render children()}
</button>
