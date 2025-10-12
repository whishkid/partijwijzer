<script>
  let { children, class: extraClass = "", ...props } = $props();
</script>

<h2 
  class="text-3xl font-semibold leading-tight text-slate-900 mb-4 {extraClass}"
  {...props}
>
  {@render children()}
</h2>