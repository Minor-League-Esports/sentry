const {
	logChannelId,
	pendingAppsChannelId,
	admissionsGuildId,
	newDiscordRole,
	rlOriRole,
	tmOriRole,
	prodOriRole,
	commOriRole
} = require('../config.json');
const { PartialApplication } = require('./PartialApplication.js');
const { DiscordLogger } = require('./DiscordLogger.js');
const { BanManager } = require('./BanManager');

class PartialApplicationManager {
	static _applications = new Map();

	static getApplication(userId) {
		return this._applications.get(userId);
	}

	static setApplication(userId, application) {
		this._applications.set(userId, application);
	}

	static async beginApplication(userId, application) {
		const logChannel = await application.getUser().client.channels.fetch(logChannelId);
		const banManager = new BanManager(logChannel);
		const isBanned = await banManager.isUserBanned(application.getUser().displayName, userId);
		if (isBanned) {
			return await application.getUser().send({
				embeds: [application.generateBannedEmbed()]
			});
		} else {
			this.setApplication(userId, application);
			application.setStatus('begin');
			return await application.getUser().send({
				embeds: [application.generateIntroMessage()],
				components: application.buildActionRows(application.generateAgreeButton())
			});
		}
	}

	static async advanceApplication(interaction, application) {
		switch (application.getStatus()) {
			case 'begin':
				return this.beginInfoGathering(interaction, application);
			case 'gatherInfo':
				return this.sendNewDiscord(interaction, application);
			case 'newToDiscord':
				return this.sendReferral(interaction, application);
			case 'getReferral':
				return this.processReferral(interaction, application);
			case 'detailReferral':
				return this.sendLeagues(interaction, application);
			case 'getLeagues':
				return this.sendWhyInterestedEmbed(interaction, application);
			case 'whyInterested':
				return this.sendWhyInterestedModal(interaction, application);
			case 'whyInterestedModal':
				return this.sendWhyFitEmbed(interaction, application);
			case 'whyFit':
				return this.sendWhyFitModal(interaction, application);
			case 'whyFitModal':
				return this.sendWhatToxicEmbed(interaction, application);
			case 'whatToxic':
				return this.sendWhatToxicModal(interaction, application);
			case 'whatToxicModal':
				return this.sendHowReactEmbed(interaction, application);
			case 'howReact':
				return this.sendHowReactModal(interaction, application);
			case 'howReactModal':
				return this.sendFinalConfirmation(interaction, application);
			case 'final':
				return this.finalizeApplication(interaction, application);
		}
	}

	static async beginInfoGathering(interaction, application) {
		application.setStatus('gatherInfo');
		return await interaction.showModal(application.generateInfoGatheringModal());
	}

	static async sendNewDiscord(interaction, application) {
		if (application.getAge() < 16) {
			const banManager = new BanManager();
			await banManager.addUnderageBan(
				application.getUser().displayName,
				application.getUser().id,
				application.getAge()
			);
			return await this.denyUnderage(interaction, application);
		}
		application.setStatus('newToDiscord');
		return await interaction.reply({
			embeds: [application.generateNewToDiscordEmbed()],
			components: application.buildActionRows(
				application.generateYesButton(),
				application.generateNoButton()
			)
		});
	}

	static async sendReferral(interaction, application) {
		application.setStatus('getReferral');
		return await interaction.reply({
			embeds: [application.generateReferralEmbed()],
			components: [application.generateReferralOptions()]
		});
	}

	static async processReferral(interaction, application) {
		if (application.getReferral() === 'friend' || application.getReferral() === 'other') {
			application.setStatus('detailReferral');
			return await interaction.showModal(application.generateReferralModal());
		} else {
			this.sendLeagues(interaction, application);
		}
	}

	static async sendLeagues(interaction, application) {
		application.setStatus('getLeagues');
		return await interaction.reply({
			embeds: [application.generateLeagueEmbed()],
			components: [application.generateLeagueOptions()]
		});
	}

