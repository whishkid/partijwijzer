<script>
  export let party;
</script>

<div class="flex flex-col  justify-content-center font-bold">
  <img
  class="text-center"
    alt={party.name}
    src="https://tweedekamer2023.stemwijzer.nl/gfx/img/{party.logo}"
    width="36"
  />
  <div >
    {party.name}
  </div>
</div>
