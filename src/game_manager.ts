import { TextChannel } from "discord.js";
import { SetGame } from "./set";


export class GameManager {
	
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

	public removeGames() {
		const indices: number[] = [];
		for (let i = 0; i < this.games.length; i++) {
			if (this.games[i].finished) indices.push(i);
		}
		indices.reverse();
		for (const index of indices) {
			this.games.splice(index, 1);
		}
	}

	public addGame(channel: TextChannel): void {
		this.games.push(new SetGame(channel));
	}
}