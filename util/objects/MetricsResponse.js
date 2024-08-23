const { EmbedBuilder } = require('discord.js');
const log4js = require('log4js');
const logger = log4js.getLogger('MetricsResponse');
const { logLevel } = require('../../config.json');
const { convertDate, mapToString } = require('../utils');
logger.level = logLevel;

class MetricsResponse {
	/**
	 * Creates a new MetricsResponse
	 * @param {Number} startDate
	 * @param {Number} endDate
	 */
	constructor(startDate, endDate) {
		this._startDate = startDate;
		this._endDate = endDate;
	}

	/**
	 *
	 * @returns {Number}
	 */
	getStartDate() {
		return this._startDate;
	}

	/**
	 *
	 * @returns {Number}
	 */
	getEndDate() {
		return this._endDate;
	}

	/**
	 * Sets the number of applications submitted in the timeframe
	 * @param {Number} count
	 */
	setApplicationCount(count) {
		this._applicationCount = count;
	}

	/**
	 *
	 * @returns {Number} The number of applications submitted
	 */
	getApplicationCount() {
		return this._applicationCount;
	}

	/**
	 * Sets the referrals
	 * @param {Map} referrals A map with counts of each referral type
	 */
	setReferralMap(referrals) {
		this._referrals = referrals;
	}

	/**
	 *
	 * @returns {Map} The referral data
	 */
	getReferralMap() {
		return this._referrals;
	}

	/**
	 * Sets the leagues
	 * @param {Map} leagues A map with counts of each league
	 */
	setLeagueMap(leagues) {
		this._leagues = leagues;
	}

	/**
	 *
	 * @returns {Map} The league data
	 */
	getLeagueMap() {
		return this._leagues;
	}

	/**
	 * Printout of the metrics
	 * @returns {EmbedBuilder} An embed containing the metrics
	 */
	toString() {
		return new EmbedBuilder()
			.setColor('#00ff00')
			.setTitle(`MLE Admissions Metrics`)
			.setFooter({ text: `${convertDate(this.getStartDate())}-${convertDate(this.getEndDate())}` })
			.setTimestamp()
			.setThumbnail(
				'https://cdn.discordapp.com/emojis/1270034202548768868.webp?size=128&quality=lossless'
			)
			.addFields(
				{
					name: 'Application Count',
					value: this.getApplicationCount().toString()
				},
				{
					name: 'Referral Data',
					value: mapToString(this.getReferralMap())
				},
				{
					name: 'League Data',
					value: mapToString(this.getLeagueMap())
				}
			);
	}
}

module.exports = {
	MetricsResponse
};
