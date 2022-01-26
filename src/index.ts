import { Message, Client, Intents } from "discord.js";
import * as dotenv from "dotenv";
import { GameManager } from "./game_manager";

dotenv.config();

// Create a new client instance
const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
});

client.once("ready", () => {
	console.log("Ready!");
});

const gameManager = new GameManager();

client.on("messageCreate", (message: Message) => {
	gameManager.removeGames();
	const mess: string = message.content.toLowerCase();
	if (message.channel.type != "GUILD_TEXT") {
		message.reply("please start games in a guild text channel");
		return;
	}
	const gameOnChannel = gameManager.gameOnChannel(message.channel);

	if (mess.startsWith("::new")) {
		if (gameOnChannel === undefined) gameManager.addGame(message.channel);
		else message.reply("there is already a game running on this channel.\n Continue to play it or end it with ::end game");
	}
	if (mess.startsWith("::add cards")) {
		if (gameOnChannel === undefined) message.reply("There is no game on the current channel.\n Please start one or send this message in a channel with a game");
		else gameOnChannel.discordAddCards(message);
	}
	if (mess.startsWith("::end game")) {
		if (gameOnChannel === undefined) message.reply("There is no game on the current channel.");
		else gameOnChannel.endGame();
	}
	if (mess.startsWith("::set")) {
		if (gameOnChannel === undefined) message.reply("There is no game on the current channel.\n Please start one or send this message in a channel with a game");
		else gameOnChannel.newDiscordGuess(message);
	}
	gameManager.removeGames();
});

client.login(process.env.TOKEN);