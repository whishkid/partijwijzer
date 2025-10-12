import type { party } from './data/parties';
import type { PartyStatementRatings } from './types';

export function getPartyScores(partyMatrix: PartyStatementRatings, chosenParties: party[]) {
	const partyScores = [];
	for (const partyId in partyMatrix) {
		let partyScore = 0;
		for (const statementId in partyMatrix[partyId]) {
			partyScore += partyMatrix[partyId][statementId];
		}
		const foundParty = chosenParties.find((p) => p.id == parseInt(partyId));
		if (!foundParty) continue;
		partyScores.push({
			id: parseInt(partyId),
			score: partyScore,
			name: foundParty.name,
			logo: foundParty.logo,
			logoIndex: foundParty.logoIndex,
			fullName: foundParty.fullName
		});
	}
	return partyScores.sort((a, b) => b.score - a.score);
}
