<script>
	export let disabled = false;
	let extraclass=""
	export {extraclass as class } 
</script>

<button
	class:opacity-50={disabled}
	{disabled}
	on:click
	class="justify-self-end bg-green-200 hover:bg-green-300 px-2 py-1 sm:py-2 border-3 rounded-md {extraclass}">
	<slot />
</button>
