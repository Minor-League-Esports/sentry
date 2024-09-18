const log4js = require('log4js');
const logger = log4js.getLogger('ButtonClickEvent');
const { logLevel, channels, roles } = require('../config.json');
logger.level = logLevel;

const { DiscordLogger } = require('../util/DiscordLogger');
const logChannel = channels['logChannelId'];
const acceptedChannelId = channels['acceptedAppsChannelId'];
const orientationRole = roles['orientationRole'];

const {
	Events,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	TextInputStyle,
	TextInputBuilder,
	ModalBuilder
} = require('discord.js');
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
				} else if (buttonId === 'applicationRestartButton' || buttonId === 'applyButton') {
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
				} else if (buttonId === 'applicationAcceptButton') {
					interaction.guild.members
						.fetch(application.getUserId())
						.then(async (applicant) => {
							application.setStatus('accepted');

							const acceptEmbed = new EmbedBuilder()
								.setColor('#00ff00')
								.setTitle(`MLE Application Accepted!`)
								.setFooter({ text: `ID: ${application.getUserId()}` })
								.setTimestamp()
								.setThumbnail(
									'https://cdn.discordapp.com/emojis/1270034202548768868.webp?size=128&quality=lossless'
								)
								.addFields(
									{
										name: 'Congrats! Your application to MLE has been accepted',
										value: 'You are now one step closer to becoming an MLE member!'
									},
									{
										name: 'Next Steps',
										value:
											'You now have the orientation role. Use the `/orientation` command in the admissions ' +
											'server to get your orientation video(s) sent to you in order to continue.'
									}
								);

							const acceptChannel = await client.channels.fetch(acceptedChannelId);
							const acceptedApplicationEmbed = application.toString();
							acceptedApplicationEmbed
								.addFields({
									name: 'Reviewer',
									value: interaction.user.displayName
								})
								.setTitle(`Application Accepted: ${application.getUsername()}`)
								.setColor('#00ff00');
							acceptChannel.send({ embeds: [acceptedApplicationEmbed] });

							// await interaction.message.delete();
							await interaction.reply({
								content: `Successfully accepted application for \`${application.getUsername()} (${application.getUserId()})\`. Delete any review requests manually.`,
								ephemeral: true
							});

							applicant.roles
								.add(orientationRole)
								.then(() => {
									interaction.followUp({ content: 'Orientation role applied', ephemeral: true });
								})
								.catch((error) => {
									interaction.followUp({
										content: 'Failed to apply orientation role, contact administrators',
										ephemeral: true
									});
									logger.error(error);
								});

							applicant
								.send({ embeds: [acceptEmbed] })
								.then(() => {
									interaction.followUp({ content: 'Notice sent', ephemeral: true });
								})
								.catch((error) => {
									if (error.code === 50007) {
										interaction.followUp({
											content: 'Notice not sent. Applicant has DMs off or bot is blocked',
											ephemeral: true
										});
									} else {
										interaction.followUp({
											content: 'Notice not sent. Unknown reason, contact administrators',
											ephemeral: true
										});
										logger.error(error);
									}
								});
						})
						.catch((error) => {
							if (error.code === 10007) {
								interaction.reply({
									content: 'Error! Applicant not in server',
									ephemeral: true
								});
							} else {
								interaction.reply({
									content: 'Error getting member, contact administrators',
									ephemeral: true
								});
								logger.error(error);
							}
						});
				} else if (buttonId === 'applicationRejectButton') {
					const modal = new ModalBuilder()
						.setCustomId('rejectReasonModal')
						.setTitle(`Reject Application: ${this._userName}`);

					const reasonInput = new TextInputBuilder()
						.setCustomId('reason')
						.setLabel('Reason for rejection? (SHOWN TO USER)')
						.setStyle(TextInputStyle.Paragraph);

					const timeInput = new TextInputBuilder()
						.setCustomId('time')
						.setLabel('Time to deny ("None", "1 month", "Permanent")')
						.setStyle(TextInputStyle.Short);

					// Create action rows
					const actionRowOne = new ActionRowBuilder().addComponents(reasonInput);
					const actionRowTwo = new ActionRowBuilder().addComponents(timeInput);

					// Add action rows to modal
					modal.addComponents(actionRowOne, actionRowTwo);
					interaction.showModal(modal);
				} else if (buttonId === 'applicationReviewButton') {
					// Build modal
					const modal = new ModalBuilder()
						.setCustomId('reviewReasonModal')
						.setTitle(`Request Review`);

					const textInput = new TextInputBuilder()
						.setCustomId('reason')
						.setLabel('Why are you requesting an application review?')
						.setStyle(TextInputStyle.Short);

					// Create action rows
					const actionRowOne = new ActionRowBuilder().addComponents(textInput);

					// Add action rows to modal
					modal.addComponents(actionRowOne);
					interaction.showModal(modal);
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
