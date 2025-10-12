<script>
  let { children, class: extraClass = "", ...props } = $props();
</script>

<h4 
  class="text-xl font-semibold leading-tight text-slate-900 mb-2 {extraClass}"
  {...props}
>
  {@render children()}
</h4>