const log4js = require('log4js');
const logger = log4js.getLogger('ApplyCommand');
const { logLevel, channels } = require('../config.json');
logger.level = logLevel;

const { DiscordLogger } = require('./DiscordLogger');
const logChannel = channels['logChannelId'];

const https = require('https');
const { banSpreadsheetId, banSheetName, googleAPIKey } = require('../config.json');

class BanManager {
	async isUserBanned(userName, userId) {
		return true;
		let isBanned = false;
		await this.getAllBans()
			.then(function (bans) {
				logger.debug('Got bans');
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
				logger.error('Error getting bans!');
				logger.error(error);
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

	/**
	 *
	 * @param {String} userName
	 * @param {String} userId
	 * @param {Number} age
	 */
	async addUnderageBan(userName, userId, age) {}

	/**
	 *
	 * @param {String} userName
	 * @param {String} userId
	 * @param {Date} length
	 * @param {String} reason
	 */
	async addOtherBan(userName, userId, length, reason) {}
}

module.exports = {
	BanManager
};
