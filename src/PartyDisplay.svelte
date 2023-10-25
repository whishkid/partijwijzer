<script>
  export let party;
</script>

<div>
  <img
    alt={party.name}
    src="https://tweedekamer2023.stemwijzer.nl/gfx/img/{party.logo}"
    width="32"
  />
  <div class="flex flex-col justify-center font-bold">
    {party.name}
  </div>
</div>
