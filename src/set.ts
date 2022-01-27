import Canvas, { CanvasRenderingContext2D } from "canvas";
import { Message, MessageAttachment, TextChannel } from "discord.js";
import { shuffleArray } from "./utils";


export class SetGame {

	private static readonly CARD_DIM: number[] = [96, 46];
	private static readonly COLORS = ["green", "blue", "red"];
	private static readonly OPACITY = [0, 0.5, 1];

	public channel: TextChannel;
	public finished: boolean;
	public last_action: number;

	private cards: number[];
	private curCards: number[];
	private curIndex: number;
	private players: Map<string, number>;
	private message: Message | undefined;

	constructor(channel: TextChannel, author: string) {
		this.cards = shuffleArray(Array.from(Array(81).keys()));
		this.channel = channel;
		this.curCards = this.cards.slice(0, 12);
		this.curIndex = 12;	
		this.finished = false;
		this.players = new Map();
		this.players.set(author, 0);
		this.last_action = Date.now();
		this.drawCards();
		console.log(this.getStringCards());
	}

	public async discordAddCards(message: Message): Promise<void> {
		await this.message?.delete();
		this.addCards();
		message.react("✔");
		this.drawCards();
		const tag: string = message.author.toString();
		const score = this.players.get(tag);
		if (score === undefined) {
			this.players.set(tag, 0);
		}
		if (this.curIndex > 80 && !this.findSet()) {
			this.endGame();
		}
		this.last_action = Date.now();
	}

	public async newDiscordGuess(message: Message): Promise<void> {
		const guess: string = message.content.substring(5);
		const positions: number[] = JSON.parse(`[${guess}]`);
		const tag: string = message.author.toString();
		let score = this.players.get(tag);
		if (score === undefined) {
			this.players.set(tag, 0);
			score = 0;
		} 
		if (this.newGuess(positions[0] - 1, positions[1] - 1, positions[2] - 1)) {
			message.react("✔");
			await this.message?.delete();
			this.drawCards();
			this.players.set(tag, score + 3);
		} else {
			message.react("❌");
			this.players.set(tag, score - 3);
		}
		this.findSet();
		this.last_action = Date.now();
	}

	public endGame() {
		let endString = "The game has ended. The results are:\n";
		for (const [tag, score] of this.players.entries()) {
			endString += `${tag} has scored: ${score}\n`;
		}
		this.finished = true;
		this.channel.send(endString);
		if (this.message?.deletable) this.message.delete();
	}

	public moreCards(): void {
		this.addCards();
		console.log(this.getStringCards());
	}

	private findSet(): boolean {
		for (let i = 0; i < this.curCards.length; i++) {
			for (let j = i + 1; j < this.curCards.length; j++) {
				for (let k = j + 1; k < this.curCards.length; k++) {
					if (this.isSet(this.curCards[i], this.curCards[j], this.curCards[k])) {
						console.log(i, j, k);
						return true;
					}
				}
			}
		}
		console.log("there are no sets currently");
		return false;
	}

	private drawCards(): void {
		const canvas = Canvas.createCanvas(300, 50 * this.curCards.length / 3);
		const context = canvas.getContext("2d");
		context.fillStyle = "white";
		for (let i = 0; i < this.curCards.length / 3; i++) {
			for (let j = 0; j < 3; j++) {
				context.fillRect(j * (SetGame.CARD_DIM[0] + 4),
					i * (SetGame.CARD_DIM[1] + 4),
					SetGame.CARD_DIM[0],
					SetGame.CARD_DIM[1]
				);
			}
		}
		for (let i = 0; i < this.curCards.length / 3; i++) {
			for (let j = 0; j < 3; j++) {
				const offset = [j * (SetGame.CARD_DIM[0] + 4), i * (SetGame.CARD_DIM[1] + 4)];
				this.drawCard(this.getVecCard(this.curCards[i * 3 + j]), offset, context);
			}
		}
		const att = new MessageAttachment(canvas.toBuffer(), "cards.png");
		this.channel.send({ files: [att] })
			.then(m => this.message = m)
			.catch(console.error);
	}

	private drawCard(card_vec: number[], offset: number[], context: CanvasRenderingContext2D): void {
		context.fillStyle = SetGame.COLORS[card_vec[0]];
		context.strokeStyle = SetGame.COLORS[card_vec[0]];
		for (let i = 0; i <= card_vec[1]; i++) {
			const cur_x = offset[0] + ((SetGame.CARD_DIM[0] * (i + 1)) / (card_vec[1] + 2));
			const cur_y = offset[1] + SetGame.CARD_DIM[1] / 2;
			switch (card_vec[2]) {
			case 0:
				context.globalAlpha = SetGame.OPACITY[card_vec[3]];
				context.fillRect(cur_x - 10, cur_y - 10, 20, 20);
				context.globalAlpha = 1;
				context.strokeRect(cur_x - 10, cur_y - 10, 20, 20);
				break;
			case 1:
				context.beginPath();
				context.arc(cur_x, cur_y, 10, 0, 2 * Math.PI);
				context.globalAlpha = SetGame.OPACITY[card_vec[3]];
				context.fill();
				context.globalAlpha = 1;
				context.stroke();
				context.closePath();
				break;
			case 2:
				context.beginPath();
				context.moveTo(cur_x, cur_y - 10);
				context.lineTo(cur_x + 10, cur_y + 10);
				context.lineTo(cur_x - 10, cur_y + 10);
				context.lineTo(cur_x, cur_y - 10);
				context.globalAlpha = SetGame.OPACITY[card_vec[3]];
				context.fill();
				context.globalAlpha = 1;
				context.stroke();
				context.closePath();
				break;
			default:
				break;
			}
		}
	}

	private newGuess(pos1: number, pos2: number, pos3: number): boolean {
		console.log(pos1, pos2, pos3);
		if (this.isSet(this.curCards[pos1], this.curCards[pos2], this.curCards[pos3])) {
			this.curCards.splice(pos1, 1);
			if (pos2 > pos1) pos2--;
			if (pos3 > pos1) pos3--;
			this.curCards.splice(pos2, 1);
			if (pos3 > pos2) pos3--;
			this.curCards.splice(pos3, 1);
			if (this.curCards.length < 12) {
				this.addCards();
			}
			if (this.curIndex > 80 && !this.findSet()) {
				this.endGame();
			}
			console.log(this.getStringCards());
			return true;
		} else {
			console.log("wrong ");
			return false;
		}
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
			if ((card_vec1[i] + card_vec2[i] + card_vec3[i]) % 3 != 0) {
				return false;
			}
		}
		return true;
	}
}