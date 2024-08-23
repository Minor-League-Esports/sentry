const log4js = require('log4js');
const logger = log4js.getLogger('ModalSubmitEvent');
const { logLevel, channels } = require('../config.json');
logger.level = logLevel;

const { DiscordLogger } = require('../util/DiscordLogger');
const logChannel = channels['logChannelId'];

const { Events } = require('discord.js');
const date = require('date-and-time');
const { DatabaseManager } = require('../util/DatabaseManager');
const { PartialApplyCommandHelper } = require('../util/helpers/command/PartialApplyCommandHelper');
const { MLEApplication } = require('../util/objects/MLEApplication');
const { buildActionRows } = require('../util/utils');
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

		// if (interaction.customId === 'infoGatherModal') {
		// 	// Get fields
		// 	const user = interaction.user;
		// 	const userApplication = PartialApplicationManager.getApplication(user.id);
		// 	if (userApplication.getStatus() !== 'gatherInfo') {
		// 		await interaction.reply(
		// 			'Error: Application is not in info gathering stage! Contact staff.'
		// 		);
		// 		return;
		// 	}

		// 	const ageString = interaction.fields.getTextInputValue('userAge');
		// 	const age = parseInt(ageString);
		// 	if (isNaN(age)) {
		// 		await interaction.reply(`Could not convert \`${ageString}\` to a number!`);
		// 		return;
		// 	}

		// 	const twitter = interaction.fields.getTextInputValue('userTwitter');

		// 	userApplication.setAge(age);
		// 	userApplication.setTwitter(twitter);

		// 	await PartialApplicationManager.advanceApplication(interaction, userApplication);
		// } else if (interaction.customId === 'referralDetailModal') {
		// 	// Get fields
		// 	const user = interaction.user;
		// 	const userApplication = PartialApplicationManager.getApplication(user.id);
		// 	if (userApplication.getStatus() !== 'detailReferral') {
		// 		await interaction.reply(
		// 			'Error: Application is not in referral detail stage! Contact staff.'
		// 		);
		// 		return;
		// 	}

		// 	const referral = interaction.fields.getTextInputValue('referral');

		// 	userApplication.setReferralDetail(referral);

		// 	await PartialApplicationManager.advanceApplication(interaction, userApplication);
		// } else if (interaction.customId === 'whyInterestedModal') {
		// 	// Get fields
		// 	const user = interaction.user;
		// 	const userApplication = PartialApplicationManager.getApplication(user.id);
		// 	if (userApplication.getStatus() !== 'whyInterestedModal') {
		// 		await interaction.reply(
		// 			'Error: Application is not in why interested stage! Contact staff.'
		// 		);
		// 		return;
		// 	}

		// 	const text = interaction.fields.getTextInputValue('text');

		// 	userApplication.setWhyInterested(text);

		// 	await PartialApplicationManager.advanceApplication(interaction, userApplication);
		// } else if (interaction.customId === 'whyFitModal') {
		// 	// Get fields
		// 	const user = interaction.user;
		// 	const userApplication = PartialApplicationManager.getApplication(user.id);
		// 	if (userApplication.getStatus() !== 'whyFitModal') {
		// 		await interaction.reply('Error: Application is not in why good fit stage! Contact staff.');
		// 		return;
		// 	}

		// 	const text = interaction.fields.getTextInputValue('text');

		// 	userApplication.setWhyFit(text);

		// 	await PartialApplicationManager.advanceApplication(interaction, userApplication);
		// } else if (interaction.customId === 'whatToxicModal') {
		// 	// Get fields
		// 	const user = interaction.user;
		// 	const userApplication = PartialApplicationManager.getApplication(user.id);
		// 	if (userApplication.getStatus() !== 'whatToxicModal') {
		// 		await interaction.reply('Error: Application is not in what is toxic stage! Contact staff.');
		// 		return;
		// 	}

		// 	const text = interaction.fields.getTextInputValue('text');

		// 	userApplication.setWhatToxic(text);

		// 	await PartialApplicationManager.advanceApplication(interaction, userApplication);
		// } else if (interaction.customId === 'howReactModal') {
		// 	// Get fields
		// 	const user = interaction.user;
		// 	const userApplication = PartialApplicationManager.getApplication(user.id);
		// 	if (userApplication.getStatus() !== 'howReactModal') {
		// 		await interaction.reply(
		// 			'Error: Application is not in how react to toxicity stage! Contact staff.'
		// 		);
		// 		return;
		// 	}

		// 	const text = interaction.fields.getTextInputValue('text');

		// 	userApplication.setHowReact(text);

		// 	await PartialApplicationManager.advanceApplication(interaction, userApplication);
		// } else if (interaction.customId === 'reviewReasonModal') {
		// 	await interaction.reply(
		// 		`<@&${admissionsRole}> New application review request from ${interaction.user.displayName}:\n` +
		// 			interaction.fields.getTextInputValue('reason')
		// 	);
		// } else if (interaction.customId === 'rejectReasonModal') {
		// 	const application = new PendingApplication(interaction.user, interaction.message.embeds[0]);

		// 	const guildMember = await interaction.guild.members
		// 		.fetch(application.getUserId())
		// 		.catch(async function (error) {
		// 			await interaction.reply(
		// 				`Error: Could not find \`${application.getUserName()} (${application.getUserId()})\` in the server`
		// 			);
		// 			return;
		// 		});

		// 	const rejectReason = interaction.fields.getTextInputValue('reason');
		// 	const rejectTime = interaction.fields.getTextInputValue('time');
		// 	try {
		// 		const parsedTime = parseTimeInput(rejectTime);

		// 		await PendingApplicationManager.rejectApplication(
		// 			guildMember,
		// 			application,
		// 			rejectReason,
		// 			rejectTime,
		// 			parsedTime
		// 		);
		// 		await interaction.message.delete();
		// 		await interaction.reply({
		// 			content: `Successfully rejected application for \`${application.getUserName()} (${application.getUserId()})\``,
		// 			ephemeral: true
		// 		});
		// 	} catch (error) {
		// 		console.error(error);
		// 		await interaction.reply({
		// 			content: `Could not parse \`${rejectTime}\` into a valid time!`,
		// 			ephemeral: true
		// 		});
		// 		return;
		// 	}
		// }
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
