const { EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { buildActionRows } = require('../../utils.js');
const { ApplyCommandHelper: ApplyCommandHelper } = require('./ApplyCommandHelper.js');

class PendingApplyCommandHelper extends ApplyCommandHelper {
	constructor(user) {
		super(user);
	}

	generateEmbed() {
		return new EmbedBuilder()
			.setColor('#ffff00')
			.setTitle(`Pending Application: ${this._userName}`)
			.setFooter({ text: `ID: ${this._userId}` })
			.setTimestamp()
			.setThumbnail(
				'https://cdn.discordapp.com/emojis/1270034202548768868.webp?size=128&quality=lossless'
			)
			.addFields({
				name: 'Pending Application Found',
				value:
					'You already have an application pending review by our admissions agents. Would you like to view it or start a new one (**this discards your current application**)?'
			});
	}

	generateButtons() {
		return buildActionRows(this.generateViewAppButton(), this.generateRestartButton());
	}

	generateRestartButton() {
		return new ButtonBuilder()
			.setCustomId('applicationRestartButton')
			.setLabel('Start New')
			.setStyle(ButtonStyle.Danger);
	}

	generateViewAppButton() {
		return new ButtonBuilder()
			.setCustomId('applicationViewPendingButton')
			.setLabel('View Application')
			.setStyle(ButtonStyle.Primary);
	}
}

module.exports = {
	PendingApplyCommandHelper
};
