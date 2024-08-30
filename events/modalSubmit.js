const log4js = require('log4js');
const logger = log4js.getLogger('ModalSubmitEvent');
const { logLevel, channels } = require('../config.json');
logger.level = logLevel;

const { DiscordLogger } = require('../util/DiscordLogger');
const logChannel = channels['logChannelId'];

const { Events } = require('discord.js');
const date = require('date-and-time');
const { ApplicationHelper } = require('../util/helpers/ApplicationHelper');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isModalSubmit()) return;

		const client = interaction.client;
		const discordLogger = new DiscordLogger(client, logChannel);
		try {
			await discordLogger.init();
		} catch (error) {
			logger.warn(`Failed to initialize DiscordLogger`);
		}

		const user = interaction.user;

		applicationManager
			.getApplication(user.id)
			.then(async (application) => {
				logger.debug(application);
				const helper = new ApplicationHelper(application);
				const updatedApp = helper.updateApplication(interaction);
				applicationManager
					.saveApplication(user.id, updatedApp)
					.then(() => {
						helper.handleInteraction(interaction);
					})
					.catch((error) => {
						logger.error(error);
						interaction.reply({
							content: 'Failed to save application. Contact staff if this issue persists.',
							ephemeral: true
						});
						discordLogger.logMessage('Encountered an error saving an application!').then(() => {
							discordLogger.logMessage(error);
						});
					});
			})
			.catch((error) => {
				logger.error(error);
				discordLogger.logMessage(`Failed to find application for \`${user}\``);
				interaction.reply({
					content: 'Failed to find your application. Contact staff if this issue persists.',
					ephemeral: true
				});
			});
	}
};
