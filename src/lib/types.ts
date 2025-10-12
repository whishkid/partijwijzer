// Type definitions for the Partijwijzer application

export interface Statement {
	id: number;
	position: 'agree' | 'disagree' | 'neutral' | 'neither';
	explanation: string;
	accessibility: {
		explanation: string;
	};
}

export interface Party {
	id: number;
	name: string;
	fullName: string;
	logo: string;
	logoIndex: number | null;
	participates: boolean;
	website: string | null;
	hasSeats: boolean | null;
	statements: Statement[];
	shootoutStatements?: unknown[]; // Optional field for shootout statements
}

export interface QuestionStatement {
	id: number;
	theme: string;
	themeId: string;
	title: string | Array<{ text?: string } | string>;
	accessibility: {
		moreInfo: {
			text: string | null;
		};
	};
	moreInfo: {
		title: string;
		text: string | null;
		imageAlt: string;
	};
	isShootout: boolean;
	index: number;
	parties: {
		agree: Party[];
		disagree: Party[];
		neutral: Party[];
	};
}

export interface PartyStatementRatings {
	[partyId: number]: {
		[statementId: number]: number;
	};
}

export interface PartyScore {
	id: string;
	score: number;
	name: string;
	logo: string;
	logoIndex: number | null;
	fullName: string;
}
