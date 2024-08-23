const { ActionRowBuilder, ButtonComponent } = require('discord.js');

class ApplyCommandHelper {
	/**
	 * Creates a new ApplyCommandHelper for a user
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
}

module.exports = {
	ApplyCommandHelper
};
