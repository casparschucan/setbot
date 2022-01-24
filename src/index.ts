import { Message, Client, Intents } from "discord.js";
import * as dotenv from "dotenv";
import { SetGame } from "./set";


dotenv.config();


// Create a new client instance
const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.GUILD_VOICE_STATES],
});

client.once("ready", () => {
	console.log("Ready!");
});

client.on("messageCreate", (message: Message) => {
	const mess: string = message.content.toUpperCase();

	if (mess.startsWith("::")) {
		message.reply("nice");
	}


});

new SetGame(client, undefined);