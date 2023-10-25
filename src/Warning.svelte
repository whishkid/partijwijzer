<script>
	export let visible;
	export let text;
</script>

{#if visible}
	<div class="py-2 font-bold text-red-500">
		{text}
	</div>
{/if}
