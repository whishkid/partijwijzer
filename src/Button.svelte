<script>
	export let disabled = false;
</script>

<button
	class:opacity-50={disabled}
	{disabled}
	on:click
	class="justify-self-end bg-green-200 hover:bg-green-300 p-2 border-3 rounded-md">
	<slot />
</button>
