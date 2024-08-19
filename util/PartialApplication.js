const log4js = require('log4js');
const logger = log4js.getLogger();
const { logLevel } = require('../config.json');
logger.level = logLevel;

const {
	EmbedBuilder,
	ModalBuilder,
	ActionRowBuilder,
	TextInputBuilder,
	TextInputStyle,
	ButtonBuilder,
	ButtonStyle,
	StringSelectMenuBuilder
} = require('discord.js');

class PartialApplication {
	constructor(user) {
		this._user = user;
		this._status = 'init';
		logger.debug(`Created a new PartialApplication for ${user}`);
	}

	setStatus(status) {
		this._status = status;
	}

	getStatus() {
		return this._status;
	}

	getUser() {
		return this._user;
	}

	setAge(age) {
		this._age = age;
	}

	getAge() {
		return this._age;
	}

	setTwitter(twitter) {
		this._twitter = twitter;
	}

	getTwitter() {
		return this._twitter;
	}

	setNewDiscord(newDiscord) {
		this._newDiscord = newDiscord;
	}

	getNewDiscord() {
		return this._newDiscord;
	}

	setReferral(referral) {
		this._referral = referral;
	}

	getReferral() {
		return this._referral;
	}

	setReferralDetail(referralDetail) {
		this._referralDetail = referralDetail;
	}

	getReferralDetail() {
		return this._referralDetail;
	}

	setLeagues(leagues) {
		this._leagues = leagues;
	}

	getLeagues() {
		return this._leagues;
	}

	setWhyInterested(whyInterested) {
		this._whyInterested = whyInterested;
	}

	getWhyInterested() {
		return this._whyInterested;
	}

	setWhyFit(whyFit) {
		this._whyFit = whyFit;
	}

	getWhyFit() {
		return this._whyFit;
	}

	setWhatToxic(whatToxic) {
		this._whatToxic = whatToxic;
	}

	getWhatToxic() {
		return this._whatToxic;
	}

	setHowReact(howReact) {
		this._howReact = howReact;
	}

	getHowReact() {
		return this._howReact;
	}

	setConfirm(confirm) {
		this._confirm = confirm;
	}

	getConfirm() {
		return this._confirm;
	}

	generateIntroMessage() {
		return new EmbedBuilder()
			.setColor('#00ff00')
			.setTitle(`MLE Application: ${this._user.displayName}`)
			.setFooter({ text: `ID: ${this._user.id}` })
			.setTimestamp()
			.setThumbnail(
				'https://cdn.discordapp.com/emojis/1270034202548768868.webp?size=128&quality=lossless'
			)
			.addFields({
				name: 'Overview',
				value: 'MLE is a non-toxic, inclusive esports community',
				inline: true
			});
	}

	generateAgreeButton() {
		return new ButtonBuilder()
			.setCustomId('applicationAgreeButton')
			.setLabel('I agree')
			.setStyle(ButtonStyle.Success);
	}

	generateYesButton() {
		return new ButtonBuilder()
			.setCustomId('applicationYesButton')
			.setLabel('Yes')
			.setStyle(ButtonStyle.Success);
	}

	generateNoButton() {
		return new ButtonBuilder()
			.setCustomId('applicationNoButton')
			.setLabel('No')
			.setStyle(ButtonStyle.Danger);
	}

	generateAnswerButton() {
		return new ButtonBuilder()
			.setCustomId('applicationAnswerButton')
			.setLabel('Answer')
			.setStyle(ButtonStyle.Primary);
	}

	generateInfoGatheringModal() {
		// Build modal
		const modal = new ModalBuilder()
			.setCustomId('infoGatherModal')
			.setTitle(`MLE Application: ${this._user.displayName}`);

		const userAgeInput = new TextInputBuilder()
			.setCustomId('userAge')
			.setLabel('What is your age?')
			.setStyle(TextInputStyle.Short)
			.setMinLength(1)
			.setMaxLength(3)
			.setPlaceholder('99');

		const userXInput = new TextInputBuilder()
			.setCustomId('userTwitter')
			.setLabel('What is your X/Twitter handle? N/A otherwise')
			.setStyle(TextInputStyle.Short)
			.setMinLength(1)
			.setMaxLength(16)
			.setPlaceholder('@mlesportsgg');

		// Create action rows
		const actionRowOne = new ActionRowBuilder().addComponents(userAgeInput);
		const actionRowTwo = new ActionRowBuilder().addComponents(userXInput);

		// Add action rows to modal
		modal.addComponents(actionRowOne, actionRowTwo);

		return modal;
	}

