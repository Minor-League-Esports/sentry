const { Events } = require('discord.js');
const { PartialApplicationManager } = require('../util/PartialApplicationManager.js');
const { PendingApplication } = require('../util/PendingApplication.js');
const { pendingAppsChannelId, appLogChannelId } = require('../config.json');
const { PendingApplicationManager } = require('../util/PendingApplicationManager.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isButton()) return;

		const buttonId = interaction.customId;

		const pendingAppButtons = [
			'applicationAcceptButton',
			'applicationRejectButton',
			'applicationReviewButton'
		];

		if (pendingAppButtons.includes(buttonId)) {
			const appLogChannel = await interaction.client.channels.fetch(appLogChannelId);
			if (interaction.channelId !== pendingAppsChannelId) {
				await interaction.reply('Error: button is not in application channel!');
				return;
			}

			const message = interaction.message;
			const messageEmbeds = message.embeds;

			if (messageEmbeds.length !== 1) {
				await interaction.reply('Error: Message has a number of embeds not equal to 1!');
				return;
			}

			const application = new PendingApplication(interaction.user, messageEmbeds[0]);
			const guildMember = await interaction.guild.members
				.fetch(application.getUserId())
				.catch(async function (error) {
					await interaction.reply(
						`Error: Could not find \`${application.getUserName()} (${application.getUserId()})\` in the server`
					);
					return;
				});

			if (buttonId === 'applicationAcceptButton') {
				await PendingApplicationManager.acceptApplication(guildMember, application);
				await message.delete();
				await interaction.reply({
					content: `Successfully accepted application for \`${application.getUserName()} (${application.getUserId()})\``,
					ephemeral: true
				});
			} else if (buttonId === 'applicationRejectButton') {
				await interaction.showModal(application.generateRejectReasonModal());
			} else if (buttonId === 'applicationReviewButton') {
				await interaction.showModal(application.generateReviewReasonModal());
			}

			return;
		}

		const partialAppButtons = [
			'applicationAgreeButton',
			'applicationYesButton',
			'applicationNoButton',
			'applicationAnswerButton'
		];

		if (partialAppButtons.includes(buttonId)) {
			const userId = interaction.user.id;
			const userApplication = PartialApplicationManager.getApplication(userId);

			if (userApplication === undefined) {
				await interaction.reply(
					'Could not find an application on file. Please run /apply to begin the application process.'
				);
				return;
			}

			if (userApplication.getStatus() === 'newToDiscord') {
				if (buttonId === 'applicationYesButton') {
					userApplication.setNewDiscord('Yes');
				} else if (buttonId === 'applicationNoButton') {
					userApplication.setNewDiscord('No');
				} else {
					await interaction.reply('Error: invalid button selected. Contact staff.');
					return;
				}
			}

			if (userApplication.getStatus() === 'final') {
				if (buttonId === 'applicationYesButton') {
					userApplication.setConfirm(true);
				} else if (buttonId === 'applicationNoButton') {
					userApplication.setConfirm(false);
				} else {
					await interaction.reply('Error: invalid button selected. Contact staff.');
					return;
				}
			}

			await PartialApplicationManager.advanceApplication(interaction, userApplication);
			return;
		}
	}
};
