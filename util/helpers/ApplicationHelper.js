const log4js = require('log4js');
const logger = log4js.getLogger('ApplicationHelper');
const { logLevel, channels } = require('../../config.json');
logger.level = logLevel;

const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	TextInputStyle,
	TextInputBuilder,
	ModalBuilder
} = require('discord.js');
const { MLEApplication } = require('../objects/MLEApplication');
const { BanManager } = require('../BanManager');
const { buildActionRows } = require('../utils');
const { StringSelectMenuBuilder } = require('discord.js');
const appChannelId = channels['pendingAppsChannelId'];

class ApplicationHelper {
	/**
	 *
	 * @param {MLEApplication} application
	 */
	constructor(application) {
		this._application = application;
	}

	/**
	 *
	 * @returns {MLEApplication} The application
	 */
	getApplication() {
		return this._application;
	}

	async handleInteraction(interaction) {
		const nextStage = this.getNextStage();
		logger.debug(nextStage);
		if (nextStage['name'] === 'submitted') {
			const appChannel = await interaction.client.channels.fetch(appChannelId);
			const appEmbed = this.getApplication()
				.toString()
				.setTitle(`New application! ${this.getApplication().getUsername()}`)
				.setThumbnail(this.getApplication().getUserAvatar());
			const buttons = buildActionRows(
				this.generateAcceptButton(),
				this.generateRejectButton(),
				this.generateReviewButton()
			);
			await appChannel.send({ embeds: [appEmbed], components: buttons });
		}
		if (nextStage['type'] === 'modal') {
			await interaction.showModal(nextStage['modal']);
		} else if (nextStage['type'] === 'embed') {
			if (nextStage['components']) {
				await interaction.reply({
					embeds: nextStage['embed'],
					components: nextStage['components']
				});
			} else {
				await interaction.reply({
					embeds: nextStage['embed']
				});
			}
		}
	}

	/**
	 * Sets the values of the application from the interaction
	 * @param {*} interaction
	 * @returns {MLEApplication} The updated application
	 */
	updateApplication(interaction) {
		const interactionId = interaction.customId;
		if (interactionId === 'applicationAgreeButton') {
			this.getApplication().setAgree(true);
		} else if (interactionId === 'infoGatherModal') {
			const ageString = interaction.fields.getTextInputValue('userAge');
			const age = parseInt(ageString);
			if (isNaN(age)) {
				throw new Error('Age is not a number!');
			}

			const twitter = interaction.fields.getTextInputValue('userTwitter');

			this.getApplication().setAge(age);
			this.getApplication().setTwitter(twitter);
		} else if (this.getNextStage()['name'] === 'newDiscord') {
			if (interactionId === 'applicationYesButton') {
				this.getApplication().setNewDiscord(true);
			} else if (interactionId === 'applicationNoButton') {
				this.getApplication().setNewDiscord(false);
			}
		} else if (interactionId === 'referralMenu') {
			const referralType = interaction.values[0];
			this.getApplication().setReferral(referralType);
		} else if (interactionId === 'referralDetailModal') {
			const referralDetail = interaction.fields.getTextInputValue('referral');
			const existingReferral = this.getApplication().getReferral();
			this.getApplication().setReferral(existingReferral + ': ' + referralDetail);
		} else if (interactionId === 'leagueMenu') {
			const leagues = interaction.values;
			this.getApplication().setLeagues(leagues.toString());
		} else if (interactionId === 'applicationAnswerButton') {
			const nextName = this.getNextStage()['name'];
			if (nextName === 'whyInterestedEmbed') {
				this.getApplication().setWhyInterested('pending');
			} else if (nextName === 'whyFitEmbed') {
				this.getApplication().setWhyFit('pending');
			} else if (nextName === 'whatToxicEmbed') {
				this.getApplication().setWhatToxic('pending');
			} else if (nextName === 'howReactEmbed') {
				this.getApplication().setHowReact('pending');
			}
		} else if (interactionId === 'whyInterestedModal') {
			const response = interaction.fields.getTextInputValue('text');
			this.getApplication().setWhyInterested(response);
		} else if (interactionId === 'whyFitModal') {
			const response = interaction.fields.getTextInputValue('text');
			this.getApplication().setWhyFit(response);
		} else if (interactionId === 'whatToxicModal') {
			const response = interaction.fields.getTextInputValue('text');
			this.getApplication().setWhatToxic(response);
		} else if (interactionId === 'howReactModal') {
			const response = interaction.fields.getTextInputValue('text');
			this.getApplication().setHowReact(response);
		} else if (interactionId === 'applicationYesButton') {
			this.getApplication().setStatus('submitted');
			this.getApplication().setSubmitTimestamp(Date.now());
		} else if (interactionId === 'applicationNoButton') {
			this._application = new MLEApplication(
				this.getApplication().getUserId(),
				this.getApplication().getUsername(),
				this.getApplication().getUserAvatar()
			);
		}

		return this.getApplication();
	}

