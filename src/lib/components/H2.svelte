<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		class?: string;
		[key: string]: unknown;
	}

	let { children, class: extraClass = '', ...props }: Props = $props();
</script>

<h2 class="mb-4 text-3xl leading-tight font-semibold text-slate-900 {extraClass}" {...props}>
	{@render children()}
</h2>
