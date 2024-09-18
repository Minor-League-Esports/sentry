const { EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { buildActionRows } = require('../../utils.js');
const { ApplyCommandHelper: ApplyCommandHelper } = require('./ApplyCommandHelper.js');

class BannedApplyCommandHelper extends ApplyCommandHelper {
	constructor(user) {
		super(user);
	}

	generateEmbed() {
		return new EmbedBuilder()
			.setColor('#ff0000')
			.setTitle(`Banned: ${this._userName}`)
			.setFooter({ text: `ID: ${this._userId}` })
			.setTimestamp()
			.setThumbnail(
				'https://cdn.discordapp.com/emojis/1270034202548768868.webp?size=128&quality=lossless'
			)
			.addFields(
				{
					name: 'You are banned!',
					value:
						'Our records indicate that you are banned from MLE. If you believe this is an error, ' +
						'please reach out to our admissions team for clarification.'
				},
				{
					name: 'Appeal Here',
					value:
						'[MLE Ban Appeal](https://dyno.gg/form/8240976c) (use if you are a former MLE member)\n' +
						'[Admissions Ban Appeal](https://dyno.gg/form/774fd3d3) (use if you were banned before making it into MLE)'
				},
				{
					name: 'Apply anyway?',
					value:
						'ONLY USE AFTER DISCUSSION WITH AN ADMISSIONS AGENT\n' +
						'If your ban status is an error, you may apply anyway. Your ban status will be noted on your application.'
				}
			);
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
	BannedApplyCommandHelper
};
