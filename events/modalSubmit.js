const log4js = require('log4js');
const logger = log4js.getLogger('ModalSubmitEvent');
const { logLevel, channels, roles } = require('../config.json');
logger.level = logLevel;

const { DiscordLogger } = require('../util/DiscordLogger');
const logChannel = channels['logChannelId'];
const rejectChannelId = channels['rejectedAppsChannelId'];
const admissionsRole = roles['admissionsRole'];

const { Events, EmbedBuilder } = require('discord.js');
const { ApplicationHelper } = require('../util/helpers/ApplicationHelper');
const { parseTimeInput } = require('../util/utils');
const { BanManager } = require('../util/BanManager');

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

		if (interaction.customId === 'reviewReasonModal') {
			const reason = interaction.fields.getTextInputValue('reason');
			const userDetails = interaction.fields.getTextInputValue('user');
			interaction
				.reply({
					content:
						`<@&${admissionsRole}> new review request!\n` +
						`Reason: ${reason}\n` +
						`Requestor: ${user.displayName}`,
					fetchReply: true
				})
				.then((message) => {
					message.startThread({ name: `Application Review Request: ${userDetails}` });
				});
			return;
		} else if (interaction.customId === 'rejectReasonModal') {
			const reason = interaction.fields.getTextInputValue('reason');
			const time = interaction.fields.getTextInputValue('time').toLowerCase();
			const applicationEmbed = interaction.message.embeds[0];
			const userId = applicationEmbed.footer.text.split('ID: ')[1];
			const userName = applicationEmbed.title.split('New application! ')[1];
			try {
				const parsedTime = parseTimeInput(time);
				logger.debug(parsedTime);

				applicationManager
					.getApplication(userId)
					.then(async (application) => {
						logger.debug(
							`Got an application for ${user} from DB. Status: ${application.getStatus()}`
						);
						if (application.getStatus() !== 'submitted') {
							interaction.reply(`Error! User application is not in "submitted" status`);
							return;
						}

						const rejectEmbed = new EmbedBuilder()
							.setColor('#ff0000')
							.setTitle(`MLE Application Rejected`)
							.setFooter({ text: `ID: ${userId}` })
							.setTimestamp()
							.setThumbnail(
								'https://cdn.discordapp.com/emojis/1270034202548768868.webp?size=128&quality=lossless'
							)
							.addFields(
								{
									name: 'Your application has been rejected',
									value:
										'Unfortunately, your application into Minor League Esports has been rejected. Rejection reason and ban time (if applicable) shown below.'
								},
								{
									name: 'Rejection Reason',
									value: reason
								},
								{
									name: 'Ban Length',
									value: time
								},
								{
									name: 'Appeal Here',
									value: '[Admissions Ban Appeal](https://dyno.gg/form/774fd3d3)'
								}
							);

						if (time !== 'none') {
							const banManager = new BanManager();
							banManager.addOtherBan(userName, userId, parsedTime, reason);
						}

						const rejectChannel = await client.channels.fetch(rejectChannelId);
						const rejectedApplicationEmbed = EmbedBuilder.from(applicationEmbed);
						rejectedApplicationEmbed
							.addFields(
								{
									name: 'Reviewer',
									value: interaction.user.displayName
								},
								{
									name: 'Reason',
									value: reason
								},
								{
									name: 'Time',
									value: time
								}
							)
							.setTitle(`Application Rejected: ${userName}`)
							.setColor('#ff0000');
						rejectChannel.send({ embeds: [rejectedApplicationEmbed] });

						application.setStatus('rejected');
						application.setReviewTimestamp(new Date());
						await applicationManager.saveApplication(application.getUserId(), application);

						await interaction.message.delete();
						await interaction.reply({
							content: `Successfully rejected application for \`${userName} (${userId})\`. Delete any review requests manually.`,
							ephemeral: true
						});

						interaction.guild.members
							.fetch(userId)
							.then(async (applicant) => {
								applicant
									.send({ embeds: [rejectEmbed] })
									.then(() => {
										interaction.followUp({ content: 'Notice to applicant sent', ephemeral: true });
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
									interaction.followUp({
										content: 'Notice not sent. Applicant not in server',
										ephemeral: true
									});
								} else {
									interaction.followUp({
										content: 'Notice not sent. Error getting member, contact administrators',
										ephemeral: true
									});
									logger.error(error);
								}
							});
					})
					.catch(() => {
						interaction.reply(`Error! Could not retrieve user application!`);
					});
			} catch (error) {
				logger.error(error);
				if (error === 'Invalid input format') {
					await interaction.reply({
						content: `Could not parse \`${time}\` into a valid time!`,
						ephemeral: true
					});
				} else {
					await interaction.reply({
						content: `Encountered an error!\n\`${error}`,
						ephemeral: true
					});
				}

				return;
			}
			return;
		}
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
