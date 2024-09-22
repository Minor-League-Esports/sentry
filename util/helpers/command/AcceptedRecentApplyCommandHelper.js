const { EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { buildActionRows } = require('../../utils.js');
const { ApplyCommandHelper: ApplyCommandHelper } = require('./ApplyCommandHelper.js');

class AcceptedApplyCommandHelper extends ApplyCommandHelper {
	constructor(user) {
		super(user);
	}

	generateEmbed() {
		return new EmbedBuilder()
			.setColor('#ff0000')
			.setTitle(`Accepted Application: ${this._userName}`)
			.setFooter({ text: `ID: ${this._userId}` })
			.setTimestamp()
			.setThumbnail(
				'https://cdn.discordapp.com/emojis/1270034202548768868.webp?size=128&quality=lossless'
			)
			.addFields(
				{
					name: 'Application Accepted!',
					value: `
						Our records indicate that your last application was accepted within the last 30 days.
						
						`
				},
				{
					name: 'Appeal Here',
					value: `	
						If your application was rejected due to a ban, appeal using the links below.
						[MLE Ban Appeal](https://dyno.gg/form/8240976c) (use if you are a former MLE member)
						[Admissions Ban Appeal](https://dyno.gg/form/774fd3d3) (use if you were banned before making it into MLE)
					`
				},
				{
					name: 'Apply anyway?',
					value:
						'ONLY USE AFTER DISCUSSION WITH AN ADMISSIONS AGENT\n' +
						'If your rejection status has been resolved, you may apply anyway. Your rejection status will be noted on your application.'
				}
			);
	}

	generateButtons() {
		return buildActionRows(this.generateApplyButton());
	}

	generateApplyButton() {
		return new ButtonBuilder()
			.setCustomId('applyRejectedButton')
			.setLabel('Apply')
			.setStyle(ButtonStyle.Success);
	}
}

module.exports = {
	AcceptedApplyCommandHelper
};
