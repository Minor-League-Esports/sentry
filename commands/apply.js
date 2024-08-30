const log4js = require('log4js');
const logger = log4js.getLogger('ApplyCommand');
const { logLevel, channels } = require('../config.json');
logger.level = logLevel;

const { DiscordLogger } = require('../util/DiscordLogger');
const logChannel = channels['logChannelId'];

const { SlashCommandBuilder } = require('discord.js');
const { DatabaseManager } = require('../util/DatabaseManager');
const { MLEApplication } = require('../util/objects/MLEApplication');
const { PartialApplyCommandHelper } = require('../util/helpers/command/PartialApplyCommandHelper');
const { ApplicationHelper } = require('../util/helpers/ApplicationHelper');

module.exports = {
	data: new SlashCommandBuilder().setName('apply').setDescription('Get an MLE application'),
	async execute(interaction) {
		logger.debug('Apply command recieved');
		await interaction.deferReply({ ephemeral: true });
		// Set up loggers
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
			.then((application) => {
				logger.debug(`Got an application for ${user} from DB. Status: ${application.getStatus()}`);
				if (application.getStatus() === 'partial') {
					const helper = new PartialApplyCommandHelper(user);
					interaction.editReply(helper.generateResponse());
				} else if (application.getStatus() === 'rejected') {
				}
			})
			.catch((error) => {
				if (error === 'No application found') {
					applicationManager
						.createNewApplication(user.id, user.displayName, user.displayAvatarURL())
						.then((application) => {
							applicationManager.saveApplication(user.id, application);
							const helper = new ApplicationHelper(application);
							user
								.send(helper.generateStartApplicationMessage())
								.then(() => {
									interaction.editReply('A new application has been sent. Please check your DMs.');
								})
								.catch((error) => {
									if (error.code === 50007) {
										interaction.editReply(
											'Your application could not be sent. Check that you have DMs enabled and the bot is not blocked.'
										);
									} else {
										logger.error(error);
										interaction.editReply(
											'Your application could not be sent. Contact staff if this issue persists.'
										);
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
							interaction.editReply(
								'Encountered an error creating a new application. Contact staff if this issue persists.'
							);
						});
				} else {
					discordLogger
						.logMessage(`Encountered an error fetching application for \`${user}\``)
						.then(() => {
							discordLogger.logMessage(error);
						});

					const application = new MLEApplication(
						user.id,
						user.displayName,
						user.displayAvatarURL()
					);
					const helper = new ApplicationHelper(application);
					user
						.send(helper.generateStartApplicationMessage())
						.then(() => {
							interaction.editReply(
								'An error occured fetching your application, a new application has been sent. Please check your DMs.'
							);
						})
						.catch((error) => {
							if (error.code === 50007) {
								interaction.editReply(
									'Your application could not be sent. Check that you have DMs enabled and the bot is not blocked.'
								);
							} else {
								logger.error(error);
								interaction.editReply(
									'Your application could not be sent. Contact staff if this issue persists.'
								);
								discordLogger
									.logMessage(`Encountered an error sending an application to \`${user}\``)
									.then(() => {
										discordLogger.logMessage(error);
									});
							}
						});
				}
			});
	}
};
