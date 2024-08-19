const https = require('https');
const { banSpreadsheetId, banSheetName, googleAPIKey } = require('../config.json');
const { DiscordLogger } = require('./DiscordLogger.js');

class BanManager {
	constructor(logChannel) {
		this._logChannel = logChannel;
	}

	async isUserBanned(userName, userId) {
		let isBanned = false;
		await this.getAllBans()
			.then(function (bans) {
				const allBans = JSON.parse(bans)['values'];
				allBans.forEach(function (ban) {
					const bannedName = ban[0];
					const bannedId = ban[1];
					// console.log(`Ban! Name: ${bannedName} ID: ${bannedId}`);
					if (userName === bannedName || userId === bannedId) {
						isBanned = true;
						return;
					}
				});
			})
			.catch((error) => {
				const logger = new DiscordLogger(this._logChannel);
				logger.logMessage('Encountered an error fetching bans!');
				logger.logMessage(`Error: \n\`\`\`\n${error}\n\`\`\``);
			});

		return isBanned;
	}

	async getAllBans() {
		const options = {
			hostname: 'sheets.googleapis.com',
			path: `/v4/spreadsheets/${banSpreadsheetId}/values/'${encodeURIComponent(
				banSheetName
			)}'!A1:B?key=${googleAPIKey}`
		};
		return new Promise(function (resolve, reject) {
			https.get(options, function (res) {
				let content = '';
				res.on('data', function (chunk) {
					content += chunk;
				});

				res.on('end', function () {
					resolve(content);
				});

				res.on('error', function (error) {
					console.error(error);
					reject(error);
				});
			});
		});
	}

	async addUnderageBan(userName, userId, age) {}

	async addOtherBan(userName, userId, length, reason) {}
}

module.exports = {
	BanManager
};