	/**
	 * Gets the modal/embed/buttons/selector for the next stage of the application
	 * @returns
	 */
	getNextStage() {
		logger.debug(`Agree: ${this.getApplication().getAgree()}`);
		if (!this.getApplication().getAgree()) {
			return {
				name: 'startApp',
				type: 'embed',
				embed: [this.generateStartApplicationEmbed()],
				components: buildActionRows(this.generateAgreeButton())
			};
		}
		if (
			this.getApplication().getAge() === -1 ||
			this.getApplication().getTwitter() === 'Not answered'
		) {
			return {
				name: 'gatherInfo',
				type: 'modal',
				modal: this.generateInfoGatheringModal()
			};
		}

		if (this.getApplication().getAge() < 16) {
			const banManager = new BanManager();
			banManager.addUnderageBan(
				this.getApplication().getUsername(),
				this.getApplication().getUserId(),
				this.getApplication().getAge()
			);

			return {
				name: 'underageBan',
				type: 'embed',
				embed: [this.generateUnderageDenyEmbed()]
			};
		}

		if (this.getApplication().getNewDiscord() === 'Not answered') {
			return {
				name: 'newDiscord',
				type: 'embed',
				embed: [this.generateNewToDiscordEmbed()],
				components: buildActionRows(this.generateYesButton(), this.generateNoButton())
			};
		}

		if (this.getApplication().getReferral() === 'Not answered') {
			return {
				name: 'referralOptions',
				type: 'embed',
				embed: [this.generateReferralEmbed()],
				components: [this.generateReferralOptions()]
			};
		}

		if (
			this.getApplication().getReferral() === 'friend' ||
			this.getApplication().getReferral() === 'other'
		) {
			return {
				name: 'getReferralDetail',
				type: 'modal',
				modal: this.generateReferralModal()
			};
		}

		if (this.getApplication().getLeagues() === 'Not answered') {
			return {
				name: 'leagueOptions',
				type: 'embed',
				embed: [this.generateLeagueEmbed()],
				components: [this.generateLeagueOptions()]
			};
		}

		if (this.getApplication().getWhyInterested() === 'Not answered') {
			return {
				name: 'whyInterestedEmbed',
				type: 'embed',
				embed: [this.generateWhyInterestedEmbed()],
				components: buildActionRows(this.generateAnswerButton())
			};
		}

		if (this.getApplication().getWhyInterested() === 'pending') {
			return {
				name: 'whyInterestedModal',
				type: 'modal',
				modal: this.generateWhyInterestedModal()
			};
		}

		if (this.getApplication().getWhyFit() === 'Not answered') {
			return {
				name: 'whyFitEmbed',
				type: 'embed',
				embed: [this.generateWhyFitEmbed()],
				components: buildActionRows(this.generateAnswerButton())
			};
		}

		if (this.getApplication().getWhyFit() === 'pending') {
			return {
				name: 'whyFitModal',
				type: 'modal',
				modal: this.generateWhyFitModal()
			};
		}

		if (this.getApplication().getWhatToxic() === 'Not answered') {
			return {
				name: 'whatToxicEmbed',
				type: 'embed',
				embed: [this.generateWhatToxicEmbed()],
				components: buildActionRows(this.generateAnswerButton())
			};
		}

		if (this.getApplication().getWhatToxic() === 'pending') {
			return {
				name: 'whatToxicModal',
				type: 'modal',
				modal: this.generateWhatToxicModal()
			};
		}

		if (this.getApplication().getHowReact() === 'Not answered') {
			return {
				name: 'howReactEmbed',
				type: 'embed',
				embed: [this.generateHowReactEmbed()],
				components: buildActionRows(this.generateAnswerButton())
			};
		}

		if (this.getApplication().getHowReact() === 'pending') {
			return {
				name: 'howReactModal',
				type: 'modal',
				modal: this.generateHowReactModal()
			};
		}

		if (this.getApplication().getStatus() === 'partial') {
			return {
				name: 'confirmation',
				type: 'embed',
				embed: [this.generateFinalConfirmationEmbed(), this.getApplication().toString()],
				components: buildActionRows(this.generateYesButton(), this.generateNoButton())
			};
		}

		if (this.getApplication().getStatus() === 'submitted') {
			logger.debug(this.generateSubmittedEmbed());
			return {
				name: 'submitted',
				type: 'embed',
				embed: [this.generateSubmittedEmbed()]
			};
		}
	}

