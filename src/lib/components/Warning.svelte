<script lang="ts">
	interface Props {
		visible: boolean;
		text: string;
	}

	let { visible, text }: Props = $props();
</script>

{#if visible}
	<div class="py-2 font-bold text-red-500">
		{text}
	</div>
{/if}