	generateBannedEmbed() {
		return new EmbedBuilder()
			.setColor('#ff0000')
			.setTitle(`MLE Application: ${this._user.displayName}`)
			.setFooter({ text: `ID: ${this._user.id}` })
			.setTimestamp()
			.setThumbnail(
				'https://cdn.discordapp.com/emojis/1270034202548768868.webp?size=128&quality=lossless'
			)
			.addFields({
				name: 'Banned',
				value: 'You are currently banned from MLE or have had a rejected application.',
				inline: true
			});
	}

	generateUnderageDenyEmbed() {
		return new EmbedBuilder()
			.setColor('#ff0000')
			.setTitle(`MLE Application: ${this._user.displayName}`)
			.setFooter({ text: `ID: ${this._user.id}` })
			.setTimestamp()
			.setThumbnail(
				'https://cdn.discordapp.com/emojis/1270034202548768868.webp?size=128&quality=lossless'
			)
			.addFields({
				name: 'Denied',
				value:
					'Your application to MLE has been denied. Unfortunatley, you are too young to join. Our rules state that you must be 16 years of age or older.',
				inline: true
			});
	}

	generateNewToDiscordEmbed() {
		return new EmbedBuilder()
			.setColor('#00ff00')
			.setTitle(`MLE Application: ${this._user.displayName}`)
			.setFooter({ text: `ID: ${this._user.id}` })
			.setTimestamp()
			.setThumbnail(
				'https://cdn.discordapp.com/emojis/1270034202548768868.webp?size=128&quality=lossless'
			)
			.addFields({
				name: 'Are you new to Discord?',
				value:
					'If you are new to Discord, this will give you access to a space where you can learn how to use it.',
				inline: true
			});
	}

	generateReferralEmbed() {
		return new EmbedBuilder()
			.setColor('#00ff00')
			.setTitle(`MLE Application: ${this._user.displayName}`)
			.setFooter({ text: `ID: ${this._user.id}` })
			.setTimestamp()
			.setThumbnail(
				'https://cdn.discordapp.com/emojis/1270034202548768868.webp?size=128&quality=lossless'
			)
			.addFields({
				name: 'How did you hear about MLE?',
				value: 'Please select one from the dropdown below.',
				inline: true
			});
	}

	generateReferralOptions() {
		const row = new ActionRowBuilder();
		const menuBuilder = new StringSelectMenuBuilder()
			.setCustomId('referralMenu')
			.setPlaceholder('How did you hear about us?')
			.setMaxValues(1)
			.setMinValues(1);

		this.getReferralOptionsMap().forEach(function (value, key) {
			menuBuilder.addOptions({
				label: value,
				value: key
			});
		});

		row.addComponents(menuBuilder);
		return row;
	}

	getReferralOptionsMap() {
		const options = new Map();
		options.set('twitch', 'Twitch Stream (twitch.tv/mlesports.gg');
		options.set('twitter', 'X/Twitter (@mlesportsgg)');
		options.set('website', 'Website (mlesports.gg)');
		options.set('friend', 'Referred by a Friend');
		options.set('other', 'Other');
		// TODO: Add more

		return options;
	}

	generateReferralModal() {
		// Build modal
		const modal = new ModalBuilder()
			.setCustomId('referralDetailModal')
			.setTitle(`MLE Application: ${this._user.displayName}`);

		const referralInput = new TextInputBuilder()
			.setCustomId('referral')
			.setLabel('How did you hear about MLE?')
			.setStyle(TextInputStyle.Short);

		// Create action rows
		const actionRowOne = new ActionRowBuilder().addComponents(referralInput);

		// Add action rows to modal
		modal.addComponents(actionRowOne);

		return modal;
	}

