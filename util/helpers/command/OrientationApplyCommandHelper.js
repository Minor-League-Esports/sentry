const { EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { buildActionRows } = require('../../utils.js');
const { ApplyCommandHelper: ApplyCommandHelper } = require('./ApplyCommandHelper.js');

class OrientationApplyCommandHelper extends ApplyCommandHelper {
	constructor(user) {
		super(user);
	}

	generateEmbed() {
		return new EmbedBuilder()
			.setColor('#00ff00')
			.setTitle(`Accepted Application: ${this._userName}`)
			.setFooter({ text: `ID: ${this._userId}` })
			.setTimestamp()
			.setThumbnail(
				'https://cdn.discordapp.com/emojis/1270034202548768868.webp?size=128&quality=lossless'
			)
			.addFields({
				name: 'Application Found!',
				value: `
						Our records indicate that you are in the orientation phase of your application. Please run \`/orientation\` to begin.
						`
			});
	}

	generateButtons() {
		return buildActionRows(this.generateApplyButton());
	}

	generateApplyButton() {
		return new ButtonBuilder()
			.setCustomId('applyButton')
			.setLabel('Apply')
			.setStyle(ButtonStyle.Success);
	}
}

module.exports = {
	OrientationApplyCommandHelper
};
