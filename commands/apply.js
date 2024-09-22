const log4js = require('log4js');
const logger = log4js.getLogger('ApplyCommand');
const { logLevel, channels, roles } = require('../config.json');
logger.level = logLevel;

const { DiscordLogger } = require('../util/DiscordLogger');
const logChannel = channels['logChannelId'];
const orientationRole = roles['orientationRole'];

const { SlashCommandBuilder } = require('discord.js');
const { MLEApplication } = require('../util/objects/MLEApplication');
const { PartialApplyCommandHelper } = require('../util/helpers/command/PartialApplyCommandHelper');
const {
	SubmittedApplyCommandHelper
} = require('../util/helpers/command/SubmittedApplyCommandHelper');
const { ApplicationHelper } = require('../util/helpers/ApplicationHelper');
const { BanManager } = require('../util/BanManager');
const { BannedApplyCommandHelper } = require('../util/helpers/command/BannedApplyCommandHelper');
const {
	RejectedApplyCommandHelper
} = require('../util/helpers/command/RejectedApplyCommandHelper');
const {
	AcceptedApplyCommandHelper
} = require('../util/helpers/command/AcceptedApplyCommandHelper');
const {
	OrientationApplyCommandHelper
} = require('../util/helpers/command/OrientationApplyCommandHelper');

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

		if (interaction.member.roles.cache.has(orientationRole)) {
			const helper = new OrientationApplyCommandHelper(user);
			interaction.editReply({ embeds: [helper.generateEmbed()] });
			return;
		}

		const banManager = new BanManager();
		const isBanned = await banManager.isUserBanned(user.displayName, user.id);

		if (isBanned) {
			const helper = new BannedApplyCommandHelper(user);
			interaction.editReply(helper.generateResponse());
			return;
		}

		applicationManager
			.getApplication(user.id)
			.then((application) => {
				logger.debug(`Got an application for ${user} from DB. Status: ${application.getStatus()}`);
				if (application.getStatus() === 'partial' || application.getStatus() === 'init') {
					const helper = new PartialApplyCommandHelper(user);
					interaction.editReply(helper.generateResponse());
				} else if (application.getStatus() === 'rejected') {
					const helper = new RejectedApplyCommandHelper(user);
					interaction.editReply(helper.generateResponse());
				} else if (application.getStatus() === 'submitted') {
					const helper = new SubmittedApplyCommandHelper(user);
					interaction.editReply(helper.generateResponse());
				} else if (
					application.getStatus() === 'accepted' ||
					application.getStatus() === 'complete'
				) {
					const helper = new AcceptedApplyCommandHelper(user);
					interaction.editReply(helper.generateResponse());
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