	generateLeagueEmbed() {
		return new EmbedBuilder()
			.setColor('#00ff00')
			.setTitle(`MLE Application: ${this._user.displayName}`)
			.setFooter({ text: `ID: ${this._user.id}` })
			.setTimestamp()
			.setThumbnail(
				'https://cdn.discordapp.com/emojis/1270034202548768868.webp?size=128&quality=lossless'
			)
			.addFields({
				name: 'Which of our leagues do you want to join?',
				value: 'Select as many as you like from the list below.',
				inline: true
			});
	}

	generateLeagueOptions() {
		const row = new ActionRowBuilder();
		const menuBuilder = new StringSelectMenuBuilder()
			.setCustomId('leagueMenu')
			.setPlaceholder('What leagues do you want to join?')
			.setMaxValues(4)
			.setMinValues(1);

		this.getLeagueOptionsMap().forEach(function (value, key) {
			menuBuilder.addOptions({
				label: value,
				value: key
			});
		});

		row.addComponents(menuBuilder);
		return row;
	}

	getLeagueOptionsMap() {
		const options = new Map();
		options.set('rl', 'Rocket League');
		options.set('tm', 'Trackmania');
		options.set('prod', 'Broadcasting/Commentating');
		options.set('comm', 'MLE Community');

		return options;
	}

	generateWhyInterestedEmbed() {
		return new EmbedBuilder()
			.setColor('#00ff00')
			.setTitle(`MLE Application: ${this._user.displayName}`)
			.setFooter({ text: `ID: ${this._user.id}` })
			.setTimestamp()
			.setThumbnail(
				'https://cdn.discordapp.com/emojis/1270034202548768868.webp?size=128&quality=lossless'
			)
			.addFields({
				name: 'Why are you interested in being part of the MLE community?',
				value: 'Please explain in detail in what made you interested in applying to MLE.',
				inline: true
			});
	}

	generateWhyInterestedModal() {
		// Build modal
		const modal = new ModalBuilder()
			.setCustomId('whyInterestedModal')
			.setTitle(`MLE Application: ${this._user.displayName}`);

		const textInput = new TextInputBuilder()
			.setCustomId('text')
			.setLabel('Why do you want to join MLE?')
			.setStyle(TextInputStyle.Paragraph);

		// Create action rows
		const actionRowOne = new ActionRowBuilder().addComponents(textInput);

		// Add action rows to modal
		modal.addComponents(actionRowOne);

		return modal;
	}

	generateWhyFitEmbed() {
		return new EmbedBuilder()
			.setColor('#00ff00')
			.setTitle(`MLE Application: ${this._user.displayName}`)
			.setFooter({ text: `ID: ${this._user.id}` })
			.setTimestamp()
			.setThumbnail(
				'https://cdn.discordapp.com/emojis/1270034202548768868.webp?size=128&quality=lossless'
			)
			.addFields({
				name: 'Why do you think you would be a good fit for our community?',
				value: 'Please explain in detail in what ways you are a good fit for our community.',
				inline: true
			});
	}

	generateWhyFitModal() {
		// Build modal
		const modal = new ModalBuilder()
			.setCustomId('whyFitModal')
			.setTitle(`MLE Application: ${this._user.displayName}`);

		const textInput = new TextInputBuilder()
			.setCustomId('text')
			.setLabel('Why are you a good fit for MLE?')
			.setStyle(TextInputStyle.Paragraph);

		// Create action rows
		const actionRowOne = new ActionRowBuilder().addComponents(textInput);

		// Add action rows to modal
		modal.addComponents(actionRowOne);

		return modal;
	}

	generateWhatToxicEmbed() {
		return new EmbedBuilder()
			.setColor('#00ff00')
			.setTitle(`MLE Application: ${this._user.displayName}`)
			.setFooter({ text: `ID: ${this._user.id}` })
			.setTimestamp()
			.setThumbnail(
				'https://cdn.discordapp.com/emojis/1270034202548768868.webp?size=128&quality=lossless'
			)
			.addFields({
				name: 'What do you consider toxic behavior within a community?',
				value: 'Please provide examples of what you would consider toxic behavior.',
				inline: true
			});
	}

	generateWhatToxicModal() {
		// Build modal
		const modal = new ModalBuilder()
			.setCustomId('whatToxicModal')
			.setTitle(`MLE Application: ${this._user.displayName}`);

		const textInput = new TextInputBuilder()
			.setCustomId('text')
			.setLabel('What does toxic behavior look like?')
			.setStyle(TextInputStyle.Paragraph);

		// Create action rows
		const actionRowOne = new ActionRowBuilder().addComponents(textInput);

		// Add action rows to modal
		modal.addComponents(actionRowOne);

		return modal;
	}

