const { ActionRowBuilder, ButtonComponent } = require('discord.js');

class ApplicationHelper {
	/**
	 * Creates a new ApplicationHelper for a user
	 * @param {User} user
	 */
	constructor(user) {
		this._userName = user.displayName;
		this._userId = user.id;
		this._userAvatar = user.displayAvatarURL();
	}

	generateResponse() {
		return {
			embeds: [this.generateEmbed()],
			components: this.generateButtons()
		};
	}

	generateEmbed() {}

	generateButtons() {}

	/**
	 * Builds action rows from a list of buttons
	 * @param  {...ButtonComponent} buttons
	 * @returns {ActionRowBuilder[]} An array of built action rows
	 */
	buildActionRows(...buttons) {
		if (buttons.length > 25) {
			throw new Error('Too many buttons!');
		}

		let rows = [];
		for (let i = 0; i < buttons.length; i++) {
			let row;
			if (i % 5 === 0) {
				row = new ActionRowBuilder();
			} else {
				row = rows[rows.length - 1];
			}
			row.addComponents(buttons[i]);
			rows[i / 5] = row;
		}
		return rows;
	}
}

module.exports = {
	ApplicationHelper
};
