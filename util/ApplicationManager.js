const log4js = require('log4js');
const logger = log4js.getLogger('ApplicationManager');
const { logLevel } = require('../config.json');
const { DatabaseManager } = require('./DatabaseManager');
logger.level = logLevel;

class ApplicationManager {
	constructor() {
		this._cachedApplications = new Map();
		this._dbManager = new DatabaseManager(null, null, null, null);
	}

	async init() {
		await this._dbManager.init();
	}

	/**
	 * Gets an application from the cache if cached, otherwise fetches from database
	 *
	 * @param {String} userId
	 * @returns {MLEApplication} The application
	 */
	async getApplication(userId) {
		if (this._cachedApplications.has(userId)) {
			logger.debug('Got application from cache');
			return this._cachedApplications.get(userId);
		} else {
			logger.debug('Got application from DB');
			return this.fetchApplication(userId);
		}
	}

	async fetchApplication(userId) {
		return this._dbManager.getApplication(userId);
	}

	async saveApplication(userId, application) {
		logger.debug(`Saving application for ${userId}`);
		logger.debug(application);
		this._cachedApplications.set(userId, application);
	}

	async createNewApplication(userId, userName, userAvatar) {
		return this._dbManager.createNewApplication(userId, userName, userAvatar);
	}

	/**
	 * Writes the cached applications to the database and clears the cache
	 * Runs on a timer, every 5 minutes
	 */
	writeApplications() {
		logger.debug('Writing applications...');
		this._cachedApplications.forEach((application, userId) => {
			this._dbManager.saveApplication(application).then(() => {
				// this._cachedApplications.delete(userId);
			});
		});
	}
}

module.exports = {
	ApplicationManager
};
