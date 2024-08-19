const {
	rlOriRole,
	tmOriRole,
	prodOriRole,
	commOriRole,
	logChannelId,
	acceptedAppsChannelId,
	rejectedAppsChannelId,
	appLogChannelId
} = require('../config.json');
const { BanManager } = require('./BanManager');

class PendingApplicationManager {
	static async acceptApplication(applicant, application) {
		const leagues = application.getLeagues().split(',');
		leagues.forEach(async function (league) {
			if (league === 'Rocket League') {
				await applicant.roles.add(rlOriRole);
			} else if (league === 'Trackmania') {
				await applicant.roles.add(tmOriRole);
			} else if (league === 'Broadcasting/Commentating') {
				await applicant.roles.add(prodOriRole);
			} else if (league === 'MLE Community') {
				await applicant.roles.add(commOriRole);
			}
		});

		const acceptChannel = await applicant.client.channels.fetch(acceptedAppsChannelId);
		await acceptChannel.send({ embeds: [application.generateApplicationAcceptEmbed()] });
		const appLogChannel = await applicant.client.channels.fetch(appLogChannelId);
		await appLogChannel.send(
			`Application for \`${application.getUserName()} (${application.getUserId()})\` accepted by ${
				application.getAgent().displayName
			}`
		);
		await applicant.send({ embeds: [application.generateWelcomeEmbed()] });
	}

	static async rejectApplication(applicant, application, reason, dateString, dateParsed) {
		const logChannel = await applicant.client.channels.fetch(logChannelId);
		const banManager = new BanManager(logChannel);
		banManager.addOtherBan(application.getUserName(), application.getUserId(), dateParsed, reason);

		const rejectChannel = await applicant.client.channels.fetch(rejectedAppsChannelId);
		await rejectChannel.send({
			embeds: [application.generateApplicationRejectEmbed(reason, dateString)]
		});
		const appLogChannel = await applicant.client.channels.fetch(appLogChannelId);
		await appLogChannel.send(
			`Application for \`${application.getUserName()} (${application.getUserId()})\` rejected by ${
				application.getAgent().displayName
			}`
		);
		await applicant.send({ embeds: [application.generateRejectUserEmbed(reason, dateString)] });
	}
}

module.exports = {
	PendingApplicationManager
};