	static async sendWhyInterestedEmbed(interaction, application) {
		application.setStatus('whyInterested');
		return await interaction.reply({
			embeds: [application.generateWhyInterestedEmbed()],
			components: application.buildActionRows(application.generateAnswerButton())
		});
	}

	static async sendWhyInterestedModal(interaction, application) {
		application.setStatus('whyInterestedModal');
		return await interaction.showModal(application.generateWhyInterestedModal());
	}

	static async sendWhyFitEmbed(interaction, application) {
		application.setStatus('whyFit');
		return await interaction.reply({
			embeds: [application.generateWhyFitEmbed()],
			components: application.buildActionRows(application.generateAnswerButton())
		});
	}

	static async sendWhyFitModal(interaction, application) {
		application.setStatus('whyFitModal');
		return await interaction.showModal(application.generateWhyFitModal());
	}

	static async sendWhatToxicEmbed(interaction, application) {
		application.setStatus('whatToxic');
		return await interaction.reply({
			embeds: [application.generateWhatToxicEmbed()],
			components: application.buildActionRows(application.generateAnswerButton())
		});
	}

	static async sendWhatToxicModal(interaction, application) {
		application.setStatus('whatToxicModal');
		return await interaction.showModal(application.generateWhatToxicModal());
	}

	static async sendHowReactEmbed(interaction, application) {
		application.setStatus('howReact');
		return await interaction.reply({
			embeds: [application.generateHowReactEmbed()],
			components: application.buildActionRows(application.generateAnswerButton())
		});
	}

	static async sendHowReactModal(interaction, application) {
		application.setStatus('howReactModal');
		return await interaction.showModal(application.generateHowReactModal());
	}

	static async sendFinalConfirmation(interaction, application) {
		application.setStatus('final');
		return await interaction.reply({
			embeds: [application.generateFinalConfirmationEmbed()],
			components: application.buildActionRows(
				application.generateYesButton(),
				application.generateNoButton()
			)
		});
	}

	static async finalizeApplication(interaction, application) {
		if (!application.getConfirm()) {
			const newApp = new PartialApplication(application.getUser());
			await interaction.reply('This application has been discarded. Starting a new one...');
			return await this.beginApplication(application.getUser().id, newApp);
		}
		const appChannel = await interaction.client.channels.fetch(pendingAppsChannelId);
		await appChannel.send({
			embeds: [application.generateAppSubmissionEmbed()],
			components: application.buildActionRows(
				application.generateAcceptButton(),
				application.generateRejectButton(),
				application.generateReviewButton()
			)
		});

		await interaction.reply(
			'Your application has been submitted! You will recieve further information once it has been reviewed by our admissions staff.'
		);
		this._applications.delete(application.getUser().id);

		if (application.getNewDiscord() === 'Yes') {
			const admissionsGuild = await interaction.client.guilds.fetch(admissionsGuildId);
			const guildMember = await admissionsGuild.members
				.fetch(application.getUser().id)
				.then(async function (member) {
					await member.roles
						.add(newDiscordRole)
						.then(async function () {
							await interaction.followUp(
								'Your Discord 101 role has been applied! Go back to the server for a tutorial on how to use discord.'
							);
						})
						.catch(async function (error) {
							if (error.code === 50001) {
								console.error(error);
								const logChannel = await interaction.client.channels.fetch(logChannelId);
								const logger = new Logger(logChannel);
								logger.logMessage('Bot is missing manage role permissions!');
							} else {
								console.error(error);
							}
						});
				})
				.catch(function (error) {
					console.error(error);
				});
		}
	}

	static async denyUnderage(interaction, application) {
		application.setStatus('deniedUnderage');
		await interaction.editReply({ embeds: [application.generateUnderageDenyEmbed()] });
	}
}

module.exports = {
	PartialApplicationManager
};
