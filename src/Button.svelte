<script>
	export let disabled = false;
	let extraclass=""
	export {extraclass as class } 
</script>

<button
	class:opacity-50={disabled}
	{disabled}
	on:click
	class="justify-self-end bg-green-200 h-10 lg:h-auto hover:bg-green-300 px-2 py-0 lg:py-2 border-2 rounded-md {extraclass}">
	<slot />
</button>
