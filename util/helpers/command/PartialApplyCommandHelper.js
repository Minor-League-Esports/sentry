const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { ButtonComponent } = require('discord.js');
const { buildActionRows } = require('../../utils.js');
const { ApplyCommandHelper: ApplyCommandHelper } = require('./ApplyCommandHelper.js');

class PartialApplyCommandHelper extends ApplyCommandHelper {
	constructor(user) {
		super(user);
	}

	generateEmbed() {
		return new EmbedBuilder()
			.setColor('#ffff00')
			.setTitle(`Partial Application: ${this._userName}`)
			.setFooter({ text: `ID: ${this._userId}` })
			.setTimestamp()
			.setThumbnail(
				'https://cdn.discordapp.com/emojis/1270034202548768868.webp?size=128&quality=lossless'
			)
			.addFields({
				name: 'Partial Application Found',
				value:
					'We found a partial application for you on file. Would you like to continue it, start over, or view the application?'
			});
	}

	generateButtons() {
		return buildActionRows(
			this.generateContinueButton(),
			this.generateRestartButton(),
			this.generateViewAppButton()
		);
	}

	generateContinueButton() {
		return new ButtonBuilder()
			.setCustomId('applicationContinueButton')
			.setLabel('Continue')
			.setStyle(ButtonStyle.Success);
	}

	generateRestartButton() {
		return new ButtonBuilder()
			.setCustomId('applicationRestartButton')
			.setLabel('Start Over')
			.setStyle(ButtonStyle.Danger);
	}

	generateViewAppButton() {
		return new ButtonBuilder()
			.setCustomId('applicationViewButton')
			.setLabel('View Application')
			.setStyle(ButtonStyle.Primary);
	}
}

module.exports = {
	PartialApplyCommandHelper
};
