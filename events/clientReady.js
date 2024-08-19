const log4js = require('log4js');
const logger = log4js.getLogger('ReadyEvent');
const { logLevel } = require('../config.json');
logger.level = logLevel;

const { Events } = require('discord.js');
const { DiscordLogger } = require('../util/DiscordLogger.js');
const { channels } = require('../config.json');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		const discordLogger = new DiscordLogger(client, channels['logChannelId']);
		try {
			await discordLogger.init();
		} catch (error) {
			logger.warn(`Failed to initialize DiscordLogger`);
		}

		discordLogger.logMessage('Bot is ready');
		logger.info(`Ready! Logged in as ${client.user.tag}`);
	}
};
