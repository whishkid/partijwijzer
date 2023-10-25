<script>
  import { slide } from "svelte/transition";
  import Button from "./Button.svelte";
  import Step1 from "./Step1.svelte";
  import Step2 from "./Step2.svelte";
  let chosenParties = [];
  let step = 1;
  let maxParties = 25;
  let partyOverlayVisible = false;
  $: partySelectionValid =
    chosenParties.length < 2 || chosenParties.length > maxParties;
</script>

<svelte:head>
  <title>Partij wijzer</title>
</svelte:head>
{#if partyOverlayVisible}
  <div
    class="absolute top-1 w-full h-full  bg-white opacity-95"
    in:slide={{ y: 400, duration: 800 }}
    out:slide={{ y: 400, duration: 400 }}
  >
    <Step1 bind:chosenParties />
    <div class="w-full text-center">
      <Button on:click={() => (partyOverlayVisible = false)}>sluiten</Button>
    </div>
  </div>
{/if}
<div class="p-4">
  <div class="flex justify-between w-full grow mb-2">
    <Button
      disabled={step == 1}
      on:click={() => {
        step--;
      }}>vorige</Button
    >
    <div class=" text-center">
      stap {step} / 31<br />
      {#if step > 1}
        <div
          class="cursor-pointer text-red-600"
          on:click={() => (partyOverlayVisible = !partyOverlayVisible)}
        >
          [partijen aanpassen]
        </div>
      {/if}
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
