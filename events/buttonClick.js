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

		// await interaction.deferReply({ ephemeral: true });

		const client = interaction.client;
		const discordLogger = new DiscordLogger(client, logChannel);
		try {
			await discordLogger.init();
		} catch (error) {
			logger.warn(`Failed to initialize DiscordLogger`);
		}

		const dbManager = new DatabaseManager(null, null, null, null);
		try {
			await dbManager.init();
		} catch (error) {
			discordLogger.logMessage('Failed to initialize DatabaseManager');
			logger.error('Failed to initialize DatabaseManager');
			interaction.reply({
				content: 'An error occurred viewing the application. Contact staff if this issue persists.',
				ephemeral: true
			});
			return;
		}

		const user = interaction.user;
		const buttonId = interaction.customId;

		dbManager
			.getApplication(user.id)
			.then(async (application) => {
				logger.debug(`Got an application for ${user} from DB. Status: ${application.getStatus()}`);
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
							interaction.editReply(
								'Your partial application has been sent. Please check your DMs.'
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
									.logMessage('Encountered an error viewing a partial application!')
									.then(() => {
										discordLogger.logMessage(error);
									});
							}
						});
				} else if (buttonId === 'applicationContinueButton') {
				} else if (buttonId === 'applicationRestartButton') {
					dbManager
						.createNewApplication(user.id, user.displayName, user.displayAvatarURL())
						.then((application) => {
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
					const helper = new ApplicationHelper(application);
					dbManager
						.saveApplication(helper.updateApplication(interaction))
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

		dbManager.close();

		// const pendingAppButtons = [
		// 	'applicationAcceptButton',
		// 	'applicationRejectButton',
		// 	'applicationReviewButton'
		// ];

		// if (pendingAppButtons.includes(buttonId)) {
		// 	const appLogChannel = await interaction.client.channels.fetch(appLogChannelId);
		// 	if (interaction.channelId !== pendingAppsChannelId) {
		// 		await interaction.reply('Error: button is not in application channel!');
		// 		return;
		// 	}

		// 	const message = interaction.message;
		// 	const messageEmbeds = message.embeds;

		// 	if (messageEmbeds.length !== 1) {
		// 		await interaction.reply('Error: Message has a number of embeds not equal to 1!');
		// 		return;
		// 	}

		// 	const application = new PendingApplication(interaction.user, messageEmbeds[0]);
		// 	const guildMember = await interaction.guild.members
		// 		.fetch(application.getUserId())
		// 		.catch(async function (error) {
		// 			await interaction.reply(
		// 				`Error: Could not find \`${application.getUserName()} (${application.getUserId()})\` in the server`
		// 			);
		// 			return;
		// 		});

		// 	if (buttonId === 'applicationAcceptButton') {
		// 		await PendingApplicationManager.acceptApplication(guildMember, application);
		// 		await message.delete();
		// 		await interaction.reply({
		// 			content: `Successfully accepted application for \`${application.getUserName()} (${application.getUserId()})\``,
		// 			ephemeral: true
		// 		});
		// 	} else if (buttonId === 'applicationRejectButton') {
		// 		await interaction.showModal(application.generateRejectReasonModal());
		// 	} else if (buttonId === 'applicationReviewButton') {
		// 		await interaction.showModal(application.generateReviewReasonModal());
		// 	}

		// 	return;
		// }

		// const partialAppButtons = [
		// 	'applicationAgreeButton',
		// 	'applicationYesButton',
		// 	'applicationNoButton',
		// 	'applicationAnswerButton'
		// ];

		// if (partialAppButtons.includes(buttonId)) {
		// 	const userId = interaction.user.id;
		// 	const userApplication = PartialApplicationManager.getApplication(userId);

		// 	if (userApplication === undefined) {
		// 		await interaction.reply(
		// 			'Could not find an application on file. Please run /apply to begin the application process.'
		// 		);
		// 		return;
		// 	}

		// 	if (userApplication.getStatus() === 'newToDiscord') {
		// 		if (buttonId === 'applicationYesButton') {
		// 			userApplication.setNewDiscord('Yes');
		// 		} else if (buttonId === 'applicationNoButton') {
		// 			userApplication.setNewDiscord('No');
		// 		} else {
		// 			await interaction.reply('Error: invalid button selected. Contact staff.');
		// 			return;
		// 		}
		// 	}

		// 	if (userApplication.getStatus() === 'final') {
		// 		if (buttonId === 'applicationYesButton') {
		// 			userApplication.setConfirm(true);
		// 		} else if (buttonId === 'applicationNoButton') {
		// 			userApplication.setConfirm(false);
		// 		} else {
		// 			await interaction.reply('Error: invalid button selected. Contact staff.');
		// 			return;
		// 		}
		// 	}

		// 	await PartialApplicationManager.advanceApplication(interaction, userApplication);
		// 	return;
		// }
	}
};
