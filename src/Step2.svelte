<script>
  import { statements, parties } from "./data.js";
  export let chosenParties;
  export let step;
  $: statement = statements[step - 2];
  let cols = chosenParties.length % 3 == 0 ? 3 : 2;
</script>

<div class="border-b-2 border-green-500 py-2 mb-2">
  <div class="font-bold text-prose">
    {#each statement.title as titleElement}
      {titleElement.text ?? titleElement}
    {/each}
  </div>
  <div class="grid grid-cols-1 lg:grid-cols-{cols} gap-2">
    {#each chosenParties as party}
      {@const opinion = party.statements.find((s) => s.id == statement.id)}

      <div class="mt-2 border-0 border-t-2 border-dashed py-2 mb-2">
        <div class="flex flex-row gap-2 justify-center">
          <img
            src="https://tweedekamer2023.stemwijzer.nl/gfx/img/{party.logo}"
            width="32"
          />
          <div class="flex flex-col justify-center font-bold">{party.name}</div>
        </div>
        <div
         
          class="flex flex-row my-2  justify-center text"
        >
          <div 
		  class:bg-gray-600={opinion.position == "neither"}
		  class:bg-red-600={opinion.position == "disagree"}
		  class:bg-green-600={opinion.position == "agree"}
		   class="w-32 text-white flex flex-row justify-center">{opinion.position == 'agree' ? 'eens' : (opinion.position=='disagree' ? 'oneens' : 'geen van beide')}</div>
        </div>

        <div>
          {(opinion.explanation)}
        </div>
      </div>
    {/each}
  </div>
</div>
