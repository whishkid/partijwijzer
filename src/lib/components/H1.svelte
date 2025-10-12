<script>
  let { children, class: extraClass = "", ...props } = $props();
</script>

<h1 
  class="text-4xl font-semibold leading-tight text-slate-900 mb-4 {extraClass}"
  {...props}
>
  {@render children()}
</h1>