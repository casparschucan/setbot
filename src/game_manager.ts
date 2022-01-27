import { TextChannel, User } from "discord.js";
import { SetGame } from "./set";


export class GameManager {

	public static readonly MAX_GAME_DURATION_MS = 3.6e6;
	
	private games: SetGame[];

	constructor(){
		this.games = [];
	}

	public gameOnChannel(channel: TextChannel): SetGame | undefined {
		for (const game of this.games) {
			if (game.channel === channel) return game;
		}
		return undefined;
	}

	public removeGames(): void {
		const indices: number[] = [];
		const now: number = Date.now();
		for (let i = 0; i < this.games.length; i++) {
			if (now - this.games[i].last_action > GameManager.MAX_GAME_DURATION_MS) {
				this.games[i].endGame();
			}
			if (this.games[i].finished) {
				indices.push(i);
			}
		}

		indices.reverse();

		for (const index of indices) {
			this.games.splice(index, 1);
		}
	}

	public addGame(channel: TextChannel, author: User, players: Map<string, User>): void {
		const plainAuthor: string = author.toString().substring(2, author.toString().length - 1);
		if (!players.has(plainAuthor)) {
			players.set(plainAuthor, author);
		}
		this.games.push(new SetGame(channel, Array.from(players.keys())));
	}
}