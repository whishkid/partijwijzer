<script>
  import Button from "./Button.svelte";
  import Step1 from "./Step1.svelte";
  import Step2 from "./Step2.svelte";
  let chosenParties = [];
  let step = 1;
  let maxParties = 8;
  $: partySelectionValid =
    chosenParties.length < 2 || chosenParties.length > maxParties;
</script>

<div class="p-4">
  <div class="flex justify-between w-full grow mb-2">
    <Button disabled={step == 1} on:click={() => step--}>vorige</Button>
	<div class="">
		stap {step} / 31
	</div>
    <Button disabled={partySelectionValid || step > 30} on:click={() => step++}
      >volgende</Button
    >
  </div>
  {#if step == 1}
    <Step1 bind:chosenParties {maxParties} />
  {/if}
  {#if step > 1}
    <Step2 {chosenParties} {step} />
  {/if}
</div>