	generateStartApplicationMessage() {
		return {
			embeds: [this.generateStartApplicationEmbed()],
			components: buildActionRows(this.generateAgreeButton())
		};
	}

	generateStartApplicationEmbed() {
		return new EmbedBuilder()
			.setColor('#00ff00')
			.setTitle(`MLE Application: ${this.getApplication().getUsername()}`)
			.setFooter({ text: `ID: ${this.getApplication().getUserId()}` })
			.setTimestamp(this.getApplication().getStartTimestamp())
			.setThumbnail(
				'https://cdn.discordapp.com/emojis/1270034202548768868.webp?size=128&quality=lossless'
			)
			.addFields(
				{
					name: 'Welcome to MLE Admissions!',
					value:
						'Congratulations on starting the first step to joining Minor League Esports! ' +
						'MLE prides itself on being an inclusive and non-toxic community first and foremost. ' +
						'We encourage everyone to have fun, whether it be through league play, community events, or just chatting with other members. ' +
						'Before we let you into our community, your application will be reviewed by our admissions agents. ' +
						'We do this to ensure MLE stays as a safe space for all of our members. '
				},
				{
					name: 'A statement from MLE Moderation',
					value:
						'MLE and its moderators strongly believe in elevating our community above the standard of behavior that can unfortunately ' +
						'sometimes be associated with competitive gaming. We have a zero tolerance policy for bigotry or any form of toxicity, ' +
						'harassment, or disrespectful behavior. We encourage community members to become familiar with our ' +
						'Moderation Guidelines and Community Handbook for a more detailed look at our rules and standards.'
				},
				{
					name: 'Confirmation',
					value:
						'By continuing this application, you agree that your participation in MLE is an "at will" membership ' +
						'and can be voided at any time for any reason if the MLE Moderation team deems it necessary. Click the "I agree" ' +
						'button below to continue the application.'
				}
			);
	}

	generateAgreeButton() {
		return new ButtonBuilder()
			.setCustomId('applicationAgreeButton')
			.setLabel('I agree')
			.setStyle(ButtonStyle.Success);
	}

	generateInfoGatheringModal() {
		// Build modal
		const modal = new ModalBuilder()
			.setCustomId('infoGatherModal')
			.setTitle(`MLE Application: ${this.getApplication().getUsername()}`);

		const userAgeInput = new TextInputBuilder()
			.setCustomId('userAge')
			.setLabel('What is your age?')
			.setStyle(TextInputStyle.Short)
			.setMinLength(1)
			.setMaxLength(3)
			.setPlaceholder('99');

		if (this.getApplication().getAge() !== -1) {
			userAgeInput.setValue(this.getApplication().getAge().toString());
		}

		const userXInput = new TextInputBuilder()
			.setCustomId('userTwitter')
			.setLabel('What is your X/Twitter handle? N/A otherwise')
			.setStyle(TextInputStyle.Short)
			.setMinLength(1)
			.setMaxLength(16)
			.setPlaceholder('@mlesportsgg');

		if (this.getApplication().getTwitter() !== 'Not answered') {
			userAgeInput.setValue(this.getApplication().getTwitter());
		}

		// Create action rows
		const actionRowOne = new ActionRowBuilder().addComponents(userAgeInput);
		const actionRowTwo = new ActionRowBuilder().addComponents(userXInput);

		// Add action rows to modal
		modal.addComponents(actionRowOne, actionRowTwo);

		return modal;
	}

	generateUnderageDenyEmbed() {
		let applyTime;
		if (this.getApplication().getAge() === 15) {
			applyTime = '6 months';
		} else {
			const years = 16 - this.getApplication().getAge() - 1;
			applyTime = `${years} year${years === 1 ? '' : 's'} and 6 months`;
		}
		return new EmbedBuilder()
			.setColor('#ff0000')
			.setTitle(`MLE Application: ${this.getApplication().getUsername()}`)
			.setFooter({ text: `ID: ${this.getApplication().getUserId()}` })
			.setTimestamp()
			.setThumbnail(
				'https://cdn.discordapp.com/emojis/1270034202548768868.webp?size=128&quality=lossless'
			)
			.addFields({
				name: 'Denied',
				value:
					'Your application to MLE has been denied. Unfortunatley, you are too young to join. ' +
					'Our rules state that you must be 16 years of age or older. You may apply again in ' +
					applyTime,
				inline: true
			});
	}

