<script>
  import { writable } from "svelte/store";
  import { slide } from "svelte/transition";
  import Button from "./Button.svelte";
  import Step1 from "./Step1.svelte";
  import Step2 from "./Step2.svelte";
  import PartyDisplay from "./PartyDisplay.svelte";
  import { parties } from "./data";

  const storedPartyStatementRatings = localStorage.getItem(
    "partyStatementRatings"
  );
  const storedChosenParties =
    JSON.parse(localStorage.getItem("chosenParties")) || [];

  const storedStep = localStorage.getItem("step");

  let chosenParties = parties.filter((p) =>
    storedChosenParties.find((cp) => cp.id == p.id)
  );
  let step = JSON.parse(storedStep) || 1;
  let maxParties = 25;
  let partyOverlayVisible = false;
  $: partySelectionValid =
    chosenParties.length < 2 || chosenParties.length > maxParties;

  let partyStatementRatings = writable(
    JSON.parse(storedPartyStatementRatings) || {}
  );

  function getPartyScores(partyMatrix) {
    let partyScores = [];
    for (let partyId in partyMatrix) {
      let partyScore = 0;
      for (let statementId in partyMatrix[partyId]) {
        partyScore += partyMatrix[partyId][statementId];
      }
      const foundParty = chosenParties.find((p) => p.id == partyId);
      partyScores.push({
        id: partyId,
        score: partyScore,
        name: foundParty.name,
        logo: foundParty.logo,
      });
    }
    return partyScores.sort((a, b) => b.score - a.score);
  }

  $: localStorage.setItem(
    "partyStatementRatings",
    JSON.stringify($partyStatementRatings)
  );

  function reset(){
    step=1
    chosenParties = []
    partyStatementRatings.set({})
  }

  $: localStorage.setItem("chosenParties", JSON.stringify(chosenParties));
  $: localStorage.setItem("step", JSON.stringify(step));
</script>

<svelte:head>
  <title>Partij wijzer</title>
</svelte:head>
{#if partyOverlayVisible}
  <div
    class="absolute top-1 w-full h-full bg-white opacity-95"
    in:slide={{ y: 400, duration: 800 }}
    out:slide={{ y: 400, duration: 400 }}
  >
    <Step1 bind:chosenParties {maxParties} />
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
     
      stap  <select bind:value={step}>
        <option value={1}>1 (partijen)</option>

        {#each Array(30) as _, i}
          <option value={i + 2}>{i + 2}</option>
        {/each}
        <option value={32}>32 (Uitslag)</option>

        </select> / 32<br />
      {#if step > 1}
        <div
          class="cursor-pointer text-red-600"
          on:click={() => (partyOverlayVisible = !partyOverlayVisible)}
        >
          [partijen aanpassen]
        </div>
      {/if}
    </div>
    <Button disabled={partySelectionValid || step > 31} on:click={() => step++}
      >volgende</Button
    >
  </div>
  {#if step == 1}
    <Step1 bind:chosenParties {maxParties} />
    <div>
      Je krijgt straks van alle gekozen partijen hun uitleg bij de stellingen te zien.
      <br /><br />Ben je het een beetje eens met een partij geef het een
      duimpje...
      <br />vind je het helemaal geweldig, dan een hartje.
      <br />Totale onzin, duimpje omlaag. Neutraal, geen actie.
      <br /><br /> Aan het einde krijg je van de partijen te zien gesorteerd op
      je score
      <br /><br /> punten +2 voor hartje, +1 voor duimpje omhoog, -1 voor
      duimpje omlaag
      <br />
      <br />
      MBT Privacy, de applicatie werk volledig op je eigen device. Er worden geen keuzes naar de server gestuurd.
      <br />
      <br />
      Wil je even pauze je kan op dezelfde browser later terugkomen je gegevens worden
      op je eigen pc bewaard.
      <br/>
      <br/>
    </div>
  {/if}
  {#if step > 1 && step <= 31 && !partyOverlayVisible}
    <Step2 bind:partyStatementRatings {chosenParties} {step} />
  {/if}
  {#if step > 31}
    <div class="grid grid-cols-2 gap-2 text-2xl font-bold">
      <div>partij</div>
      <div class="text-end lg:text-start ">score</div>
      {#each getPartyScores($partyStatementRatings) as party}

        <div class=" border-t-2 border-dashed pt-2 mb-2"><PartyDisplay {party} /></div>
        <div class="text-end lg:text-start pr-6 py-2 pt-4 border-t-2 border-dashed pt-1 ">{party.score}</div>
      {/each}
    </div>
    <Button class="mt-2 w-full sm:w-auto" on:click={reset}>wissen en opnieuw beginnen</Button>
  {/if}
</div>
