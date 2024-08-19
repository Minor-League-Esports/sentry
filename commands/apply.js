const log4js = require('log4js');
const logger = log4js.getLogger('ApplyCommand');
const { logLevel } = require('../config.json');
logger.level = logLevel;

const { SlashCommandBuilder } = require('discord.js');
const { DiscordLogger } = require('../util/DiscordLogger.js');
const { channels } = require('../config.json');
const { DatabaseManager } = require('../util/DatabaseManager');
const { MLEApplication } = require('../util/objects/MLEApplication.js');
const { PartialApplicationHelper } = require('../util/helpers/PartialApplicationHelper.js');

module.exports = {
	data: new SlashCommandBuilder().setName('apply').setDescription('Get an MLE application'),
	async execute(interaction) {
		logger.debug('Apply command recieved');
		await interaction.deferReply({ ephemeral: true });
		// Set up loggers
		const client = interaction.client;
		const discordLogger = new DiscordLogger(client, channels['logChannelId']);
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
			interaction.editReply(
				'An error occurred creating the application. Contact staff if this issue persists.'
			);
			return;
		}

		const user = interaction.user;

		dbManager
			.getApplication(user.id)
			.then((application) => {
				logger.debug(`Got an application for ${user} from DB. Status: ${application.getStatus()}`);
				if (application.getStatus() === 'partial') {
					const helper = new PartialApplicationHelper(user);
					interaction.editReply(helper.generateResponse());
				} else if (application.getStatus() === 'rejected') {
				}
			})
			.catch((error) => {
				logger.error(error);
				const application = new MLEApplication(user);
				return;
			});

		dbManager.close();
	}
};
