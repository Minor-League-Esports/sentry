const log4js = require('log4js');
const logger = log4js.getLogger('ButtonClickEvent');
const { logLevel, channels } = require('../config.json');
logger.level = logLevel;

const { DiscordLogger } = require('../util/DiscordLogger');
const logChannel = channels['logChannelId'];

const { Events } = require('discord.js');
const { DatabaseManager } = require('../util/DatabaseManager');
const { PartialApplyCommandHelper } = require('../util/helpers/command/PartialApplyCommandHelper');
const { MLEApplication } = require('../util/objects/MLEApplication');
const { buildActionRows } = require('../util/utils');
const { ApplicationHelper } = require('../util/helpers/ApplicationHelper');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isButton()) return;

		logger.trace('Button clicked');

		const client = interaction.client;
		const discordLogger = new DiscordLogger(client, logChannel);
		try {
			await discordLogger.init();
		} catch (error) {
			logger.warn(`Failed to initialize DiscordLogger`);
		}

		const user = interaction.user;
		const buttonId = interaction.customId;

		applicationManager
			.getApplication(user.id)
			.then(async (application) => {
				logger.debug(`Got an application for ${user}. Status: ${application.getStatus()}`);
				if (buttonId === 'applicationViewButton') {
					logger.trace('Clicked view application button');
					const helper = new PartialApplyCommandHelper(user);
					user
						.send({
							embeds: [application.toString()],
							components: buildActionRows(
								helper.generateContinueButton(),
								helper.generateRestartButton()
							)
						})
						.then(async () => {
							interaction.reply({
								content: 'Your partial application has been sent. Please check your DMs.',
								ephemeral: true
							});
						})
						.catch((error) => {
							if (error.code === 50007) {
								interaction.reply({
									content:
										'Your application could not be sent. Check that you have DMs enabled and the bot is not blocked.',
									ephemeral: true
								});
							} else {
								logger.error(error);
								interaction.reply({
									content:
										'Your application could not be sent. Contact staff if this issue persists.',
									ephemeral: true
								});
								discordLogger
									.logMessage('Encountered an error viewing a partial application!')
									.then(() => {
										discordLogger.logMessage(error);
									});
							}
						});
				} else if (buttonId === 'applicationRestartButton') {
					applicationManager
						.createNewApplication(user.id, user.displayName, user.displayAvatarURL())
						.then((application) => {
							const helper = new ApplicationHelper(application);
							user
								.send(helper.generateStartApplicationMessage())
								.then(() => {
									interaction.reply({
										content: 'A new application has been sent. Please check your DMs.',
										ephemeral: true
									});
								})
								.catch((error) => {
									if (error.code === 50007) {
										interaction.reply({
											content:
												'Your application could not be sent. Check that you have DMs enabled and the bot is not blocked.',
											ephemeral: true
										});
									} else {
										logger.error(error);
										interaction.reply({
											content:
												'Your application could not be sent. Contact staff if this issue persists.',
											ephemeral: true
										});
										discordLogger
											.logMessage(`Encountered an error sending an application to \`${user}\``)
											.then(() => {
												discordLogger.logMessage(error);
											});
									}
								});
						})
						.catch((error) => {
							logger.error(error);
							discordLogger.logMessage(error);
							interaction.reply({
								content:
									'Encountered an error creating a new application. Contact staff if this issue persists.',
								ephemeral: true
							});
						});
				} else {
					const helper = new ApplicationHelper(application);
					logger.trace('Updating application!!!');
					logger.trace(application);
					const updatedApp = helper.updateApplication(interaction);
					logger.trace('Application updated!');
					logger.trace(updatedApp);
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
				}
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
