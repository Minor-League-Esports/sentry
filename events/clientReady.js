const log4js = require('log4js');
const logger = log4js.getLogger('ReadyEvent');
const { logLevel, channels } = require('../config.json');
logger.level = logLevel;

const { DiscordLogger } = require('../util/DiscordLogger.js');
const logChannel = channels['logChannelId'];

const { Events } = require('discord.js');
const { ApplicationManager } = require('../util/ApplicationManager');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		// Helper to ensure we log to Discord (if possible) and then exit
		const gracefulExit = async (discordLoggerInstance, message, code = 1) => {
			try {
				if (discordLoggerInstance) {
					await discordLoggerInstance.logMessage(message);
				}
			} catch (logErr) {
				logger.error('Failed to send failure message to Discord', logErr);
			} finally {
				// Give the Discord client a brief moment to flush, then exit
				setTimeout(() => {
					process.exit(code);
				}, 250);
			}
		};

		const discordLogger = new DiscordLogger(client, logChannel);
		try {
			await discordLogger.init();
		} catch (error) {
			logger.error('Failed to initialize DiscordLogger', error);
			// Cannot log to Discord without logger; exit immediately
			setTimeout(() => process.exit(1), 100);
			return;
		}

		globalThis.discordLogger = discordLogger;

		discordLogger.logMessage('Bot is ready');
		logger.info(`Ready! Logged in as ${client.user.tag}`);

		globalThis.applicationManager
			.init()
			.then(() => {
				discordLogger.logMessage('Application Manager initialized');
			})
			.catch((error) => {
				logger.error(error);
				discordLogger.logMessage('Application Manager failed to initialize!');
			});
		// setInterval(applicationManager.writeApplications, 1000 * 60 * 5);
	},
};
