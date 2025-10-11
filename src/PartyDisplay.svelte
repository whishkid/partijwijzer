<script>
  export let party;
  import { getLogoStyle } from './logoHelper.js';
</script>

<div class="flex flex-col justify-content-center font-bold">
  <div 
    class="party-logo"
    style="{getLogoStyle(party.logoIndex)}"
    aria-label="Logo van {party.name}"
    role="img"
  ></div>
  <div class="text-center">
    {party.name}
  </div>
</div>

<style>
  .party-logo {
    width: 36px;
    height: 36px;
    background-size: 100% 2400% !important;
  }
</style>
