const { EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { buildActionRows } = require('../../utils.js');
const { ApplyCommandHelper: ApplyCommandHelper } = require('./ApplyCommandHelper.js');

class AcceptedApplyCommandHelper extends ApplyCommandHelper {
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
						Our records indicate that your last application was accepted. 
						If you made it into the main MLE server and left within the last 30 days, reach out to our admissions staff and they can invite you back.
						If you did not complete your orientation, check if you can run \`/orientation\` and begin your orientation.
						If you cannot run the command, you may need to apply again. Click the button below to apply.
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
	AcceptedApplyCommandHelper
};