	generateHowReactEmbed() {
		return new EmbedBuilder()
			.setColor('#00ff00')
			.setTitle(`MLE Application: ${this._user.displayName}`)
			.setFooter({ text: `ID: ${this._user.id}` })
			.setTimestamp()
			.setThumbnail(
				'https://cdn.discordapp.com/emojis/1270034202548768868.webp?size=128&quality=lossless'
			)
			.addFields({
				name: 'How would you react if a person becomes aggressive/angry/toxic with you? ',
				value: 'Please explain in detail how you would react.',
				inline: true
			});
	}

	generateHowReactModal() {
		// Build modal
		const modal = new ModalBuilder()
			.setCustomId('howReactModal')
			.setTitle(`MLE Application: ${this._user.displayName}`);

		const textInput = new TextInputBuilder()
			.setCustomId('text')
			.setLabel('How would you react to toxicity?')
			.setStyle(TextInputStyle.Paragraph);

		// Create action rows
		const actionRowOne = new ActionRowBuilder().addComponents(textInput);

		// Add action rows to modal
		modal.addComponents(actionRowOne);

		return modal;
	}

	generateFinalConfirmationEmbed() {
		let embed = new EmbedBuilder()
			.setColor('#00ff00')
			.setTitle(`MLE Application: ${this._user.displayName}`)
			.setFooter({ text: `ID: ${this._user.id}` })
			.setTimestamp()
			.setThumbnail(
				'https://cdn.discordapp.com/emojis/1270034202548768868.webp?size=128&quality=lossless'
			)
			.addFields({
				name: 'Final check',
				value:
					'Is the information below accurate? Selecting "no" will restart the application process.'
			});

		embed = this.addApplicationFields(embed);
		return embed;
	}

	addApplicationFields(embed) {
		embed.addFields(
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
			}
		);

		if (this._referralDetail !== undefined) {
			embed.addFields({
				name: 'How did you hear about MLE?',
				value: `${this._referral}: ${this._referralDetail}`
			});
		} else {
			embed.addFields({
				name: 'How did you hear about MLE?',
				value: this._referral
			});
		}

		embed.addFields(
			{
				name: 'What parts of MLE are you interested in?',
				value: this.convertLeagues()
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

	generateAppSubmissionEmbed() {
		let embed = new EmbedBuilder()
			.setColor('#00ff00')
			.setTitle(`New MLE Application: ${this._user.displayName}`)
			.setFooter({ text: `ID: ${this._user.id}` })
			.setTimestamp()
			.setThumbnail(this._user.displayAvatarURL());

		embed = this.addApplicationFields(embed);
		return embed;
	}

	generateAcceptButton() {
		return new ButtonBuilder()
			.setCustomId('applicationAcceptButton')
			.setLabel('Accept')
			.setStyle(ButtonStyle.Success);
	}

	generateRejectButton() {
		return new ButtonBuilder()
			.setCustomId('applicationRejectButton')
			.setLabel('Reject')
			.setStyle(ButtonStyle.Danger);
	}

	generateReviewButton() {
		return new ButtonBuilder()
			.setCustomId('applicationReviewButton')
			.setLabel('Request Review')
			.setStyle(ButtonStyle.Primary);
	}

	convertLeagues() {
		return this._leagues
			.toString()
			.replace('rl', 'Rocket League')
			.replace('tm', 'Trackmania')
			.replace('prod', 'Broadcasting/Commentating')
			.replace('comm', 'MLE Community');
	}

	// Returns an array of ActionRowBuilders, populated with the contents of the given components
	// Intended for buttons!
	buildActionRows(...components) {
		if (components.length > 25) {
			throw new Error('Too many components!');
		}

		let rows = [];
		for (let i = 0; i < components.length; i++) {
			let row;
			if (i % 5 === 0) {
				row = new ActionRowBuilder();
			} else {
				row = rows[rows.length - 1];
			}
			row.addComponents(components[i]);
			rows[i / 5] = row;
		}
		return rows;
	}
}

module.exports = {
	PartialApplication
};
