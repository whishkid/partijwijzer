<script>
  let { children, class: extraClass = "", ...props } = $props();
</script>

<h3 
  class="text-2xl font-semibold leading-tight text-slate-900 mb-4 {extraClass}"
  {...props}
>
  {@render children()}
</h3>