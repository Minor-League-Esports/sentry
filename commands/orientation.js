const log4js = require('log4js');
const logger = log4js.getLogger('MetricsCommand');
const { logLevel, channels } = require('../config.json');
logger.level = logLevel;

const { DiscordLogger } = require('../util/DiscordLogger');
const logChannel = channels['logChannelId'];

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('orientation')
		.setDescription('Sends orientation information')
		.setDMPermission(false),
	async execute(interaction) {
		interaction.reply({ content: 'Not yet implemented.', ephemeral: true });
	}
};
