const {
	EmbedBuilder,
	ModalBuilder,
	ActionRowBuilder,
	TextInputBuilder,
	TextInputStyle
} = require('discord.js');

class PendingApplication {
	constructor(agent, embed) {
		this._agent = agent;

		const embedFields = embed.fields;
		embedFields.forEach((field) => {
			const name = field.name;
			const value = field.value;

			if (name === 'Age') {
				this._age = value;
			} else if (name === 'X/Twitter Handle') {
				this._twitter = value;
			} else if (name === 'New to Discord?') {
				this._newDiscord = value;
			} else if (name === 'How did you hear about MLE?') {
				this._referral = value;
			} else if (name === 'What parts of MLE are you interested in?') {
				this._leagues = value;
			} else if (name === 'Why are you interested in being part of the MLE community?') {
				this._whyInterested = value;
			} else if (name === 'Why do you think you would be a good fit for our community?') {
				this._whyFit = value;
			} else if (name === 'What do you consider toxic behavior within a community?') {
				this._whatToxic = value;
			} else if (
				name === 'How would you react if a person becomes aggressive/angry/toxic with you?'
			) {
				this._howReact = value;
			}
		});
		const title = embed.title;
		this._userName = title.split('New MLE Application: ')[1];
		const footer = embed.footer.text;
		this._userId = footer.split('ID: ')[1];
		this._thumbnail = embed.thumbnail.url;
	}

	getAgent() {
		return this._agent;
	}

	getStatus() {
		return this._status;
	}

	getUserId() {
		return this._userId;
	}

	getUserName() {
		return this._userName;
	}

	getAge() {
		return this._age;
	}

	getTwitter() {
		return this._twitter;
	}

	getNewDiscord() {
		return this._newDiscord;
	}

	getReferral() {
		return this._referral;
	}

	getLeagues() {
		return this._leagues;
	}

	getWhyInterested() {
		return this._whyInterested;
	}

	getWhyFit() {
		return this._whyFit;
	}

	getWhatToxic() {
		return this._whatToxic;
	}

	getHowReact() {
		return this._howReact;
	}

	setRejectReason(rejectReason) {
		this._rejectReason = rejectReason;
	}

	generateApplicationAcceptEmbed() {
		let embed = new EmbedBuilder()
			.setColor('#00ff00')
			.setTitle(`MLE Application Accepted: ${this._userName}`)
			.setFooter({ text: `ID: ${this._userId}` })
			.setTimestamp()
			.setThumbnail(this._thumbnail);

		embed = this.addApplicationFields(embed);
		return embed;
	}

	generateApplicationRejectEmbed(reason, time) {
		let embed = new EmbedBuilder()
			.setColor('#ff0000')
			.setTitle(`MLE Application Rejected: ${this._userName}`)
			.setFooter({ text: `ID: ${this._userId}` })
			.setTimestamp()
			.setThumbnail(this._thumbnail);

		embed = this.addApplicationFields(embed).addFields(
			{
				name: 'Rejection reason',
				value: reason
			},
			{
				name: 'Ban length',
				value: time
			}
		);
		return embed;
	}

	addApplicationFields(embed) {
		embed.addFields(
			{
				name: 'Agent',
				value: this._agent.displayName
			},
			{
				name: 'Age',
				value: this._age.toString()
			},
			{
				name: 'X/Twitter Handle',
				value: this._twitter
			},
			{
				name: 'New to Discord?',
				value: this._newDiscord
			},
			{
				name: 'How did you hear about MLE?',
				value: this._referral
			},
			{
				name: 'What parts of MLE are you interested in?',
				value: this._leagues
			},
			{
				name: 'Why are you interested in being part of the MLE community?',
				value: this._whyInterested
			},
			{
				name: 'Why do you think you would be a good fit for our community?',
				value: this._whyFit
			},
			{
				name: 'What do you consider toxic behavior within a community?',
				value: this._whatToxic
			},
			{
				name: 'How would you react if a person becomes aggressive/angry/toxic with you?',
				value: this._howReact
			}
		);

		return embed;
	}

	generateWelcomeEmbed() {
		return new EmbedBuilder()
			.setColor('#00ff00')
			.setTitle(`MLE Application Accepted!`)
			.setFooter({ text: `ID: ${this._userId}` })
			.setTimestamp()
			.setThumbnail(
				'https://cdn.discordapp.com/emojis/1270034202548768868.webp?size=128&quality=lossless'
			)
			.addFields({
				name: 'Congratulations!',
				value:
					'Congratulations! Your application into Minor League Esports has been accepted. ' +
					'Your next step is to do an orientation to join our community in full. ' +
					'You have gained access to orientation channels, head back to the admissions server and wait for an open orientation.'
			});
	}

	generateRejectReasonModal() {
		// Build modal
		const modal = new ModalBuilder()
			.setCustomId('rejectReasonModal')
			.setTitle(`Reject Application: ${this._userName}`);

		const reasonInput = new TextInputBuilder()
			.setCustomId('reason')
			.setLabel('Reason for rejection? (SHOWN TO USER)')
			.setStyle(TextInputStyle.Paragraph);

		const timeInput = new TextInputBuilder()
			.setCustomId('time')
			.setLabel('Time to deny ("None", "1 month", "Permanent")')
			.setStyle(TextInputStyle.Short);

		// Create action rows
		const actionRowOne = new ActionRowBuilder().addComponents(reasonInput);
		const actionRowTwo = new ActionRowBuilder().addComponents(timeInput);

		// Add action rows to modal
		modal.addComponents(actionRowOne, actionRowTwo);

		return modal;
	}

	generateReviewReasonModal() {
		// Build modal
		const modal = new ModalBuilder()
			.setCustomId('reviewReasonModal')
			.setTitle(`Request Review: ${this._userName}`);

		const reasonInput = new TextInputBuilder()
			.setCustomId('reason')
			.setLabel('Reason for review? (SHOWN TO USER)')
			.setStyle(TextInputStyle.Paragraph);

		// Create action rows
		const actionRowOne = new ActionRowBuilder().addComponents(reasonInput);

		// Add action rows to modal
		modal.addComponents(actionRowOne);

		return modal;
	}

	generateRejectUserEmbed(reason, time) {
		return new EmbedBuilder()
			.setColor('#ff0000')
			.setTitle(`MLE Application Rejected`)
			.setFooter({ text: `ID: ${this._userId}` })
			.setTimestamp()
			.setThumbnail(
				'https://cdn.discordapp.com/emojis/1270034202548768868.webp?size=128&quality=lossless'
			)
			.addFields(
				{
					name: 'Your application has been rejected',
					value:
						'Unfortunately, your application into Minor League Esports has been rejected. Rejection reason and ban time (if applicable) shown below.'
				},
				{
					name: 'Rejection Reason',
					value: reason
				},
				{
					name: 'Ban Length',
					value: time
				}
			);
	}
}

module.exports = {
	PendingApplication
};
