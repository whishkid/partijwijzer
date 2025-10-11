<script>
  export let party;
  import { getLogoStyle } from './logoHelper.js';
</script>

<div class="flex items-center space-x-3 min-w-0">
  <!-- Party Logo -->
  <div 
    class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden border border-gray-200 bg-white flex-shrink-0 shadow-sm"
    style="{getLogoStyle(party.logoIndex)}"
    aria-label="Logo van {party.name}"
    role="img"
  ></div>

  <!-- Party Info -->
  <div class="min-w-0 flex-1">
    <h3 class="font-semibold text-gray-900 truncate text-base sm:text-lg">
      {party.name}
    </h3>
    {#if party.fullName && party.fullName !== party.name}
      <p class="text-xs sm:text-sm text-gray-500 truncate">
        {party.fullName}
      </p>
    {/if}
  </div>
</div>
