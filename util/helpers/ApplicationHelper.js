const log4js = require('log4js');
const logger = log4js.getLogger('ApplicationHelper');
const { logLevel } = require('../../config.json');
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
		await this.setValues(interaction);
		const nextStage = this.getNextStage();
		logger.debug(nextStage);
		if (nextStage['type'] === 'modal') {
			await interaction.showModal(nextStage['modal']);
		} else if (nextStage['type'] === 'embed') {
			if (nextStage['buttons']) {
				await interaction.reply({
					embeds: [nextStage['embed']],
					components: nextStage['buttons']
				});
			} else {
				await interaction.reply({
					embeds: [nextStage['embed']]
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
		}
	}

	/**
	 * Gets the modal/embed/buttons/selector for the next stage of the application
	 * @returns
	 */
	getNextStage() {
		if (
			this.getApplication().getAge() === -1 ||
			this.getApplication().getTwitter() === 'Not answered'
		) {
			return {
				type: 'modal',
				modal: this.generateInfoGatheringModal()
			};
		}

		if (this.getApplication().getAge() < 16) {
			const banManager = new BanManager();
			banManager.addUnderageBan(
				application.getUser().displayName,
				application.getUser().id,
				application.getAge()
			);

			return {
				type: 'embed',
				embed: this.generateUnderageDenyEmbed()
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
					value: '[the statement]'
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
			applyTime = `${years} year${years === 1 ? '' : 's'}`;
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
}

module.exports = {
	ApplicationHelper
};