	generateNewToDiscordEmbed() {
		return new EmbedBuilder()
			.setColor('#00ff00')
			.setTitle(`MLE Application: ${this.getApplication().getUsername()}`)
			.setFooter({ text: `ID: ${this.getApplication().getUserId()}` })
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

	generateReferralEmbed() {
		return new EmbedBuilder()
			.setColor('#00ff00')
			.setTitle(`MLE Application: ${this.getApplication().getUsername()}`)
			.setFooter({ text: `ID: ${this.getApplication().getUserId()}` })
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
			.setTitle(`MLE Application: ${this.getApplication().getUsername()}`);

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
			.setTitle(`MLE Application: ${this.getApplication().getUsername()}`)
			.setFooter({ text: `ID: ${this.getApplication().getUserId()}` })
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
			.setTitle(`MLE Application: ${this.getApplication().getUsername()}`)
			.setFooter({ text: `ID: ${this.getApplication().getUserId()}` })
			.setTimestamp()
			.setThumbnail(
				'https://cdn.discordapp.com/emojis/1270034202548768868.webp?size=128&quality=lossless'
			)
			.setDescription('Why are you interested in being part of the MLE community?');
	}

	generateWhyInterestedModal() {
		// Build modal
		const modal = new ModalBuilder()
			.setCustomId('whyInterestedModal')
			.setTitle(`MLE Application: ${this.getApplication().getUsername()}`);

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
			.setTitle(`MLE Application: ${this.getApplication().getUsername()}`)
			.setFooter({ text: `ID: ${this.getApplication().getUserId()}` })
			.setTimestamp()
			.setThumbnail(
				'https://cdn.discordapp.com/emojis/1270034202548768868.webp?size=128&quality=lossless'
			)
			.setDescription('Why do you think you would be a good fit for our community?');
	}

	generateWhyFitModal() {
		// Build modal
		const modal = new ModalBuilder()
			.setCustomId('whyFitModal')
			.setTitle(`MLE Application: ${this.getApplication().getUsername()}`);

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
			.setTitle(`MLE Application: ${this.getApplication().getUsername()}`)
			.setFooter({ text: `ID: ${this.getApplication().getUserId()}` })
			.setTimestamp()
			.setThumbnail(
				'https://cdn.discordapp.com/emojis/1270034202548768868.webp?size=128&quality=lossless'
			)
			.setDescription('What do you consider toxic behavior within a community?');
	}

	generateWhatToxicModal() {
		// Build modal
		const modal = new ModalBuilder()
			.setCustomId('whatToxicModal')
			.setTitle(`MLE Application: ${this.getApplication().getUsername()}`);

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
			.setTitle(`MLE Application: ${this.getApplication().getUsername()}`)
			.setFooter({ text: `ID: ${this.getApplication().getUserId()}` })
			.setTimestamp()
			.setThumbnail(
				'https://cdn.discordapp.com/emojis/1270034202548768868.webp?size=128&quality=lossless'
			)
			.setDescription('How would you react if a person becomes aggressive/angry/toxic with you?');
	}

	generateHowReactModal() {
		// Build modal
		const modal = new ModalBuilder()
			.setCustomId('howReactModal')
			.setTitle(`MLE Application: ${this.getApplication().getUsername()}`);

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

	generateAnswerButton() {
		return new ButtonBuilder()
			.setCustomId('applicationAnswerButton')
			.setLabel('Answer')
			.setStyle(ButtonStyle.Primary);
	}

	generateFinalConfirmationEmbed() {
		return new EmbedBuilder()
			.setColor('#ffff00')
			.setTitle(`FINAL CHECK!`)
			.setFooter({ text: `ID: ${this.getApplication().getUserId()}` })
			.setTimestamp()
			.setThumbnail(this.getApplication().getUserAvatar())
			.setDescription(
				'Is the information below accurate? Selecting "yes" will submit your application, selecting "no" will restart it.'
			);
	}

	generateSubmittedEmbed() {
		return new EmbedBuilder()
			.setColor('#00ff00')
			.setTitle(`App Complete: ${this.getApplication().getUsername()}`)
			.setFooter({ text: `ID: ${this.getApplication().getUserId()}` })
			.setTimestamp()
			.setThumbnail(this.getApplication().getUserAvatar())
			.setDescription(
				'Your application has been submitted to admissions agents for review. You will recieve a followup message once your application has been reviewed.'
			)
			.addFields({
				name: 'While you wait',
				value:
					'Please review our [community guidelines](https://mlesports.gg/mod-guide) to be prepared for orientation.'
			});
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
}

module.exports = {
	ApplicationHelper
};
