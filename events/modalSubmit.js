const { Events } = require('discord.js');
const date = require('date-and-time');
const { PartialApplicationManager } = require('../util/PartialApplicationManager.js');
const { admissionsRole } = require('../config.json');
const { PendingApplication } = require('../util/PendingApplication.js');
const { PendingApplicationManager } = require('../util/PendingApplicationManager.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isModalSubmit()) return;

		if (interaction.customId === 'infoGatherModal') {
			// Get fields
			const user = interaction.user;
			const userApplication = PartialApplicationManager.getApplication(user.id);
			if (userApplication.getStatus() !== 'gatherInfo') {
				await interaction.reply(
					'Error: Application is not in info gathering stage! Contact staff.'
				);
				return;
			}

			const ageString = interaction.fields.getTextInputValue('userAge');
			const age = parseInt(ageString);
			if (isNaN(age)) {
				await interaction.reply(`Could not convert \`${ageString}\` to a number!`);
				return;
			}

			const twitter = interaction.fields.getTextInputValue('userTwitter');

			userApplication.setAge(age);
			userApplication.setTwitter(twitter);

			await PartialApplicationManager.advanceApplication(interaction, userApplication);
		} else if (interaction.customId === 'referralDetailModal') {
			// Get fields
			const user = interaction.user;
			const userApplication = PartialApplicationManager.getApplication(user.id);
			if (userApplication.getStatus() !== 'detailReferral') {
				await interaction.reply(
					'Error: Application is not in referral detail stage! Contact staff.'
				);
				return;
			}

			const referral = interaction.fields.getTextInputValue('referral');

			userApplication.setReferralDetail(referral);

			await PartialApplicationManager.advanceApplication(interaction, userApplication);
		} else if (interaction.customId === 'whyInterestedModal') {
			// Get fields
			const user = interaction.user;
			const userApplication = PartialApplicationManager.getApplication(user.id);
			if (userApplication.getStatus() !== 'whyInterestedModal') {
				await interaction.reply(
					'Error: Application is not in why interested stage! Contact staff.'
				);
				return;
			}

			const text = interaction.fields.getTextInputValue('text');

			userApplication.setWhyInterested(text);

			await PartialApplicationManager.advanceApplication(interaction, userApplication);
		} else if (interaction.customId === 'whyFitModal') {
			// Get fields
			const user = interaction.user;
			const userApplication = PartialApplicationManager.getApplication(user.id);
			if (userApplication.getStatus() !== 'whyFitModal') {
				await interaction.reply('Error: Application is not in why good fit stage! Contact staff.');
				return;
			}

			const text = interaction.fields.getTextInputValue('text');

			userApplication.setWhyFit(text);

			await PartialApplicationManager.advanceApplication(interaction, userApplication);
		} else if (interaction.customId === 'whatToxicModal') {
			// Get fields
			const user = interaction.user;
			const userApplication = PartialApplicationManager.getApplication(user.id);
			if (userApplication.getStatus() !== 'whatToxicModal') {
				await interaction.reply('Error: Application is not in what is toxic stage! Contact staff.');
				return;
			}

			const text = interaction.fields.getTextInputValue('text');

			userApplication.setWhatToxic(text);

			await PartialApplicationManager.advanceApplication(interaction, userApplication);
		} else if (interaction.customId === 'howReactModal') {
			// Get fields
			const user = interaction.user;
			const userApplication = PartialApplicationManager.getApplication(user.id);
			if (userApplication.getStatus() !== 'howReactModal') {
				await interaction.reply(
					'Error: Application is not in how react to toxicity stage! Contact staff.'
				);
				return;
			}

			const text = interaction.fields.getTextInputValue('text');

			userApplication.setHowReact(text);

			await PartialApplicationManager.advanceApplication(interaction, userApplication);
		} else if (interaction.customId === 'reviewReasonModal') {
			await interaction.reply(
				`<@&${admissionsRole}> New application review request from ${interaction.user.displayName}:\n` +
					interaction.fields.getTextInputValue('reason')
			);
		} else if (interaction.customId === 'rejectReasonModal') {
			const application = new PendingApplication(interaction.user, interaction.message.embeds[0]);

			const guildMember = await interaction.guild.members
				.fetch(application.getUserId())
				.catch(async function (error) {
					await interaction.reply(
						`Error: Could not find \`${application.getUserName()} (${application.getUserId()})\` in the server`
					);
					return;
				});

			const rejectReason = interaction.fields.getTextInputValue('reason');
			const rejectTime = interaction.fields.getTextInputValue('time');
			try {
				const parsedTime = parseTimeInput(rejectTime);

				await PendingApplicationManager.rejectApplication(
					guildMember,
					application,
					rejectReason,
					rejectTime,
					parsedTime
				);
				await interaction.message.delete();
				await interaction.reply({
					content: `Successfully rejected application for \`${application.getUserName()} (${application.getUserId()})\``,
					ephemeral: true
				});
			} catch (error) {
				console.error(error);
				await interaction.reply({
					content: `Could not parse \`${rejectTime}\` into a valid time!`,
					ephemeral: true
				});
				return;
			}
		}
	}
};

function parseTimeInput(input) {
	const now = new Date();

	if (input === 'None') {
		return now;
	} else if (input === 'Permanent') {
		return null; // or some other representation of "permanent"
	} else {
		const match = input.match(/(\d+)\s(month|months)/);
		if (match) {
			const months = parseInt(match[1], 10);
			return date.addMonths(now, months);
		} else {
			throw new Error('Invalid input format');
		}
	}
}
