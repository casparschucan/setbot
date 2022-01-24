import { Client, Message, TextChannel } from "discord.js";
import { shuffleArray } from "./utils";


export class SetGame {


	private client: Client;
	private cards: number[];
	private curCards: number[];
	private curIndex: number;
	private channel: TextChannel | undefined;
	private message: Message | undefined;

	constructor(client: Client, channel: TextChannel | undefined) {
		this.cards = shuffleArray(Array.from(Array(81).keys()));
		this.client = client;
		this.channel = channel;
		this.curCards = this.cards.slice(0, 9);
		this.curIndex = 9;
		channel?.send(this.getStringCards())
			.then(m => this.message = m)
			.catch(console.error);
		console.log(this.getStringCards());
	}

	private getStringCards(): string {
		let cardsString = "";
		for (let i = 0; i < this.curCards.length; i++) {
			cardsString += this.getStringCard(this.curCards[i]);
			if (i % 3 == 2) cardsString += "\n";
			else cardsString += ", ";
		}
		return cardsString;
	}

	private getStringCard(card: number): string {
		const card_vec: number[] = this.getVecCard(card);
		return `[${card_vec.toString()}]`;
	}

	private getVecCard(card: number): number[] {
		const card_vec: number[] = [0, 0, 0, 0];
		card_vec[0] = card % 3;
		card = Math.floor(card / 3);
		card_vec[1] = card % 3;
		card = Math.floor(card / 3);
		card_vec[2] = card % 3;
		card = Math.floor(card / 3);
		card_vec[3] = card % 3;
		return card_vec;
	}

	private addCards(): void {
		if (this.curIndex > 80) return;
		this.curCards.push(this.cards[this.curIndex]);
		this.curIndex++;
		this.curCards.push(this.cards[this.curIndex]);
		this.curIndex++;
		this.curCards.push(this.cards[this.curIndex]);
		this.curIndex++;
		return;
	}

	private isSet(card1: number, card2: number, card3: number): boolean {
		const card_vec1: number[] = this.getVecCard(card1);
		const card_vec2: number[] = this.getVecCard(card2);
		const card_vec3: number[] = this.getVecCard(card3);
		for (let i = 0; i < 4; i++) {
			if ((card_vec1[i] + card_vec2[i] + card_vec3[i]) % 3 != 0) return false;
		}
		return true;
	}
}