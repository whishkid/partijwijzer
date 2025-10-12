<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		class?: string;
		[key: string]: unknown;
	}

	let { children, class: extraClass = '', ...props }: Props = $props();
</script>

<h4 class="mb-2 text-xl leading-tight font-semibold text-slate-900 {extraClass}" {...props}>
	{@render children()}
</h4>
