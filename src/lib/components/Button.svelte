<script>
	let { disabled = false, class: extraclass = "", onclick, children } = $props();
</script>

<button
	class:opacity-50={disabled}
	{disabled}
	{onclick}
	class="justify-self-end bg-green-200 h-10 lg:h-auto hover:bg-green-300 px-2 py-0 lg:py-2 border-2 rounded-md {extraclass}">
	{@render children()}
</button>
