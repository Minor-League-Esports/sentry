const log4js = require('log4js');
const logger = log4js.getLogger('MetricsCommand');
const { logLevel, channels } = require('../config.json');
logger.level = logLevel;

const { DiscordLogger } = require('../util/DiscordLogger');
const logChannel = channels['logChannelId'];

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { DatabaseManager } = require('../util/DatabaseManager');
const { MLEApplication } = require('../util/objects/MLEApplication');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('metrics')
		.setDescription('Generates metrics on application data')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.addStringOption((option) =>
			option
				.setName('start')
				.setDescription('The starting date to pull metrics from (inclusive)')
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName('end')
				.setDescription('The ending date to pull metrics from (inclusive)')
				.setRequired(true)
		),
	async execute(interaction) {
		// Try to parse dates
		const startDate = interaction.options.getString('start');
		const parsedStartDate = Date.parse(startDate);

		if (isNaN(parsedStartDate)) {
			interaction.reply({
				content: `Could not parse start date \`${startDate}\` into a date!`,
				ephemeral: true
			});
			return;
		}

		const endDate = interaction.options.getString('end');
		const parsedEndDate = Date.parse(endDate);

		if (isNaN(parsedEndDate)) {
			interaction.reply({
				content: `Could not parse start date \`${parsedEndDate}\` into a date!`,
				ephemeral: true
			});
			return;
		}

		await interaction.deferReply();
		// Set up loggers
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
			interaction.editReply('An error fetching metrics. Contact staff if this issue persists.');
			return;
		}

		dbManager
			.fetchMetrics(parsedStartDate, parsedEndDate)
			.then((metrics) => {
				interaction.editReply({ embeds: [metrics.toString()] });
			})
			.catch((error) => {
				discordLogger.logMessage(`Failed to pull metrics! Reason: ${error}`);
				interaction.reply(`Failed to pull metrics! Reason: ${error}`);
				return;
			});

		dbManager.close();
	}
};
