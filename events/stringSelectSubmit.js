const { Events } = require('discord.js');
const { PartialApplicationManager } = require('../util/PartialApplicationManager.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isStringSelectMenu()) return;

		const menuId = interaction.customId;
		const selection = interaction.values;

		const userId = interaction.user.id;
		const userApplication = PartialApplicationManager.getApplication(userId);

		if (userApplication === undefined) {
			await interaction.reply(
				'Could not find an application on file. Please run /apply to begin the application process.'
			);
			return;
		}

		if (menuId === 'referralMenu') {
			if (selection.length !== 1) {
				await interaction.reply('Error: Only select 1 option!');
				return;
			}

			userApplication.setReferral(selection[0]);

			await PartialApplicationManager.advanceApplication(interaction, userApplication);
		} else if (menuId === 'leagueMenu') {
			userApplication.setLeagues(selection);

			await PartialApplicationManager.advanceApplication(interaction, userApplication);
		}
	}
};
